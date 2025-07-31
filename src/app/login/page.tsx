
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getVolunteerByEmail } from '@/lib/firebase/firestore';
import { ThemeToggle } from '@/components/theme-toggle';


const loginSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
  password: z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === 'admin@awni.sd') {
          router.push('/admin/dashboard');
        } else {
          getVolunteerByEmail(user.email!).then(volunteer => {
            if (volunteer) {
              router.push(`/volunteer/dashboard?id=${volunteer.id}`);
            }
          });
        }
      }
    });
    return () => unsubscribe();
  }, [router]);


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        if (user.email === 'admin@awni.sd') {
             toast({ title: 'تم تسجيل دخول المسؤول بنجاح' });
             router.push('/admin/dashboard');
        } else {
            const volunteer = await getVolunteerByEmail(user.email!);
            if (volunteer) {
              toast({ title: 'تم تسجيل الدخول بنجاح' });
              router.push(`/volunteer/dashboard?id=${volunteer.id}`);
            } else {
              toast({ variant: 'destructive', title: 'فشل تسجيل الدخول', description: 'لم يتم العثور على حساب متطوع مطابق.' });
            }
        }
    } catch (error: any) {
        let errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        if (error.code) {
          switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = 'البريد الإلكتروني أو كلمة المرور التي أدخلتها غير صحيحة.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'تم حظر الوصول إلى هذا الحساب مؤقتًا بسبب كثرة محاولات تسجيل الدخول الفاشلة.';
              break;
            default:
               errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
          }
        }
        toast({ variant: 'destructive', title: 'فشل تسجيل الدخول', description: errorMessage });
    } finally {
        setIsSubmitting(false);
    }
  };

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى حسابك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل الدخول
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
