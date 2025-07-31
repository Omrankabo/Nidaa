'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, XCircle, Clock, AlertCircle } from 'lucide-react';
import { getVolunteers, updateVolunteerStatus } from '@/lib/firebase/firestore';


export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = getVolunteers(setVolunteers, setLoading);
      return () => unsubscribe();
    }, []);

    const handleStatusChange = async (id: string, status: Volunteer['status']) => {
        await updateVolunteerStatus(id, status);
    };

  const getStatusBadge = (status: Volunteer['status']) => {
    switch (status) {
      case 'تم التحقق':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="ml-1 h-3 w-3" />تم التحقق</Badge>;
      case 'قيد الانتظار':
        return <Badge variant="secondary"><Clock className="ml-1 h-3 w-3" />قيد الانتظار</Badge>;
      case 'مرفوض':
        return <Badge variant="destructive"><XCircle className="ml-1 h-3 w-3" />مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <AlertCircle className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">المتطوعون المسجلون</CardTitle>
        <CardDescription>عرض والتحقق من وإدارة جميع المستجيبين المسجلين في النظام.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم الكامل</TableHead>
                <TableHead className="hidden md:table-cell">الموقع</TableHead>
                <TableHead className="hidden lg:table-cell">المهنة</TableHead>
                <TableHead className="hidden sm:table-cell">رقم الهاتف</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                  <TableCell className="hidden md:table-cell">{volunteer.city}, {volunteer.region}</TableCell>
                  <TableCell className="hidden lg:table-cell">{volunteer.profession}</TableCell>
                  <TableCell className="hidden sm:table-cell">{volunteer.phoneNumber}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(volunteer.status)}</TableCell>
                  <TableCell className="text-left">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(volunteer.id, 'تم التحقق')}>
                                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                                <span>الموافقة</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(volunteer.id, 'مرفوض')}>
                                <XCircle className="ml-2 h-4 w-4 text-red-500" />
                                <span>الرفض</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
