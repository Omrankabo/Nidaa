
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
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { createVolunteerAction } from '@/lib/actions';
import { ThemeToggle } from '@/components/theme-toggle';

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'يجب أن يتكون الاسم من حرفين على الأقل.' }),
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح.' }),
  password: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' }),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: "يرجى تحديد الجنس" }) }),
  region: z.string().min(1, { message: 'يرجى تحديد منطقتك.' }),
  city: z.string().min(1, { message: 'يرجى إدخال مدينتك.' }),
  profession: z.string().min(2, { message: 'يجب أن تتكون المهنة من حرفين على الأقل.' }),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'يرجى إدخال رقم هاتف صحيح.' }),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

const regions = ['الخرطوم', 'شمال كردفان', 'البحر الأحمر', 'الجزيرة', 'كسلا', 'النيل الأزرق'];

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormValues>({
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

  async function onSubmit(values: RegistrationFormValues) {
    setIsSubmitting(true);
    form.clearErrors();

    const result = await createVolunteerAction(values);

    if (result.success) {
      toast({
        title: 'تم إرسال طلبك بنجاح!',
        description: 'سيقوم المسؤول بمراجعة طلبك والموافقة عليه قريبًا.',
      });
      router.push('/login');
    } else {
        let description = result.error || 'فشل إرسال طلب التسجيل. يرجى المحاولة مرة أخرى.';
        
        toast({
            variant: 'destructive',
            title: 'حدث خطأ',
            description: description,
        });
    }

    setIsSubmitting(false);
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
      <Card className="w-full max-w-2xl my-12">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">انضم إلينا</CardTitle>
          <CardDescription>
            انضم إلى شبكتنا من المتطوعين والخبراء الطبيين الموثوقين. مساعدتك يمكن أن تنقذ حياة.
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
                        <Input placeholder="اكتب اسمك الكامل" {...field} />
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
                      <FormLabel>الجنس</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الجنس" />
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
                      <FormLabel>المدينة / الحي</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: أمدرمان" {...field} />
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
                      <FormLabel>ما هي مهنتك؟</FormLabel>
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
                إرسال للمراجعة
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
