'use client';

import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { VolunteerDashboard } from '@/components/dashboards/volunteer-dashboard';
import { ProjectManagerDashboard } from '@/components/dashboards/pm-dashboard';
import { StaffMemberDashboard } from '@/components/dashboards/staff-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';

export default function PortalPage() {
    const { user } = useAuth();

    // Role-based dashboard rendering
    switch(user?.user_type) {
        case 'volunteer':
            return <VolunteerDashboard />;
        case 'project_manager':
            return <ProjectManagerDashboard />;
        case 'staff_member':
            return <StaffMemberDashboard />;
        case 'admin':
            return <AdminDashboard />;
        default:
            return (
                <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Unauthorized</h1>
                        <p className="text-muted-foreground mt-2">
                            Please contact an administrator for access.
                        </p>
                    </div>
                </div>
            );
    }
}
