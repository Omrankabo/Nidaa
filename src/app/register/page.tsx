
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
  fullName: z.string().min(2, { message: 'الاسم لازم يكون حرفين أو أكتر.' }),
  email: z.string().email({ message: 'أكتب إيميل صاح.' }),
  password: z.string().min(6, { message: 'كلمة السر لازم تكون 6 حروف أو أكتر.' }),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: "اختار النوع" }) }),
  region: z.string().min(1, { message: 'اختار منطقتك.' }),
  city: z.string().min(1, { message: 'أكتب مدينتك.' }),
  profession: z.string().min(2, { message: 'المهنة لازم تكون حرفين أو أكتر.' }),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'أكتب رقم تلفون صاح.' }),
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
        title: 'طلبك اترسل بنجاح!',
        description: 'المدير حيشوف طلبك ويوافق عليهو قريب.',
      });
      router.push('/login');
    } else {
        let description = result.error || 'طلب التسجيل ما مشى. جرب تاني بالله.';
        
        toast({
            variant: 'destructive',
            title: 'حصل خطأ',
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
          <CardTitle className="text-2xl font-headline">خليك واحد من ناسنا</CardTitle>
          <CardDescription>
            خش معانا في شبكة المتطوعين والخبراء الطبيين الموثوقين. مساعدتك ممكن تنقذ حياة.
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
                        <Input placeholder="أكتب اسمك الكامل" {...field} />
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
                            <SelectValue placeholder="اختار النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">راجل</SelectItem>
                          <SelectItem value="female">مرة</SelectItem>
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
                      <FormLabel>كلمة السر</FormLabel>
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
                            <SelectValue placeholder="اختار منطقتك" />
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
                      <FormLabel>المدينة / الحلة</FormLabel>
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
                      <FormLabel>شغلك شنو؟</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: دكتور، ممرض، سواق" {...field} />
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
                      <FormLabel>رقم التلفون</FormLabel>
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
                أرسل عشان نتأكد
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
