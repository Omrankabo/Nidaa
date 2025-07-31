
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import type { Volunteer } from '@/lib/types';

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'يجب أن يتكون الاسم الكامل من حرفين على الأقل.' }),
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
  password: z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' }),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: "الرجاء اختيار النوع" }) }),
  region: z.string().min(1, { message: 'الرجاء اختيار منطقة.' }),
  city: z.string().min(1, { message: 'الرجاء إدخال مدينة.' }),
  profession: z.string().min(2, { message: 'يجب أن تكون المهنة من حرفين على الأقل.' }),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'الرجاء إدخال رقم هاتف صحيح.' }),
});

const regions = ['الخرطوم', 'شمال كردفان', 'البحر الأحمر', 'الجزيرة', 'كسلا', 'النيل الأزرق'];
const DB_URL = "https://awni-sudan-default-rtdb.europe-west1.firebasedatabase.app/volunteers.json";

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      region: '',
      city: '',
      profession: '',
      phoneNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const { user } = userCredential;

      const volunteerData: Omit<Volunteer, 'id'> = {
        fullName: values.fullName,
        email: values.email,
        gender: values.gender === 'male' ? 'ذكر' : 'أنثى',
        region: values.region,
        city: values.city,
        profession: values.profession,
        phoneNumber: values.phoneNumber,
        status: 'قيد الانتظار',
        photoIdUrl: '..', // Placeholder
        createdAt: Date.now()
      };

      await axios.put(`${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/volunteers/${user.uid}.json`, volunteerData);

      toast({
        title: 'تم تقديم طلب التسجيل بنجاح!',
        description: 'سيقوم المسؤول بمراجعة طلبك قريبًا.',
      });
      router.push('/login');

    } catch (error: any) {
      console.error("Registration error:", error);
      let description = 'فشل إرسال طلب التسجيل. الرجاء المحاولة مرة أخرى.';
      
      if (error.code === 'auth/email-already-in-use') {
        description = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.';
        form.setError('email', { type: 'manual', message: 'هذا البريد الإلكتروني مسجل بالفعل.' });
      } else if (error.code === 'auth/weak-password') {
        description = 'كلمة المرور ضعيفة جدا. الرجاء اختيار كلمة مرور أقوى.';
        form.setError('password', { type: 'manual', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
      } else if (error.code === 'auth/invalid-email') {
         description = 'البريد الإلكتروني الذي أدخلته غير صالح.';
         form.setError('email', { type: 'manual', message: 'الرجاء إدخال بريد إلكتروني صحيح.' });
      } else if (axios.isAxiosError(error)) {
        description = `فشل حفظ بيانات المتطوع: ${error.message}`;
      }
      
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background/50">
        <div className="absolute top-4 right-4">
            <Logo />
        </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">كن مستجيباً معتمداً</CardTitle>
          <CardDescription>
            انضم إلى شبكتنا من المتطوعين والمهنيين الطبيين الموثوق بهم. مساعدتك يمكن أن تنقذ الأرواح.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النوع</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                          <SelectItem value="other">آخر</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنطقة</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منطقتك" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدينة / البلدة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: أم درمان" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المهنة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: طبيب، ممرض، سائق" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="... 249+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إرسال للتحقق
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
