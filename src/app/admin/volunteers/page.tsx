'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, XCircle, Clock } from 'lucide-react';

const initialVolunteers: Volunteer[] = [
  { id: '1', fullName: 'فاطمة الأمين', gender: 'أنثى', region: 'الخرطوم', city: 'الخرطوم', profession: 'طبيبة', phoneNumber: '+249 912 345 678', status: 'تم التحقق' },
  { id: '2', fullName: 'أحمد إبراهيم', gender: 'ذكر', region: 'الجزيرة', city: 'ود مدني', profession: 'ممرض', phoneNumber: '+249 923 456 789', status: 'تم التحقق' },
  { id: '3', fullName: 'موسى آدم', gender: 'ذكر', region: 'شمال كردفان', city: 'الأبيض', profession: 'سائق', phoneNumber: '+249 123 456 789', status: 'قيد الانتظار' },
  { id: '4', fullName: 'ليلى حسن', gender: 'أنثى', region: 'البحر الأحمر', city: 'بورتسودان', profession: 'مسعفة', phoneNumber: '+249 999 888 777', status: 'قيد الانتظار' },
  { id: '5', fullName: 'يوسف خالد', gender: 'ذكر', region: 'الخرطوم', city: 'أم درمان', profession: 'صيدلي', phoneNumber: '+249 111 222 333', status: 'مرفوض' },
];

export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);

    const handleStatusChange = (id: string, status: Volunteer['status']) => {
        setVolunteers(volunteers.map(v => v.id === id ? { ...v, status } : v));
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
