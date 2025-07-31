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
import { Loader2, HandHeart, ShieldCheck, AlertCircle, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

const requestSchema = z.object({
  requestText: z.string().min(10, { message: 'يجب أن يكون الطلب 10 أحرف على الأقل.' }),
  location: z.string().min(3, { message: 'الرجاء تحديد الموقع.'}),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'الرجاء إدخال رقم هاتف صحيح للتواصل.' }),
});

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestText: '', location: '', contactPhone: '' },
  });

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    const result = await createRequestAction(values.requestText, values.location, values.contactPhone);
    setSubmissionResult(result);

    if (result.success) {
      toast({
        title: 'تم تقديم الطلب',
        description: 'تم استلام طلبك ويجري تحديد أولويته.',
      });
      // Don't reset form, so user can see their submission details and ID
    } else {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'تم نسخ معرف الطلب!' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
                <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
                <Link href="/register">التسجيل كمتطوع</Link>
            </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section id="request-help" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">اطلب مساعدة طارئة</h1>
                        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            إذا كانت لديك حالة طارئة، فاملأ النموذج أدناه. سيتم تحليل طلبك على الفور وإرساله إلى أقرب المستجيبين المعتمدين.
                        </p>
                    </div>
                </div>
                <div className="mx-auto max-w-2xl">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">طلب طوارئ جديد</CardTitle>
                            <CardDescription>
                            يرجى وصف حالة الطوارئ بأكبر قدر ممكن من التفاصيل.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!submissionResult?.success ? (
                                <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                    control={form.control}
                                    name="requestText"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>تفاصيل الطوارئ</FormLabel>
                                        <FormControl>
                                            <Textarea
                                            placeholder="مثال: 'اندلع حريق في منزل بشارع العمارات 61. يوجد عدة أشخاص في الداخل...'"
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
                                            <FormLabel>الموقع</FormLabel>
                                            <FormControl>
                                                <Input placeholder="مثال: الخرطوم، حي الرياض، بالقرب من..." {...field} />
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
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    إرسال الطلب
                                    </Button>
                                </form>
                                </Form>
                            ) : null}

                             {submissionResult && (
                                <div className="mt-6">
                                    {submissionResult.success && submissionResult.data ? (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>تم استلام طلبك بنجاح!</AlertTitle>
                                        <AlertDescription>
                                            <p className="mb-4">
                                                سيقوم فريقنا بمراجعة طلبك وتحديد أولويته في أقرب وقت ممكن.
                                            </p>
                                            <div className="flex items-center justify-between rounded-md bg-muted p-3">
                                               <div>
                                                    <p className="text-sm font-semibold">معرف التتبع الخاص بك:</p>
                                                    <p className="text-lg font-mono">{submissionResult.data.id}</p>
                                               </div>
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(submissionResult.data.id)}>
                                                    <Copy className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <p className="mt-4 text-sm">
                                               يمكنك تتبع حالة طلبك باستخدام هذا المعرف.
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
                                            {submissionResult.error || 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.'}
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

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  نداء: شريان حياة في أوقات الشدة
                </h2>
                <p className="max-w-[600px] mx-auto text-foreground/80 md:text-xl">
                  نظام استجابة للطوارئ بسيط وسهل الوصول يربط المجتمعات السودانية بالمساعدة الطبية الموثوقة عبر الرسائل القصيرة والصوت، دون الحاجة إلى الإنترنت.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Button asChild size="lg">
                  <Link href="/register">التسجيل كمتطوع</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">مهمتنا</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">سد الفجوة للوصول إلى الرعاية الطارئة</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  في بلد يواجه تحديات فريدة، يوفر نداء حلقة وصل حاسمة بين المحتاجين للمساعدة وأولئك القادرين على تقديمها. نظامنا مبني على المرونة وسهولة الوصول والثقة.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <HandHeart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">يعتمد على الصوت والرسائل القصيرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                  يمكن لأي شخص طلب المساعدة باستخدام مكالمة صوتية بسيطة أو رسالة نصية قصيرة. نحن نتغلب على حواجز الأمية والإنترنت لضمان عدم ترك أي نداء للمساعدة دون إجابة.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">مستجيبون معتمدون</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                  يتم التحقق يدويًا من شبكتنا من المتطوعين والكيانات الطبية لضمان أن كل استجابة تأتي من مصدر موثوق وقادر، مما يبني مجتمعًا آمنًا من الرعاية.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 نداء. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
