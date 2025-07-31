
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateRequest, deleteRequest, getRequestById } from '@/lib/firebase/firestore';
import type { EmergencyRequest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, CheckCircle, Clock, Edit, Trash2, UserCheck, Timer, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TrackRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = getRequestById(id, (data) => {
      if (data) {
        setRequest(data);
        setEditedText(data.requestText);
      } else {
        setError('لم يتم العثور على الطلب. يرجى التحقق من المعرف والمحاولة مرة أخرى.');
      }
      setLoading(false);
    });

    return () => {
        if(typeof unsubscribe === 'function') {
            unsubscribe();
        }
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !request) return;
    await updateRequest(id, { requestText: editedText });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteRequest(id);
    router.push('/');
  };
  
  const getStatusInfo = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'قيد الانتظار':
        return { icon: <Clock className="h-6 w-6 text-yellow-500" />, text: 'طلبك قيد الانتظار. نحن نبحث عن أقرب متطوع.', color: 'text-yellow-500' };
      case 'تم التعيين':
        return { icon: <UserCheck className="h-6 w-6 text-blue-500" />, text: 'تم تعيين متطوع! المساعدة في الطريق.', color: 'text-blue-500' };
      case 'تم الحل':
        return { icon: <CheckCircle className="h-6 w-6 text-green-500" />, text: 'تم حل طلبك. نتمنى لك السلامة.', color: 'text-green-500' };
      case 'تم الإلغاء':
        return { icon: <AlertCircle className="h-6 w-6 text-red-500" />, text: 'تم إلغاء هذا الطلب.', color: 'text-red-500' };
      default:
        return { icon: <Clock className="h-6 w-6" />, text: status, color: ''};
    }
  };
  
  const statusInfo = request ? getStatusInfo(request.status) : null;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }
  
  if (error) {
     return (
        <div className="flex flex-col justify-center items-center h-screen p-4">
            <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
             <Button onClick={() => router.push('/')} className="mt-4">العودة إلى الصفحة الرئيسية</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background/50">
        <div className="absolute top-4 left-4 flex gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <ThemeToggle />
        </div>
        <div className="absolute top-4 right-4">
            <Logo />
        </div>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">تتبع طلب الطوارئ</CardTitle>
          <CardDescription>معرف الطلب: <span className="font-mono">{id}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg border flex items-center gap-4 bg-background`}>
                {statusInfo?.icon}
                <div>
                    <p className="font-semibold text-lg">الحالة الحالية</p>
                    <p className={`${statusInfo?.color}`}>{statusInfo?.text}</p>
                </div>
            </div>

            {request?.status === 'تم التعيين' && request.assignedVolunteer && (
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <UserCheck className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl">المستجيب المعين</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>الاسم:</strong> {request.assignedVolunteer}</p>
                        <p className="mt-2 flex items-center gap-2">
                            <Timer className="h-5 w-5" />
                            <strong>الوقت المقدر للوصول:</strong> {request.eta || 'جارِ التحديد...'}
                        </p>
                    </CardContent>
                </Card>
            )}

          <div>
            <h3 className="font-semibold mb-2">تفاصيل الطلب الأصلي:</h3>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="min-h-[120px]" />
                <div className="flex gap-2">
                  <Button onClick={handleUpdate}>حفظ التغييرات</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                </div>
              </div>
            ) : (
              <p className="p-3 rounded-md bg-muted whitespace-pre-wrap">{request?.requestText}</p>
            )}
          </div>
          
          {request?.status === 'قيد الانتظار' && !isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل الطلب
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="ml-2 h-4 w-4" />
                    إلغاء الطلب
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيؤدي هذا إلى حذف طلبك نهائيًا. لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>تراجع</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      نعم، قم بالإلغاء
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
