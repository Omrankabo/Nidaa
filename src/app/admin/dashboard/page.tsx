'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest, Volunteer } from '@/lib/types';
import { AlertCircle, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRequests, getVolunteers, updateRequest, updateVolunteerStatus } from '@/lib/firebase/firestore';
import { findAndAssignVolunteer } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const FormattedDate = ({ timestamp }: { timestamp: string }) => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    if (!isMounted) {
      return null;
    }
  
    return <>{new Date(timestamp).toLocaleString('ar-EG')}</>;
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
    }, () => {});

    return () => {
        unsubscribeRequests();
        unsubscribeVolunteers();
    };
  }, []);

  const handleAutoMatch = async (requestId: string) => {
    const requestToMatch = requests.find(r => r.id === requestId);
    if (requestToMatch) {
      const result = await findAndAssignVolunteer(requestToMatch);
      if (result.success && result.volunteer) {
        await updateRequest(requestId, { status: 'تم التعيين', assignedVolunteer: result.volunteer.fullName, volunteerId: result.volunteer.id });
      } else {
        alert(result.error || 'لم يتم العثور على متطوع مطابق.');
      }
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

  const pendingVolunteers = volunteers.filter(v => v.status === 'قيد الانتظار');
  const regions = [...new Set(requests.map(r => r.location.split(',')[0].trim()))];
  const filteredRequests = regionFilter === 'all' ? requests : requests.filter(r => r.location.startsWith(regionFilter));
  
  const requestByRegionCount = requests.reduce((acc, req) => {
    const region = req.location.split(',')[0].trim();
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
                                        <Button size="sm" variant="destructive" onClick={() => updateVolunteerStatus(v.id, 'مرفوض')}>الرفض</Button>
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
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline">جميع طلبات الطوارئ</CardTitle>
                    <CardDescription>قائمة بجميع الطلبات الواردة، مرتبة حسب الوقت.</CardDescription>
                </div>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-[180px]">
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
            <div className="max-h-[70vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>تفاصيل الطلب</TableHead>
                        <TableHead className="w-[120px] text-center">الأولوية</TableHead>
                        <TableHead className="w-[120px] text-center hidden sm:table-cell">الحالة</TableHead>
                         <TableHead className="w-[180px] text-center hidden md:table-cell">المتطوع المعين</TableHead>
                        <TableHead className="w-[200px] text-center">الإجراء</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                        <TableCell>
                            <p className="font-medium">{req.requestText}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-semibold">السبب:</span> {req.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                <FormattedDate timestamp={req.timestamp} />
                            </p>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getPriorityBadgeVariant(req.priorityLevel)}>
                            {getPriorityText(req.priorityLevel)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">{getStatusBadge(req.status)}</TableCell>
                         <TableCell className="text-center hidden md:table-cell">{req.assignedVolunteer || 'غير معين'}</TableCell>
                        <TableCell className="text-center">
                            {req.status === 'قيد الانتظار' ? (
                                <Button size="sm" onClick={() => handleAutoMatch(req.id)}>
                                    <UserPlus className="ml-2 h-4 w-4" />
                                    مطابقة تلقائية
                                </Button>
                            ) : (
                                 <span className="sm:hidden">{getStatusBadge(req.status)}</span>
                            )}
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
