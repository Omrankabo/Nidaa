
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardClient from './dashboard-client';

export default function VolunteerDashboardPage({ searchParams }: { searchParams: { email?: string }}) {
  const volunteerEmail = searchParams.email || null;

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
      <DashboardClient volunteerEmail={volunteerEmail} />
    </Suspense>
  );
}
