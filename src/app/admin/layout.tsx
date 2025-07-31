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
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getHeaderTitle = () => {
    if (pathname.includes('/dashboard')) return 'لوحة تحكم الطوارئ';
    if (pathname.includes('/volunteers')) return 'إدارة المتطوعين';
    return 'لوحة التحكم';
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
            <Button variant="ghost" size="icon" className="mr-auto" asChild>
                <Link href="/"><LogOut /></Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div/>
          <h1 className="text-xl font-semibold font-headline text-center">
            {getHeaderTitle()}
          </h1>
          <SidebarTrigger />
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background/50 flex-grow">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
