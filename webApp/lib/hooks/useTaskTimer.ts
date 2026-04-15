'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY_PREFIX = 'task_session_';
const MAX_SESSION_HOURS = 24;

/** Auto-pause after this many milliseconds of continuous running (1 hour) */
export const AUTO_PAUSE_MS = 60 * 60 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

type TimerState = 'running' | 'paused' | 'auto_paused';

interface TimerSegment {
    startedAt: string;  // ISO — when this running segment began
    pausedAt?: string;  // ISO — when it was paused (undefined if still running)
}

/**
 * Full session stored in localStorage.
 * `segments` is a list of running intervals.
 * The last segment is the active one; if it has no `pausedAt` it is currently running.
 */
interface TaskSession {
    taskId: number;
    projectId?: number;
    /** Date of the first segment start (YYYY-MM-DD) — used as the time-log date */
    date: string;
    /** Wall-clock time of the very first start (HH:MM:SS) */
    firstStartTime: string;
    /** Accumulated ms from all completed (paused) segments */
    accumulatedMs: number;
    segments: TimerSegment[];
    state: TimerState;
}

interface StoppedSession {
    taskId: number;
    projectId?: number;
    date: string;
    start_time: string;
    end_time: string;
    hours: number;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function sessionKey(taskId: number): string {
    return `${SESSION_KEY_PREFIX}${taskId}`;
}

export function getSession(taskId: number): TaskSession | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(sessionKey(taskId));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as TaskSession;
    } catch {
        return null;
    }
}

function saveSession(session: TaskSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(sessionKey(session.taskId), JSON.stringify(session));
}

function clearSession(taskId: number): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(sessionKey(taskId));
}

// ─── Session operations ───────────────────────────────────────────────────────

/** Start a brand-new session for a task. */
export function startSession(taskId: number, projectId?: number): void {
    const now = new Date();
    const session: TaskSession = {
        taskId,
        projectId,
        date: format(now, 'yyyy-MM-dd'),
        firstStartTime: format(now, 'HH:mm:ss'),
        accumulatedMs: 0,
        segments: [{ startedAt: now.toISOString() }],
        state: 'running',
    };
    saveSession(session);
}

/** Pause a running session. Returns false if session doesn't exist or isn't running. */
export function pauseSession(taskId: number): boolean {
    const session = getSession(taskId);
    if (!session || session.state !== 'running') return false;

    const now = new Date().toISOString();
    const lastSegment = session.segments[session.segments.length - 1];

    // Accumulate ms for this segment
    const segMs = new Date(now).getTime() - new Date(lastSegment.startedAt).getTime();

    const updated: TaskSession = {
        ...session,
        accumulatedMs: session.accumulatedMs + segMs,
        segments: [
            ...session.segments.slice(0, -1),
            { ...lastSegment, pausedAt: now },
        ],
        state: 'paused',
    };
    saveSession(updated);
    return true;
}

/** Auto-pause: same as pause but marks state as 'auto_paused'. */
export function autoPauseSession(taskId: number): boolean {
    const session = getSession(taskId);
    if (!session || session.state !== 'running') return false;

    const now = new Date().toISOString();
    const lastSegment = session.segments[session.segments.length - 1];
    const segMs = new Date(now).getTime() - new Date(lastSegment.startedAt).getTime();

    const updated: TaskSession = {
        ...session,
        accumulatedMs: session.accumulatedMs + segMs,
        segments: [
            ...session.segments.slice(0, -1),
            { ...lastSegment, pausedAt: now },
        ],
        state: 'auto_paused',
    };
    saveSession(updated);
    return true;
}

/** Resume a paused (or auto-paused) session. Returns false if not paused. */
export function resumeSession(taskId: number): boolean {
    const session = getSession(taskId);
    if (!session || session.state === 'running') return false;

    const updated: TaskSession = {
        ...session,
        segments: [
            ...session.segments,
            { startedAt: new Date().toISOString() },
        ],
        state: 'running',
    };
    saveSession(updated);
    return true;
}

/**
 * Stop the session entirely, compute total hours, and clear from localStorage.
 * Returns the data needed to create a VolunteerTimeLog, or null if no session.
 */
export function stopSession(taskId: number): StoppedSession | null {
    const session = getSession(taskId);
    if (!session) return null;

    const now = new Date();
    let totalMs = session.accumulatedMs;

    // Add current running segment if still active
    const lastSegment = session.segments[session.segments.length - 1];
    if (!lastSegment.pausedAt) {
        totalMs += now.getTime() - new Date(lastSegment.startedAt).getTime();
    }

    const rawHours = totalMs / (1000 * 60 * 60);
    const cappedHours = Math.min(rawHours, MAX_SESSION_HOURS);
    const hours = Math.max(0.25, parseFloat(cappedHours.toFixed(2)));

    const result: StoppedSession = {
        taskId,
        projectId: session.projectId,
        date: session.date,
        start_time: session.firstStartTime,
        end_time: format(now, 'HH:mm:ss'),
        hours,
    };

    clearSession(taskId);
    return result;
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

/**
 * Compute total elapsed ms for a session (including any currently-running segment).
 */
function getTotalElapsedMs(session: TaskSession): number {
    let total = session.accumulatedMs;
    const last = session.segments[session.segments.length - 1];
    if (!last.pausedAt) {
        total += Date.now() - new Date(last.startedAt).getTime();
    }
    return total;
}

/** How many ms have elapsed since the current running segment started. */
function getCurrentSegmentMs(session: TaskSession): number {
    if (session.state !== 'running') return 0;
    const last = session.segments[session.segments.length - 1];
    return Date.now() - new Date(last.startedAt).getTime();
}

function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

// ─── React hook ───────────────────────────────────────────────────────────────

interface TaskTimerState {
    /** Formatted total elapsed time "HH:MM:SS", or null if no session */
    elapsed: string | null;
    /** Current timer state, or null if no session */
    timerState: TimerState | null;
    /** True when the current running segment has exceeded AUTO_PAUSE_MS */
    shouldAutoPause: boolean;
}

/**
 * Reactive hook that tracks a task's timer state every second.
 * Exposes elapsed time, state (running/paused/auto_paused), and
 * a `shouldAutoPause` flag when the running segment exceeds 1 hour.
 */
export function useTaskTimer(taskId: number): TaskTimerState {
    const [elapsed, setElapsed] = useState<string | null>(null);
    const [timerState, setTimerState] = useState<TimerState | null>(null);
    const [shouldAutoPause, setShouldAutoPause] = useState(false);
    // Track which interval boundary we last fired the auto-pause for, to avoid double-firing
    const autoPauseFiredRef = useRef(false);

    const tick = useCallback(() => {
        const session = getSession(taskId);

        if (!session) {
            setElapsed(null);
            setTimerState(null);
            setShouldAutoPause(false);
            autoPauseFiredRef.current = false;
            return;
        }

        const totalMs = getTotalElapsedMs(session);
        setElapsed(formatElapsed(totalMs));
        setTimerState(session.state);

        if (session.state === 'running') {
            const segMs = getCurrentSegmentMs(session);
            if (segMs >= AUTO_PAUSE_MS && !autoPauseFiredRef.current) {
                autoPauseFiredRef.current = true;
                setShouldAutoPause(true);
            } else if (segMs < AUTO_PAUSE_MS) {
                autoPauseFiredRef.current = false;
                setShouldAutoPause(false);
            }
        } else {
            autoPauseFiredRef.current = false;
            setShouldAutoPause(false);
        }
    }, [taskId]);

    useEffect(() => {
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [tick]);

    return { elapsed, timerState, shouldAutoPause };
}
