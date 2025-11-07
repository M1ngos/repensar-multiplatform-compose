'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderTree,
  CheckSquare,
  Users,
  FileText,
  Loader2,
  Leaf,
} from 'lucide-react';
import { searchApi, SearchResults } from '@/lib/api/search';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchApi.globalSearch({ q: query, limit: 10 });
        // Ensure all arrays exist
        setResults({
          projects: searchResults.projects || [],
          tasks: searchResults.tasks || [],
          volunteers: searchResults.volunteers || [],
        });
      } catch (error) {
        console.error('Search failed:', error);
        // Set empty results on error
        setResults({
          projects: [],
          tasks: [],
          volunteers: [],
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      setOpen(false);
      callback();
    },
    []
  );

  const navigateToProject = useCallback(
    (id: number) => {
      handleSelect(() => router.push(`/portal/projects/${id}`));
    },
    [handleSelect, router]
  );

  const navigateToTask = useCallback(
    (id: number) => {
      handleSelect(() => router.push(`/portal/tasks/${id}`));
    },
    [handleSelect, router]
  );

  const navigateToVolunteer = useCallback(
    (id: number) => {
      handleSelect(() => router.push(`/portal/volunteers/${id}`));
    },
    [handleSelect, router]
  );

  const quickActions = [
    {
      label: 'New Project',
      icon: FolderTree,
      action: () => handleSelect(() => router.push('/portal/projects?action=new')),
    },
    {
      label: 'New Task',
      icon: CheckSquare,
      action: () => handleSelect(() => router.push('/portal/tasks?action=new')),
    },
    {
      label: 'Register Volunteer',
      icon: Users,
      action: () => handleSelect(() => router.push('/portal/volunteers?action=register')),
    },
    {
      label: 'View Analytics',
      icon: FileText,
      action: () => handleSelect(() => router.push('/portal/analytics')),
    },
  ];

  const hasResults = results && (
    (results.projects?.length ?? 0) > 0 ||
    (results.tasks?.length ?? 0) > 0 ||
    (results.volunteers?.length ?? 0) > 0
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search projects, tasks, volunteers..."
          value={query}
          onValueChange={setQuery}
          className="border-0 focus:ring-0"
        />
        {isSearching && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </div>
      <CommandList>
        <CommandEmpty>
          {query.length < 2 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              <Leaf className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Type at least 2 characters to search</p>
              <p className="text-xs mt-1">
                Or press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-6">
              No results found for "{query}"
            </div>
          )}
        </CommandEmpty>

        {query.length === 0 && (
          <CommandGroup heading="Quick Actions" className="p-2">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={action.action}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
              >
                <div className="p-1.5 rounded bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results && results.projects && results.projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects" className="p-2">
              {results.projects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => navigateToProject(project.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                >
                  <div className="p-1.5 rounded bg-forest/10">
                    <FolderTree className="h-4 w-4 text-forest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      project.status === 'completed'
                        ? 'bg-growth/10 text-growth'
                        : project.status === 'in_progress'
                        ? 'bg-sky/10 text-sky'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {project.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.tasks && results.tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks" className="p-2">
              {results.tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => navigateToTask(task.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                >
                  <div className="p-1.5 rounded bg-sky/10">
                    <CheckSquare className="h-4 w-4 text-sky" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      task.priority === 'high' || task.priority === 'critical'
                        ? 'bg-destructive/10 text-destructive'
                        : task.priority === 'medium'
                        ? 'bg-sunset/10 text-sunset'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {task.priority}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.volunteers && results.volunteers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Volunteers" className="p-2">
              {results.volunteers.map((volunteer) => (
                <CommandItem
                  key={volunteer.id}
                  onSelect={() => navigateToVolunteer(volunteer.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                >
                  <div className="p-1.5 rounded bg-amber/10">
                    <Users className="h-4 w-4 text-amber" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{volunteer.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {volunteer.total_hours_contributed} hours contributed
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      volunteer.volunteer_status === 'active'
                        ? 'bg-growth/10 text-growth'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {volunteer.volunteer_status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/50">
        <span>
          Press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">⌘K</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">Ctrl+K</kbd> to toggle
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↑↓</kbd> to navigate,{' '}
          <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">Enter</kbd> to select
        </span>
      </div>
    </CommandDialog>
  );
}
