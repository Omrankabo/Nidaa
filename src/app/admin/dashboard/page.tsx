'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmergencyRequest } from '@/lib/types';
import { AlertCircle, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRequests, updateRequest } from '@/lib/firebase/firestore';
import { findAndAssignVolunteer } from '@/lib/actions';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getRequests(setRequests, setLoading);
    return () => unsubscribe();
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
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
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
      case 'تم التعيين':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="ml-1 h-3 w-3" />تم التعيين</Badge>;
      case 'قيد الانتظار':
        return <Badge variant="secondary"><Clock className="ml-1 h-3 w-3" />قيد الانتظار</Badge>;
      case 'تم الحل':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="ml-1 h-3 w-3" />تم الحل</Badge>;
      case 'تم الإلغاء':
        return <Badge variant="destructive"><AlertCircle className="ml-1 h-3 w-3" />تم الإلغاء</Badge>;
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
        <CardTitle className="font-headline">طلبات الطوارئ ذات الأولوية</CardTitle>
        <CardDescription>
            قائمة بطلبات الطوارئ الواردة، مرتبة حسب الأولوية والوقت.
        </CardDescription>
        </CardHeader>
        <CardContent>
        {requests.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>تفاصيل الطلب</TableHead>
                        <TableHead className="w-[120px] text-center">الأولوية</TableHead>
                        <TableHead className="w-[120px] text-center hidden sm:table-cell">الحالة</TableHead>
                        <TableHead className="w-[200px] text-center">الإجراء</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {requests.map((req) => (
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
                        <TableCell className="text-center">
                            {req.status === 'قيد الانتظار' ? (
                                <Button size="sm" onClick={() => handleAutoMatch(req.id)}>
                                    <UserPlus className="ml-2 h-4 w-4" />
                                    مطابقة تلقائية
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="font-medium">{req.assignedVolunteer || 'غير معين'}</span>
                                    <span className="sm:hidden">{getStatusBadge(req.status)}</span>
                                </div>
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
                <AlertTitle>لا توجد طلبات نشطة</AlertTitle>
                <AlertDescription>
                    قائمة طلبات الطوارئ فارغة حاليًا. ستظهر الطلبات الجديدة ذات الأولوية هنا.
                </AlertDescription>
            </Alert>
        )}
        </CardContent>
    </Card>
  );
}
