'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVolunteerRequests, updateRequestStatus } from '@/lib/firebase/firestore';
import type { EmergencyRequest } from '@/lib/types';
import { AlertCircle, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VolunteerDashboard() {
  const searchParams = useSearchParams();
  const volunteerId = searchParams.get('id');
  
  const [assignedRequests, setAssignedRequests] = useState<EmergencyRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (volunteerId) {
      const unsubscribe = getVolunteerRequests(volunteerId, (assigned, history) => {
        setAssignedRequests(assigned);
        setHistoryRequests(history);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [volunteerId]);

  const handleMarkAsResolved = async (requestId: string) => {
    await updateRequestStatus(requestId, 'تم الحل');
  };

  const RequestCard = ({ request }: { request: EmergencyRequest }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {request.priorityLevel === 'critical' ? '🔴' : request.priorityLevel === 'high' ? '🟠' : '🟡'}
          طلب {getPriorityText(request.priorityLevel)}
        </CardTitle>
        <CardDescription>
          {new Date(request.timestamp).toLocaleString('ar-EG')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{request.requestText}</p>
        <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> <strong>الموقع:</strong> {request.location}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary"/> <strong>هاتف التواصل:</strong> {request.contactPhone}</p>
        </div>
        {request.status === 'تم التعيين' && (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleMarkAsResolved(request.id)}>
                <CheckCircle className="ml-2 h-4 w-4" />
                وضع علامة "تم الحل"
            </Button>
        )}
         {request.status !== 'تم التعيين' && (
             <Badge variant={request.status === 'تم الحل' ? 'default' : 'destructive'} className={request.status === 'تم الحل' ? 'bg-green-500' : ''}>
                {request.status}
             </Badge>
         )}
      </CardContent>
    </Card>
  );

  const getPriorityText = (priority: EmergencyRequest['priorityLevel']) => {
    switch (priority) {
        case 'critical': return 'حرج';
        case 'high': return 'عالي';
        case 'medium': return 'متوسط';
        case 'low': return 'منخفض';
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }
  
  if (!volunteerId) {
    return (
        <div className="flex flex-col justify-center items-center h-screen p-4">
             <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>معرف المتطوع غير موجود. يرجى تسجيل الدخول مرة أخرى.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-3xl">لوحة تحكم المتطوعين</CardTitle>
            <CardDescription>عرض المهام المعينة لك وسجل الطلبات.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="assigned" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assigned">الطلبات المعينة</TabsTrigger>
                    <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
                </TabsList>
                <TabsContent value="assigned">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        {assignedRequests.length > 0 ? (
                            assignedRequests.map(req => <RequestCard key={req.id} request={req} />)
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground py-8">لا توجد طلبات معينة لك حاليًا.</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="history">
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        {historyRequests.length > 0 ? (
                            historyRequests.map(req => <RequestCard key={req.id} request={req} />)
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground py-8">لا يوجد شيء في سجلك حتى الآن.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
