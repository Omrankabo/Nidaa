
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardClient from './dashboard-client';

/**
 * The main page component for the volunteer dashboard.
 * It's a server component that wraps the main client component in a Suspense boundary.
 * This is the recommended pattern for pages that need to access URL search parameters.
 * @param {{ searchParams: { email?: string } }} props - The page props, including searchParams.
 */
export default function VolunteerDashboardPage({ searchParams }: { searchParams: { email?: string }}) {
  const volunteerEmail = searchParams.email || null;

  return (
    // The Suspense boundary shows a loading spinner while the client component and its data are being loaded.
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
      <DashboardClient volunteerEmail={volunteerEmail} />
    </Suspense>
  );
}

