
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

// Define the schema for the login form using Zod for validation.
const loginSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
  password: z.string().min(1, { message: 'الرجاء إدخال كلمة المرور.' }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize the form with react-hook-form and Zod resolver.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  /**
   * Handles the form submission for logging in.
   * It checks for admin credentials first, then checks for volunteer credentials.
   * @param {z.infer<typeof loginSchema>} values - The validated form values.
   */
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    // --- Hardcoded Admin Login ---
    // For testing purposes, we bypass Firebase Auth and check for static credentials.
    // In a production app, this should be replaced with a secure authentication call.
    if (values.email === 'admin@awni.sd' && values.password === 'password') {
      toast({ title: 'أهلاً بك أيها المدير' });
      router.push('/admin/dashboard');
      setIsSubmitting(false);
      return;
    }

    // --- Volunteer Login ---
    try {
        // Fetch volunteer data from Firestore using their email.
        const volunteer = await getVolunteerByEmail(values.email);
        if (volunteer) {
            // IMPORTANT: Password is not being checked here because Firebase Auth is disabled.
            // In a real application, you MUST validate the password hash.
            if (volunteer.status === 'تم التحقق') {
                toast({ title: 'أهلاً بك أيها المتطوع' });
                // Navigate to the volunteer dashboard, passing the email as a query parameter.
                router.push(`/volunteer/dashboard?email=${volunteer.email}`);
            } else {
                 toast({ variant: 'destructive', title: 'فشل تسجيل الدخول', description: 'حسابك لا يزال قيد المراجعة أو تم رفضه.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'فشل تسجيل الدخول', description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }
    } catch (error) {
        console.error("Login error", error);
        toast({ variant: 'destructive', title: 'حدث خطأ', description: 'حدث خطأ أثناء محاولة تسجيل الدخول.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background/50">
       <div className="absolute top-4 left-4 flex gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/')}>
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
                دخول
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
