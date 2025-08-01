
'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = () => {
    // Since we are not using Firebase auth, just redirect to login
    router.push('/login');
  }

  const getActiveTab = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/volunteers')) return 'volunteers';
    return 'dashboard';
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
                <Logo />
            </div>
            <div className="flex items-center gap-2 md:hidden">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
            </div>
          
            <div className="flex flex-1 items-center justify-end space-x-2">
                <nav className="flex items-center gap-2">
                    <ThemeToggle />
                     <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut />
                    </Button>
                </nav>
            </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
            <Tabs value={getActiveTab()} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dashboard" asChild>
                        <Link href="/admin/dashboard"><LayoutDashboard className="ml-2 h-4 w-4"/>لوحة التحكم</Link>
                    </TabsTrigger>
                    <TabsTrigger value="volunteers" asChild>
                        <Link href="/admin/volunteers"><Users className="ml-2 h-4 w-4"/>المتطوعين</Link>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            {children}
        </div>
      </main>
    </div>
  );
}
