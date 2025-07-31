
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardClient from './dashboard-client';

export default function VolunteerDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
      <DashboardClient />
    </Suspense>
  );
}
