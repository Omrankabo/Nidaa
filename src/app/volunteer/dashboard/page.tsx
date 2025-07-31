'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVolunteerRequests, updateRequestStatus, getVolunteerById, updateVolunteerProfile, deleteVolunteer } from '@/lib/firebase/firestore';
import type { EmergencyRequest, Volunteer } from '@/lib/types';
import { AlertCircle, CheckCircle, Clock, Loader2, MapPin, Phone, User, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// Mock data
const regions = ['الخرطوم', 'شمال كردفان', 'البحر الأحمر', 'الجزيرة', 'كسلا', 'النيل الأزرق'];


export default function VolunteerDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const volunteerId = searchParams.get('id');
  
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [assignedRequests, setAssignedRequests] = useState<EmergencyRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ profession: '', region: ''});

  useEffect(() => {
    if (volunteerId) {
      const unsubscribeVolunteer = getVolunteerById(volunteerId, (data) => {
        setVolunteer(data);
        if (data) {
          setEditForm({ profession: data.profession, region: data.region });
        }
        setLoading(false);
      });
      const unsubscribeRequests = getVolunteerRequests(volunteerId, (assigned, history) => {
        setAssignedRequests(assigned);
        setHistoryRequests(history);
      });
      return () => {
        unsubscribeVolunteer();
        unsubscribeRequests();
      };
    } else {
        setLoading(false);
    }
  }, [volunteerId]);

  const handleMarkAsResolved = async (requestId: string) => {
    await updateRequestStatus(requestId, 'تم الحل');
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!volunteerId) return;
      await updateVolunteerProfile(volunteerId, editForm);
      toast({ title: 'تم تحديث الملف الشخصي بنجاح' });
      setIsEditing(false);
  };
  
  const handleAccountDelete = async () => {
    if (!volunteerId || !auth.currentUser) return;
    if (window.confirm('هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك بشكل دائم.')) {
        try {
            await deleteVolunteer(volunteerId); // Deletes from Firestore
            await deleteUser(auth.currentUser); // Deletes from Firebase Auth
            toast({ title: 'تم حذف الحساب بنجاح' });
            router.push('/');
        } catch (error) {
            console.error("Error deleting account: ", error);
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل حذف الحساب. قد تحتاج إلى تسجيل الدخول مرة أخرى للمتابعة.' });
        }
    }
  };


  const RequestCard = ({ request }: { request: EmergencyRequest }) => {
    const timestamp = typeof request.timestamp === 'string' ? new Date(request.timestamp) : request.timestamp.toDate();
    return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {request.priorityLevel === 'critical' ? '🔴' : request.priorityLevel === 'high' ? '🟠' : '🟡'}
          طلب {getPriorityText(request.priorityLevel)}
        </CardTitle>
        <CardDescription>
          {timestamp.toLocaleString('ar-EG')}
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
  )};

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
  
  if (!volunteerId || !volunteer) {
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
        <Card className="mb-8">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-3xl">{volunteer.fullName}</CardTitle>
                        <CardDescription>المعرف: {volunteer.id} | المنطقة: {volunteer.region}</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={() => { signOut(auth); router.push('/login'); }}>تسجيل الخروج</Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle>الطلبات المكتملة</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{historyRequests.filter(r => r.status === 'تم الحل').length}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>الحالة</CardTitle></CardHeader>
                    <CardContent><Badge variant={volunteer.status === 'تم التحقق' ? 'default' : 'destructive'} className={volunteer.status === 'تم التحقق' ? 'bg-green-500 text-lg' : 'text-lg'}>{volunteer.status}</Badge></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>تعديل الملف الشخصي</CardTitle></CardHeader>
                    <CardContent><Button onClick={() => setIsEditing(!isEditing)}><Edit className="ml-2 h-4 w-4" />{isEditing ? 'إلغاء' : 'تعديل'}</Button></CardContent>
                </Card>
            </CardContent>
        </Card>

        {isEditing && (
            <Card className="mb-8">
                <CardHeader><CardTitle>تحديث الملف الشخصي</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                        <div>
                            <label htmlFor="profession" className="block text-sm font-medium text-gray-700">المهنة</label>
                            <Input id="profession" value={editForm.profession} onChange={(e) => setEditForm({...editForm, profession: e.target.value})} />
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-700">المنطقة</label>
                            <Select value={editForm.region} onValueChange={(value) => setEditForm({...editForm, region: value})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-4">
                            <Button type="submit">حفظ التغييرات</Button>
                            <Button type="button" variant="destructive" onClick={handleAccountDelete}><Trash2 className="ml-2 h-4 w-4"/> حذف الحساب</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )}

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-3xl">لوحة مهام المتطوعين</CardTitle>
            <CardDescription>عرض المهام المعينة لك وسجل الطلبات.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="assigned" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assigned">الطلبات المعينة ({assignedRequests.length})</TabsTrigger>
                    <TabsTrigger value="history">سجل الطلبات ({historyRequests.length})</TabsTrigger>
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
