
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest, Volunteer } from '@/lib/types';
import { AlertCircle, UserPlus, CheckCircle, Clock, Trash2, Info, MoreHorizontal, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRequests, getVolunteers, updateRequest, updateVolunteerStatus, deleteRequest, deleteVolunteer } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const FormattedDate = ({ timestamp }: { timestamp: any }) => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    if (!isMounted) {
      return null;
    }

    const date = new Date(timestamp);
  
    return <>{date.toLocaleString('ar-EG')}</>;
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    const unsubscribeRequests = getRequests((data) => {
        setRequests(data);
        setLoading(false);
    });
    const unsubscribeVolunteers = getVolunteers((data) => {
        setVolunteers(data);
    });

    return () => {
        unsubscribeRequests();
        unsubscribeVolunteers();
    };
  }, []);
  
  const handleAssign = async (requestId: string, volunteer: Volunteer) => {
    const eta = `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5) + 15} دقائق`;
    await updateRequest(requestId, {
        status: 'تم التعيين',
        assignedVolunteer: volunteer.fullName,
        volunteerId: volunteer.id,
        eta: eta,
    });
  };

  const handlePriorityChange = async (requestId: string, priorityLevel: EmergencyRequest['priorityLevel']) => {
    await updateRequest(requestId, { priorityLevel });
  };
  
  const handleStatusChange = async (requestId: string, status: EmergencyRequest['status']) => {
      await updateRequest(requestId, { status });
  };
  
  const handleDeleteRequest = async (requestId: string) => {
      await deleteRequest(requestId);
  };

  const handleVolunteerDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المتطوع؟')) {
        await deleteVolunteer(id);
    }
  };


  const getPriorityBadgeVariant = (priority: EmergencyRequest['priorityLevel']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };
  
  const getPriorityText = (priority: EmergencyRequest['priorityLevel']) => {
      switch (priority) {
          case 'critical': return 'حرج';
          case 'high': return 'عالي';
          case 'medium': return 'متوسط';
          case 'low': return 'منخفض';
      }
  }

  const getStatusBadge = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'تم التعيين': return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="ml-1 h-3 w-3" />تم التعيين</Badge>;
      case 'قيد الانتظار': return <Badge variant="secondary"><Clock className="ml-1 h-3 w-3" />قيد الانتظار</Badge>;
      case 'تم الحل': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="ml-1 h-3 w-3" />تم الحل</Badge>;
      case 'تم الإلغاء': return <Badge variant="destructive"><AlertCircle className="ml-1 h-3 w-3" />تم الإلغاء</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingVolunteers = volunteers.filter(v => v.status !== 'تم التحقق');
  const regions = [...new Set(requests.map(r => r.location.split(',')[0].trim()))];
  const filteredRequests = regionFilter === 'all' ? requests : requests.filter(r => r.location.startsWith(regionFilter));
  
  const requestByRegionCount = requests.reduce((acc, req) => {
    const region = req.location.split(',')[0].trim();
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const verifiedVolunteers = volunteers.filter(v => v.status === 'تم التحقق');
  const khartoumVolunteers = verifiedVolunteers.filter(v => v.region === 'الخرطوم');

  if (loading) {
    return <div className="flex justify-center items-center h-full"><AlertCircle className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
       <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline">طلبات تسجيل المتطوعين الجديدة</CardTitle>
                    <Badge variant="default" className="text-lg">{pendingVolunteers.length}</Badge>
                </div>
                <CardDescription>الموافقة على أو رفض طلبات المتطوعين الجدد.</CardDescription>
            </CardHeader>
            <CardContent>
                {pendingVolunteers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم الكامل</TableHead>
                                <TableHead>الموقع</TableHead>
                                <TableHead>الإجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingVolunteers.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell>{v.fullName}</TableCell>
                                    <TableCell>{v.city}, {v.region}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateVolunteerStatus(v.id, 'تم التحقق')}>الموافقة</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleVolunteerDelete(v.id)}>الرفض</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <p>لا توجد طلبات تسجيل جديدة.</p>}
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تحليلات الطلبات</CardTitle>
          <CardDescription>نظرة عامة على الطلبات حسب المنطقة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(requestByRegionCount).map(([region, count]) => (
            <Card key={region}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{region}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="font-headline">جميع طلبات الطوارئ</CardTitle>
                    <CardDescription>قائمة بجميع الطلبات الواردة، مرتبة حسب الوقت.</CardDescription>
                </div>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="تصفية حسب المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل المناطق</SelectItem>
                        {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
        {filteredRequests.length > 0 ? (
            <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[300px]">تفاصيل الطلب</TableHead>
                        <TableHead className="w-[150px] text-center">الأولوية</TableHead>
                        <TableHead className="w-[170px] text-center hidden sm:table-cell">الحالة</TableHead>
                         <TableHead className="w-[180px] text-center hidden md:table-cell">المتطوع المعين</TableHead>
                        <TableHead className="w-[250px] text-center">الإجراء</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                        <TableCell>
                            <p className="font-medium truncate max-w-xs">{req.requestText}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                <FormattedDate timestamp={req.timestamp} />
                            </p>
                        </TableCell>
                        <TableCell className="text-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                     <Button variant={getPriorityBadgeVariant(req.priorityLevel)} className="w-24">
                                        {getPriorityText(req.priorityLevel)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'critical')}>حرج</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'high')}>عالي</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'medium')}>متوسط</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange(req.id, 'low')}>منخفض</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="w-32">
                                         {getStatusBadge(req.status)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'قيد الانتظار')}>قيد الانتظار</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'تم التعيين')}>تم التعيين</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'تم الحل')}>تم الحل</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'تم الإلغاء')}>تم الإلغاء</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                         <TableCell className="text-center hidden md:table-cell">{req.assignedVolunteer || 'غير معين'}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-1">
                                {req.status === 'قيد الانتظار' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm"><UserPlus className="ml-2 h-4 w-4" />مطابقة</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>اختر متطوعًا</DialogTitle>
                                                <DialogDescription>اختر متطوعًا متاحًا من منطقة الخرطوم.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {khartoumVolunteers.length > 0 ? khartoumVolunteers.map(v => (
                                                    <div key={v.id} className="flex justify-between items-center p-2 border rounded-md">
                                                        <div>
                                                            <p className="font-semibold">{v.fullName}</p>
                                                            <p className="text-sm text-muted-foreground">{v.profession}</p>
                                                        </div>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" onClick={() => handleAssign(req.id, v)}>تعيين</Button>
                                                        </DialogTrigger>
                                                    </div>
                                                )) : <p>لا يوجد متطوعون متاحون في الخرطوم.</p>}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {req.status === 'تم التعيين' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline"><UserCheck className="ml-2 h-4 w-4" />إعادة تعيين</Button>
                                        </DialogTrigger>
                                         <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>إعادة تعيين متطوع</DialogTitle>
                                                <DialogDescription>اختر متطوعًا مختلفًا لهذا الطلب.</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {verifiedVolunteers.map(v => (
                                                    <div key={v.id} className="flex justify-between items-center p-2 border rounded-md">
                                                        <div>
                                                            <p className="font-semibold">{v.fullName}</p>
                                                            <p className="text-sm text-muted-foreground">{v.region} - {v.profession}</p>
                                                        </div>
                                                         <DialogTrigger asChild>
                                                            <Button size="sm" onClick={() => handleAssign(req.id, v)} disabled={v.id === req.volunteerId}>
                                                                {v.id === req.volunteerId ? 'معين حاليًا' : 'تعيين'}
                                                            </Button>
                                                        </DialogTrigger>
                                                    </div>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>تفاصيل الطلب الكاملة</DialogTitle>
                                            <DialogDescription>
                                                معرف الطلب: {req.id}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                                            <div>
                                                <h4 className="font-semibold">نص الطلب:</h4>
                                                <p className="p-2 bg-muted rounded-md whitespace-pre-wrap break-words">{req.requestText}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">الموقع:</h4>
                                                <p>{req.location}</p>
                                            </div>
                                             <div>
                                                <h4 className="font-semibold">هاتف التواصل:</h4>
                                                <p>{req.contactPhone}</p>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            سيؤدي هذا إلى حذف هذا الطلب بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteRequest(req.id)}>حذف</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <span className="sm:hidden ml-2">{getStatusBadge(req.status)}</span>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>لا توجد طلبات</AlertTitle>
                <AlertDescription>
                    لا توجد طلبات تطابق الفلتر الحالي.
                </AlertDescription>
            </Alert>
        )}
        </CardContent>
    </Card>
    </div>
  );
}

    