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
import { prioritizeRequestAction } from '@/lib/actions';
import { Loader2, HandHeart, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Logo from '@/components/logo';

const requestSchema = z.object({
  requestText: z.string().min(10, { message: 'يجب أن يكون الطلب 10 أحرف على الأقل.' }),
});

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestText: '' },
  });

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    const result = await prioritizeRequestAction(values.requestText);
    setSubmissionResult(result);

    if (result.success) {
      toast({
        title: 'تم تقديم الطلب',
        description: 'تم استلام طلبك ويجري تحديد أولويته.',
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  };

  const getPriorityBadgeVariant = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityText = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
        case 'critical': return 'حرج';
        case 'high': return 'عالي';
        case 'medium': return 'متوسط';
        case 'low': return 'منخفض';
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Logo />
      </header>
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    عوني السودان: شريان حياة في أوقات الشدة
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    نظام استجابة للطوارئ بسيط وسهل الوصول يربط المجتمعات السودانية بالمساعدة الطبية الموثوقة عبر الرسائل القصيرة والصوت، دون الحاجة إلى الإنترنت.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">التسجيل كمتطوع</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/admin/dashboard">لوحة تحكم المسؤول</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <img
                  src="https://placehold.co/600x400.png"
                  alt="أيادي المساعدة"
                  width="600"
                  height="400"
                  data-ai-hint="community help"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="request-help" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">اطلب مساعدة طارئة</h2>
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
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                إرسال الطلب
                                </Button>
                            </form>
                            </Form>
                             {submissionResult && (
                                <div className="mt-6">
                                    {submissionResult.success && submissionResult.data ? (
                                    <Alert variant={getPriorityBadgeVariant(submissionResult.data.priorityLevel)}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>تم تحديد أولوية الطلب: {getPriorityText(submissionResult.data.priorityLevel).toUpperCase()}</AlertTitle>
                                        <AlertDescription>
                                            {submissionResult.data.reason}
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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">مهمتنا</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">سد الفجوة للوصول إلى الرعاية الطارئة</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  في بلد يواجه تحديات فريدة، يوفر عوني السودان حلقة وصل حاسمة بين المحتاجين للمساعدة وأولئك القادرين على تقديمها. نظامنا مبني على المرونة وسهولة الوصول والثقة.
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
        <p className="text-xs text-foreground/60">&copy; 2024 عوني السودان. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
