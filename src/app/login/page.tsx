
'use client';

import { useState } from 'react';
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
import { ThemeToggle } from '@/components/theme-toggle';
import { getVolunteerByEmail } from '@/lib/firebase/firestore';


const loginSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صاح.' }),
  password: z.string().min(1, { message: 'الرجاء إدخال كلمة السر.' }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    // Hardcoded credentials for admin
    if (values.email === 'admin@awni.sd' && values.password === 'password') {
      toast({ title: 'أهلاً بيك يا مدير' });
      router.push('/admin/dashboard');
      return;
    }

    // Volunteer login check
    try {
        const volunteer = await getVolunteerByEmail(values.email);
        if (volunteer) {
            // NOTE: We are not checking password here because we disabled Firebase Auth
            // In a real app, you would validate the password.
            if (volunteer.status === 'تم التحقق') {
                toast({ title: 'أهلاً بيك يا متطوع' });
                // Pass volunteer email to the dashboard to derive the ID
                router.push(`/volunteer/dashboard?email=${volunteer.email}`);
            } else {
                 toast({ variant: 'destructive', title: 'الدخول فشل', description: 'حسابك لسه تحت المراجعة أو اترفض.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'الدخول فشل', description: 'الإيميل أو كلمة السر غلط.' });
        }
    } catch (error) {
        console.error("Login error", error);
        toast({ variant: 'destructive', title: 'حصل خطأ', description: 'حصل خطأ وإحنا بنحاول ندخلك.' });
    }

    setIsSubmitting(false);
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
          <CardDescription>أدخل بياناتك عشان تخش حسابك.</CardDescription>
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
                      <Input type="email" placeholder="admin@awni.sd" {...field} />
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                خش
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
