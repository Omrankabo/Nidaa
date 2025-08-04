
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVolunteerRequests, getVolunteerById, updateVolunteerProfile, deleteVolunteer, updateRequest } from '@/lib/firebase/firestore';
import type { EmergencyRequest, Volunteer } from '@/lib/types';
import { AlertCircle, CheckCircle, Clock, Loader2, MapPin, Phone, Edit, Trash2, Send, Check, X, LogOut, ArrowLeft, MessageSquarePlus, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { requestForToken } from '@/lib/firebase/messaging';
import { ThemeToggle } from '@/components/theme-toggle';
import Logo from '@/components/logo';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';


const regions = ['الخرطوم', 'شمال كردفان', 'البحر الأحمر', 'الجزيرة', 'كسلا', 'النيل الأزرق'];

/**
 * This is the main client component for the volunteer dashboard.
 * It fetches and displays the volunteer's data, assigned requests, and history.
 * It also handles profile updates, account deletion, and request status changes.
 * @param {{ volunteerEmail: string | null }} props - The email of the logged-in volunteer.
 */
export default function DashboardClient({ volunteerEmail }: { volunteerEmail: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  // The volunteer ID is derived from their email by replacing characters that are invalid in Firebase keys.
  const volunteerId = volunteerEmail ? volunteerEmail.replace(/[.#$[\]]/g, "_") : null;
  
  // State management for volunteer data, requests, loading status, and form inputs.
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [assignedRequests, setAssignedRequests] = useState<EmergencyRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ profession: '', region: ''});
  const [reportTexts, setReportTexts] = useState<Record<string, string>>({});

  // Effect hook to fetch initial data and subscribe to real-time updates.
  useEffect(() => {
    if (!volunteerId) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على معرّف المتطوع. يرجى تسجيل الدخول مرة أخرى.' });
        router.push('/login');
        return;
    }

    // Subscribe to volunteer profile updates.
    const unsubscribeVolunteer = getVolunteerById(volunteerId, (data) => {
        if (data) {
            setVolunteer(data);
            setEditForm({ profession: data.profession, region: data.region });
            // Register the device for push notifications upon successful data fetch.
            requestForToken(volunteerId);
        } else {
             toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على المتطوع. قد يكون الحساب قد تم حذفه.' });
             router.push('/login');
        }
        setLoading(false);
    });

    // Subscribe to updates on requests assigned to this volunteer.
    const unsubscribeRequests = getVolunteerRequests(volunteerId, (assigned, history) => {
        setAssignedRequests(assigned);
        setHistoryRequests(history);
        // Initialize reportTexts state for any history requests that have a report
        const initialReports = history.reduce((acc, req) => {
            if (req.report) {
                acc[req.id] = req.report;
            }
            return acc;
        }, {} as Record<string, string>);
        setReportTexts(prev => ({...prev, ...initialReports}));
    });

    // Cleanup subscriptions on component unmount.
    return () => {
        if (typeof unsubscribeVolunteer === 'function') {
          unsubscribeVolunteer();
        }
        if (typeof unsubscribeRequests === 'function') {
          unsubscribeRequests();
        }
    };

  }, [volunteerId, router, toast]);

  /**
   * Updates the status of a specific emergency request.
   * @param {string} requestId - The ID of the request to update.
   * @param {EmergencyRequest['status']} status - The new status to set.
   */
  const handleStatusUpdate = async (requestId: string, status: EmergencyRequest['status']) => {
    await updateRequest(requestId, { status });
    toast({ title: `تم تغيير حالة الطلب إلى "${status}"`});
  };
  
   /**
   * Handles denying a request. Unassigns the volunteer and sets status to 'Pending'.
   * @param {string} requestId - The ID of the request to deny.
   */
  const handleDenyRequest = async (requestId: string) => {
    await updateRequest(requestId, {
      status: 'في الانتظار',
      assignedVolunteer: '', // Remove volunteer name
      volunteerId: '',       // Remove volunteer ID
      eta: '',               // Clear ETA,
    });
    toast({ title: 'تم رفض الطلب بنجاح', description: 'سيعاد تعيين الطلب لمتطوع آخر.' });
  };
  
  /**
   * Handles the submission of the profile edit form.
   * @param {React.FormEvent} e - The form event.
   */
  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!volunteerId) return;
      await updateVolunteerProfile(volunteerId, editForm);
      toast({ title: 'تم تحديث ملفك الشخصي بنجاح' });
      setIsEditing(false);
  };
  
  /**
   * Handles the permanent deletion of the volunteer's account after confirmation.
   */
  const handleAccountDelete = async () => {
    if (!volunteerId) return;
    if (window.confirm('هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك بشكل دائم.')) {
        try {
            await deleteVolunteer(volunteerId);
            toast({ title: 'تم حذف الحساب بنجاح' });
            router.push('/');
        } catch (error) {
            console.error("Error deleting account: ", error);
            toast({ variant: 'destructive', title: 'خطأ', description: 'لم نتمكن من حذف الحساب. يرجى المحاولة مرة أخرى.' });
        }
    }
  };

  /**
   * Submits a report for a completed request.
   * @param {string} requestId - The ID of the request to add the report to.
   */
  const handleReportSubmit = async (requestId: string) => {
    const reportText = reportTexts[requestId];
    if (!reportText || !reportText.trim()) {
        toast({variant: 'destructive', title: 'لا يمكن أن تكون الملاحظة فارغة'});
        return;
    }
    await updateRequest(requestId, { report: reportText });
    toast({title: "تم إرسال الملاحظة بنجاح"});
  }
  
  const handleReportTextChange = (requestId: string, text: string) => {
    setReportTexts(prev => ({
        ...prev,
        [requestId]: text
    }));
  };

  const handleLogout = () => {
    router.push('/login');
  }

    const FormattedDateTime = ({ timestamp }: { timestamp: any }) => {
        const [isMounted, setIsMounted] = useState(false);
        useEffect(() => setIsMounted(true), []);
        if (!isMounted) return null;

        const date = new Date(timestamp);
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true, numberingSystem: 'latn' };
        
        return (
            <div className="text-xs text-muted-foreground mt-2">
                <span>{date.toLocaleDateString('ar-EG', dateOptions)}</span>
                <span className="mx-1">|</span>
                <span>{date.toLocaleTimeString('ar-EG', timeOptions)}</span>
            </div>
        );
    };

  // --- Sub-components for rendering cards ---

  const AssignedRequestCard = ({ request }: { request: EmergencyRequest }) => {
    return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {request.priorityLevel === 'حرجة' ? '🔴' : request.priorityLevel === 'عالية' ? '🟠' : '🟡'}
          طلب {getPriorityText(request.priorityLevel)}
        </CardTitle>
        
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{request.requestText}</p>
        <FormattedDateTime timestamp={request.timestamp} />
        <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> <strong>الموقع:</strong> {request.location}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary"/> <strong>هاتف التواصل:</strong> {request.contactPhone}</p>
        </div>

        {/* Conditional buttons based on request status */}
        {request.status === 'تم التعيين' && (
          <div className="flex gap-2">
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(request.id, 'قيد التنفيذ')}>
                <Check className="ml-2 h-4 w-4" />
                قبول
            </Button>
            <Button className="w-full" variant="destructive" onClick={() => handleDenyRequest(request.id)}>
                <X className="ml-2 h-4 w-4" />
                رفض
            </Button>
          </div>
        )}
        
        {request.status === 'قيد التنفيذ' && (
           <div className="flex gap-2">
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(request.id, 'اتحلت')}>
                <Check className="ml-2 h-4 w-4" />
                تم الحل
            </Button>
             <Button className="w-full" variant="destructive" onClick={() => handleStatusUpdate(request.id, 'ملغية')}>
                <X className="ml-2 h-4 w-4" />
                إلغاء
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )};

  const HistoryRequestCard = ({ request }: { request: EmergencyRequest }) => {
    const reportText = reportTexts[request.id] || '';
    const isReported = !!request.report;
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDialogSubmit = async () => {
        await handleReportSubmit(request.id);
        setDialogOpen(false); // Close dialog on successful submission
    }

    return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
            <Badge variant={request.status === 'اتحلت' ? 'default' : 'destructive'} className={request.status === 'اتحلت' ? 'bg-green-500' : ''}>
                {request.status}
             </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{request.requestText}</p>
        <FormattedDateTime timestamp={request.timestamp} />
        <div className="pt-4 border-t">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                {isReported ? (
                   <Button variant="outline" className="w-full">
                       <FileText className="ml-2 h-4 w-4" /> عرض الملاحظة
                   </Button>
                ) : (
                   <Button className="w-full">
                       <MessageSquarePlus className="ml-2 h-4 w-4" /> إضافة ملاحظة
                   </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{isReported ? 'الملاحظة المرسلة' : 'إضافة ملاحظة للمسؤول'}</DialogTitle>
                  <DialogDescription>
                    {isReported ? 'هذه هي الملاحظة التي أرسلتها بخصوص هذا الطلب.' : 'اكتب ملاحظتك عن الحالة. ستصل هذه الملاحظة للمسؤول لمراجعتها.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isReported ? (
                        <p className="p-2 bg-muted rounded-md whitespace-pre-wrap break-words">{request.report}</p>
                    ) : (
                        <Textarea 
                            placeholder="اكتب ملاحظتك هنا..."
                            value={reportText}
                            onChange={(e) => handleReportTextChange(request.id, e.target.value)}
                            className="min-h-[120px]"
                        />
                    )}
                </div>
                {!isReported && (
                  <DialogFooter>
                    <Button onClick={handleDialogSubmit} disabled={!reportText.trim()}>
                        <Send className="ml-2 h-4 w-4"/> إرسال
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
        </div>
      </CardContent>
    </Card>
    )
  }

  const getPriorityText = (priority: EmergencyRequest['priorityLevel']) => {
    switch (priority) {
        case 'حرجة': return 'حرج';
        case 'عالية': return 'عالي';
        case 'متوسطة': return 'متوسط';
        case 'عادية': return 'عادي';
    }
  }

  // --- Loading and Error States ---

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }
  
  if (!volunteer) {
    return (
        <div className="flex flex-col justify-center items-center h-screen p-4">
             <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ في تسجيل الدخول</AlertTitle>
                <AlertDescription>لم نتمكن من التحقق من حسابك. يرجى تسجيل الدخول مرة أخرى.</AlertDescription>
            </Alert>
             <Button onClick={() => router.push('/login')} className="mt-4">اذهب إلى صفحة تسجيل الدخول</Button>
        </div>
    );
  }

  // --- Main Component Render ---
  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
             <div className="mr-4 hidden md:flex">
                <Logo />
            </div>
            <div className="flex items-center gap-2 md:hidden">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
                 <nav className="flex items-center gap-2">
                    <ThemeToggle />
                     <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut />
                    </Button>
                </nav>
            </div>
        </div>
    </header>
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h1 className="font-headline text-3xl">أهلاً بك يا {volunteer.fullName}</h1>
        </div>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">مهامك يا {volunteer.fullName}</CardTitle>
                    <CardDescription>هنا يمكنك عرض المهام المعينة لك وسجل طلباتك السابقة.</CardDescription>
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
                                    assignedRequests.map(req => <AssignedRequestCard key={req.id} request={req} />)
                                ) : (
                                    <p className="col-span-full text-center text-muted-foreground py-8">ليس لديك أي طلبات معينة حاليًا.</p>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                                {historyRequests.length > 0 ? (
                                    historyRequests.map(req => <HistoryRequestCard key={req.id} request={req} />)
                                ) : (
                                    <p className="col-span-full text-center text-muted-foreground py-8">ليس لديك أي شيء في السجل حتى الآن.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
              </Card>
        </TabsContent>
        <TabsContent value="profile">
            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-3xl">{volunteer.fullName}</CardTitle>
                            <CardDescription>معرّفك: {volunteer.id} | منطقتك: {volunteer.region}</CardDescription>
                        </div>
                         <Button onClick={() => setIsEditing(!isEditing)} size="sm"><Edit className="ml-2 h-4 w-4" />{isEditing ? 'إلغاء' : 'تعديل'}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                 {isEditing ? (
                     <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md text-right">
                        <div>
                            <label htmlFor="profession" className="block text-sm font-medium mb-1">مهنتك</label>
                            <Input id="profession" value={editForm.profession} onChange={(e) => setEditForm({...editForm, profession: e.target.value})} />
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium mb-1">المنطقة</label>
                            <Select value={editForm.region} onValueChange={(value) => setEditForm({...editForm, region: value})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-4 pt-4 border-t">
                            <Button type="submit">حفظ التغييرات</Button>
                            <Button type="button" variant="destructive" onClick={handleAccountDelete}><Trash2 className="ml-2 h-4 w-4"/> حذف حسابي</Button>
                        </div>
                    </form>
                 ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>{volunteer.email}</span>
                            <strong>:البريد الإلكتروني</strong>
                        </div>
                         <div className="flex justify-between items-center">
                            <span>{volunteer.profession}</span>
                             <strong>:المهنة</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{volunteer.phoneNumber}</span>
                            <strong>:رقم الهاتف</strong>
                        </div>
                        <div className="flex justify-between items-center">
                           <Badge variant={volunteer.status === 'تم التحقق' ? 'default' : 'destructive'} className={volunteer.status === 'تم التحقق' ? 'bg-green-500' : ''}>{volunteer.status}</Badge>
                           <strong>:الحالة</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>{historyRequests.filter(r => r.status === 'اتحلت').length}</span>
                             <strong>:الطلبات التي تم حلها</strong>
                        </div>
                    </div>
                 )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
