
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { requestForToken } from '@/lib/firebase/messaging';
import { auth } from '@/lib/firebase/config';
import { LayoutDashboard, Users, LogOut, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Request notification permission on mount
    requestForToken().then(token => {
        if (token) {
            console.log('FCM Token:', token);
            toast({ title: 'تمكين الإشعارات', description: 'ستتلقى إشعارات للحالات الطارئة الجديدة.' });
        } else {
             toast({ variant: 'destructive', title: 'لم يتم تمكين الإشعارات', description: 'لن تتلقى تحديثات في الوقت الفعلي. يرجى تمكين الإشعارات في متصفحك.' });
        }
    });
  }, [toast]);
  
  const handleLogout = () => {
    auth.signOut();
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
          
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                     <Tabs value={getActiveTab()} className="mx-auto w-fit">
                        <TabsList>
                            <TabsTrigger value="dashboard" asChild>
                                <Link href="/admin/dashboard"><LayoutDashboard className="ml-2 h-4 w-4"/>لوحة التحكم</Link>
                            </TabsTrigger>
                            <TabsTrigger value="volunteers" asChild>
                                <Link href="/admin/volunteers"><Users className="ml-2 h-4 w-4"/>المتطوعون</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
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
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
