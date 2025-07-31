
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Volunteer, EmergencyRequest } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, MoreHorizontal, XCircle, Clock, AlertCircle, Trash2, Bell } from 'lucide-react';
import { getVolunteers, updateVolunteerStatus, deleteVolunteer, getRequests, sendNotificationToVolunteer } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [regionFilter, setRegionFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribeVolunteers = getVolunteers(setVolunteers, setLoading);
        const unsubscribeRequests = getRequests(setRequests);
        return () => {
            unsubscribeVolunteers();
            unsubscribeRequests();
        };
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المتطوع؟')) {
            await deleteVolunteer(id);
        }
    };
    
    const handleSendNotification = async (volunteerId: string) => {
        const message = prompt("أدخل رسالة الإشعار:");
        if (message) {
            await sendNotificationToVolunteer(volunteerId, 'رسالة من المسؤول', message);
            toast({title: "تم إرسال الإشعار بنجاح"});
        }
    };

    const getHandledRequestsCount = (volunteerId: string) => {
        return requests.filter(req => req.volunteerId === volunteerId && req.status === 'تم الحل').length;
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
                        <CardDescription>عرض وإدارة جميع المستجيبين المعتمدين في النظام.</CardDescription>
                    </div>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="تصفية حسب المنطقة" />
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
                                <TableHead className="hidden sm:table-cell">الحالة</TableHead>
                                <TableHead className="hidden lg:table-cell">المنطقة</TableHead>
                                <TableHead className="hidden md:table-cell">الطلبات المكتملة</TableHead>
                                <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verifiedVolunteers.map((volunteer) => (
                                <TableRow key={volunteer.id}>
                                    <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{getStatusBadge(volunteer.status)}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{volunteer.region}</TableCell>
                                    <TableCell className="hidden md:table-cell text-center">{getHandledRequestsCount(volunteer.id)}</TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleSendNotification(volunteer.id)}>
                                                    <Bell className="ml-2 h-4 w-4 text-blue-500" />
                                                    <span>إرسال إشعار</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(volunteer.id)}>
                                                    <Trash2 className="ml-2 h-4 w-4 text-red-500" />
                                                    <span>حذف</span>
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
