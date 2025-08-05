
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createRequestAction } from '@/lib/actions';
import { Loader2, Copy, Menu } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Defines the validation schema for the emergency request form.
const requestSchema = z.object({
  requestText: z.string().min(10, { message: 'يجب أن يكون الطلب 10 أحرف على الأقل.' }),
  location: z.string().min(3, { message: 'يرجى تحديد موقعك.'}),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'يرجى إدخال رقم هاتف صحيح.' }),
  privacyConsent: z.boolean().refine(val => val === true, {
    message: "يجب الموافقة على سياسة الخصوصية للمتابعة."
  })
});

export default function HomeClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestText: '', location: '', contactPhone: '', privacyConsent: false },
  });

  /**
   * Handles the submission of the emergency request form.
   * It calls a server action to create the request and displays the result.
   * @param {z.infer<typeof requestSchema>} values - The validated form values.
   */
  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    const result = await createRequestAction(values.requestText, values.location, values.contactPhone);
    setSubmissionResult(result);

    if (result.success) {
      toast({
        title: 'تم استلام طلبك',
        description: 'لقد استلمنا طلبك وجاري تحديد الأولويات.',
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  };

  /**
   * Copies the provided text to the clipboard and shows a confirmation toast.
   * @param {string} text - The text to copy.
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'تم نسخ رقم التتبع!' });
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex gap-6 md:gap-10">
            <Logo />
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                 <Button variant="outline" asChild>
                    <Link href="/track">تتبع طلبك</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">التسجيل كمتطوع</Link>
                </Button>
            </nav>
            {/* Mobile Navigation Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">افتح القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Logo />
                  <Link href="/track" className="text-muted-foreground hover:text-foreground">
                    تتبع طلبك
                  </Link>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground">
                    تسجيل الدخول
                  </Link>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground">
                    التسجيل كمتطوع
                  </Link>
                  <div className="pt-4">
                     <ThemeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {/* Main section for submitting a new emergency request */}
        <section id="request-help" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">نحن هنا لمساعدتك.</h1>
                        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                           يرجى تقديم أكبر قدر من التفاصيل. كل معلومة تساعدنا في الوصول إليك بشكل أسرع وتقديم الدعم المناسب. فريقنا جاهز للاستجابة.
                        </p>
                    </div>
                </div>
                <div className="mx-auto max-w-2xl">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">طلب طوارئ جديد</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* The form is displayed only if a submission has not been successfully made yet. */}
                            {!submissionResult?.success ? (
                                <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                    control={form.control}
                                    name="requestText"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>تفاصيل الحالة</FormLabel>
                                        <FormControl>
                                            <Textarea
                                            placeholder="مثال: 'حريق في منزل بشارع 61 في العمارات. يوجد أشخاص بالداخل...'."
                                            className="min-h-[150px]"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>أين موقعك؟</FormLabel>
                                            <FormControl>
                                                <Input placeholder="مثال: الخرطوم، الرياض، بالقرب من..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="contactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>رقم هاتف للتواصل</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+249..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="privacyConsent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 space-x-reverse">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="font-normal">
                                                        أُقرّ بأن المعلومات التي أُدخلها سيتم مشاركتها مع متطوع معتمد (طبيب أو عامل صحي) لغرض مساعدتي في الحالة الطبية التي أبلغت عنها.
                                                        {' '}
                                                        <Link href="/privacy" className="underline text-primary hover:text-primary/80" target="_blank">
                                                            اطلع على سياسة الخصوصية
                                                        </Link>
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
                                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    إرسال الطلب
                                    </Button>
                                </form>
                                </Form>
                            ) : null}

                             {/* Displays the result of the form submission (success or error). */}
                             {submissionResult && (
                                <div className="mt-6">
                                    {submissionResult.success && submissionResult.data ? (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>تم استلام طلبك بنجاح!</AlertTitle>
                                        <AlertDescription>
                                            <p className="mb-4">
                                                سيقوم فريقنا بمراجعة طلبك وتنسيق الاستجابة في أسرع وقت ممكن.
                                            </p>
                                            <div className="flex items-center justify-between rounded-md bg-muted p-3">
                                               <div>
                                                    <p className="text-sm font-semibold">رقم التتبع الخاص بك:</p>
                                                    <p className="text-lg font-mono">{submissionResult.data.id}</p>
                                               </div>
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(submissionResult.data.id)}>
                                                    <Copy className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <p className="mt-4 text-sm">
                                               يمكنك متابعة حالة طلبك باستخدام هذا الرقم.
                                            </p>
                                            <Button asChild className="mt-4 w-full">
                                                <Link href={`/track/${submissionResult.data.id}`}>
                                                    تتبع الطلب الآن
                                                </Link>
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                    ) : (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>فشل الإرسال</AlertTitle>
                                        <AlertDescription>
                                            {submissionResult.error || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
                                        </AlertDescription>
                                    </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 نداء. جميع الحقوق محفوظة.</p>
         <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            سياسة الخصوصية
            </Link>
        </nav>
      </footer>
    </div>
  );
}
