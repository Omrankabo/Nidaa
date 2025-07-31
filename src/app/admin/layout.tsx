
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { LayoutDashboard, Users, LogOut, Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { requestForToken } from '@/lib/firebase/messaging';
import { useToast } from '@/hooks/use-toast';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    requestForToken().then(token => {
        if (token) {
            console.log('FCM Token:', token);
            // Here you would typically save the token to your database for the user
            toast({ title: 'تمكين الإشعارات', description: 'ستتلقى إشعارات للحالات الطارئة الجديدة.' });
        } else {
             toast({ variant: 'destructive', title: 'لم يتم تمكين الإشعارات', description: 'لن تتلقى تحديثات في الوقت الفعلي. يرجى تمكين الإشعارات في متصفحك.' });
        }
    });
  }, [toast]);


  const getHeaderTitle = () => {
    if (pathname.includes('/dashboard')) return 'لوحة تحكم الطوارئ';
    if (pathname.includes('/volunteers')) return 'إدارة المتطوعين';
    return 'لوحة التحكم';
  }

  const handleLogout = () => {
    router.push('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar side="right">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin/dashboard'} tooltip="لوحة التحكم">
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  <span>لوحة التحكم</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin/volunteers'} tooltip="المتطوعون">
                 <Link href="/admin/volunteers">
                  <Users />
                  <span>المتطوعون</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="person avatar" />
              <AvatarFallback>ادمن</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">المسؤول</span>
              <span className="text-xs text-foreground/70">admin@awni.sd</span>
            </div>
            <Button variant="ghost" size="icon" className="mr-auto" onClick={handleLogout}>
                <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center justify-between p-4 border-b bg-card shrink-0">
            <div/>
            <h1 className="text-xl font-semibold font-headline text-center">
              {getHeaderTitle()}
            </h1>
            <SidebarTrigger />
          </header>
          <main className="p-4 sm:p-6 lg:p-8 bg-background/50 flex-grow overflow-auto">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
