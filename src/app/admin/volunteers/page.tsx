
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer, EmergencyRequest } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, XCircle, Clock, AlertCircle, Trash2, Bell, Info } from 'lucide-react';
import { getVolunteers, updateVolunteerStatus, deleteVolunteer, getRequests, sendNotificationToVolunteer } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [regionFilter, setRegionFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribeVolunteers = getVolunteers((data) => {
            setVolunteers(data);
            setLoading(false);
        });
        const unsubscribeRequests = getRequests((data) => {
            setRequests(data);
        });
        return () => {
            unsubscribeVolunteers();
            unsubscribeRequests();
        };
    }, []);

    const handleDelete = async (id: string) => {
        await deleteVolunteer(id);
        toast({ title: 'تم حذف المتطوع بنجاح.' });
    };
    
    const handleSendNotification = async (volunteerId: string) => {
        const message = prompt("اكتب رسالة الإشعار:");
        if (message) {
            await sendNotificationToVolunteer(volunteerId, 'رسالة من الإدارة', message);
            toast({title: "تم إرسال الإشعار بنجاح"});
        }
    };

    const getHandledRequestsCount = (volunteerId: string) => {
        return requests.filter(req => req.volunteerId === volunteerId && req.status === 'اتحلت').length;
    };

    const getStatusBadge = (status: Volunteer['status']) => {
        switch (status) {
            case 'تم التحقق':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="ml-1 h-3 w-3" />مقبول</Badge>;
            case 'قيد الانتظار':
                return <Badge variant="secondary"><Clock className="ml-1 h-3 w-3" />قيد المراجعة</Badge>;
            case 'مرفوض':
                return <Badge variant="destructive"><XCircle className="ml-1 h-3 w-3" />مرفوض</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const allRegions = [...new Set(volunteers.map(v => v.region))];
    const filteredVolunteers = regionFilter === 'all' 
        ? volunteers 
        : volunteers.filter(v => v.region === regionFilter);
    
    const verifiedVolunteers = filteredVolunteers.filter(v => v.status === 'تم التحقق');

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline">إدارة المتطوعين</CardTitle>
                        <CardDescription>هنا يمكنك عرض وإدارة جميع المتطوعين المعتمدين في النظام.</CardDescription>
                    </div>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="فلتر حسب المنطقة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">كل المناطق</SelectItem>
                            {allRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم الكامل</TableHead>
                                <TableHead className="hidden sm:table-cell text-center">الحالة</TableHead>
                                <TableHead className="hidden lg:table-cell text-center">المنطقة</TableHead>
                                <TableHead className="hidden md:table-cell text-center">الطلبات المكتملة</TableHead>
                                <TableHead className="text-center">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verifiedVolunteers.map((volunteer) => (
                                <TableRow key={volunteer.id}>
                                    <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-center">{getStatusBadge(volunteer.status)}</TableCell>
                                    <TableCell className="hidden lg:table-cell text-center">{volunteer.region}</TableCell>
                                    <TableCell className="hidden md:table-cell text-center">{getHandledRequestsCount(volunteer.id)}</TableCell>
                                    <TableCell className="text-center">
                                         <div className="flex justify-center items-center gap-1">
                                             <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>تفاصيل المتطوع</DialogTitle>
                                                        <DialogDescription>
                                                            المعرف: {volunteer.id}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-2">
                                                        <p><strong>الاسم:</strong> {volunteer.fullName}</p>
                                                        <p><strong>البريد الإلكتروني:</strong> {volunteer.email}</p>
                                                        <p><strong>الهاتف:</strong> {volunteer.phoneNumber}</p>
                                                        <p><strong>المنطقة:</strong> {volunteer.region}</p>
                                                        <p><strong>المدينة:</strong> {volunteer.city}</p>
                                                        <p><strong>المهنة:</strong> {volunteer.profession}</p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="outline" size="icon" onClick={() => handleSendNotification(volunteer.id)}>
                                                <Bell className="h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                        هذا الإجراء سيحذف المتطوع نهائيًا.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(volunteer.id)}>حذف</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                         </div>
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
