
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { getVolunteers, updateVolunteerStatus, deleteVolunteer } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function PendingVolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeVolunteers = getVolunteers((data) => {
            setVolunteers(data);
            setLoading(false);
        });

        return () => {
            unsubscribeVolunteers();
        };
    }, []);

    const handleVolunteerDelete = async (id: string) => {
        await deleteVolunteer(id);
    };

    const pendingVolunteers = volunteers.filter(v => v.status === 'قيد الانتظار');

    if (loading) {
        return <div className="flex justify-center items-center h-full"><AlertCircle className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline">طلبات تسجيل المتطوعين الجدد</CardTitle>
                    <Badge variant="default" className="text-lg">{pendingVolunteers.length}</Badge>
                </div>
                <CardDescription>هنا يمكنك الموافقة على طلبات المتطوعين الجدد أو رفضها.</CardDescription>
            </CardHeader>
            <CardContent>
                {pendingVolunteers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم الكامل</TableHead>
                                <TableHead className="hidden sm:table-cell">البريد الإلكتروني</TableHead>
                                <TableHead className="hidden md:table-cell">المنطقة</TableHead>
                                <TableHead className="text-center">الإجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingVolunteers.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.fullName}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{v.email}</TableCell>
                                    <TableCell className="hidden md:table-cell">{v.city}, {v.region}</TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateVolunteerStatus(v.id, 'تم التحقق')}>موافقة</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive">رفض</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        سيؤدي هذا الإجراء إلى رفض طلب المتطوع وحذفه.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleVolunteerDelete(v.id)}>تأكيد الرفض</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <p>لا توجد طلبات تسجيل جديدة.</p>}
            </CardContent>
        </Card>
    );
}
