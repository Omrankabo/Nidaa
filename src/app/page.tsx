
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
import { Loader2, HandHeart, ShieldCheck, AlertCircle, Copy, ArrowLeft, Menu } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const requestSchema = z.object({
  requestText: z.string().min(10, { message: 'الطلب لازم يكون 10 حروف أو أكتر.' }),
  location: z.string().min(3, { message: 'أكتب لينا موقعك وين.'}),
  contactPhone: z.string().regex(/^\+?[0-9\s-]{7,20}$/, { message: 'أكتب رقم تلفون صاح عشان نتصل بيك.' }),
});

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
        title: 'طلبك وصل',
        description: 'استلمنا طلبك وجاري ترتيب الأولويات.',
      });
      // Don't reset form, so user can see their submission details and ID
    } else {
      toast({
        variant: 'destructive',
        title: 'حصل خطأ',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'رقم التتبع اتنسخ!' });
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
                    <Link href="/track">تابع طلبك</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">سجل كمتطوع</Link>
                </Button>
            </nav>
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
                    تابع طلبك
                  </Link>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground">
                    تسجيل الدخول
                  </Link>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground">
                    سجل كمتطوع
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
        <section id="request-help" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">داير مساعدة طارئة؟</h1>
                        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            لو عندك حالة طارئة، املأ الطلب التحت دا. طلبك حيتحلل فوراً ويتوجه لأقرب زول معتمد يقدر يساعد.
                        </p>
                    </div>
                </div>
                <div className="mx-auto max-w-2xl">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">طلب طوارئ جديد</CardTitle>
                            <CardDescription>
                            أشرح لينا الحالة بالتفصيل عشان نقدر نساعد صاح.
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
                                        <FormLabel>تفاصيل الحالة</FormLabel>
                                        <FormControl>
                                            <Textarea
                                            placeholder="مثال: 'في حريقة في بيت في شارع 61 العمارات. في ناس جوه...'."
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
                                            <FormLabel>وين إنت؟</FormLabel>
                                            <FormControl>
                                                <Input placeholder="مثال: الخرطوم، الرياض، جمب..." {...field} />
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
                                            <FormLabel>رقم تلفون للتواصل</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+249..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    أرسل الطلب
                                    </Button>
                                </form>
                                </Form>
                            ) : null}

                             {submissionResult && (
                                <div className="mt-6">
                                    {submissionResult.success && submissionResult.data ? (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>طلبك وصل بنجاح!</AlertTitle>
                                        <AlertDescription>
                                            <p className="mb-4">
                                                فريقنا حيشوف طلبك ويرتب أمورو في أسرع وقت.
                                            </p>
                                            <div className="flex items-center justify-between rounded-md bg-muted p-3">
                                               <div>
                                                    <p className="text-sm font-semibold">رقم التتبع بتاعك:</p>
                                                    <p className="text-lg font-mono">{submissionResult.data.id}</p>
                                               </div>
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(submissionResult.data.id)}>
                                                    <Copy className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <p className="mt-4 text-sm">
                                               تقدر تتابع طلبك بالرقم دا.
                                            </p>
                                            <Button asChild className="mt-4 w-full">
                                                <Link href={`/track/${submissionResult.data.id}`}>
                                                    تابع الطلب هسي
                                                </Link>
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                    ) : (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>الإرسال فشل</AlertTitle>
                                        <AlertDescription>
                                            {submissionResult.error || 'حصل خطأ غريب. جرب تاني بالله.'}
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
                  نداء: يد العون في وقت الشدة
                </h2>
                <p className="max-w-[600px] mx-auto text-foreground/80 md:text-xl">
                  نظام بسيط وساهل عشان نوصل أهلنا في السودان بالمساعدة الطبية الموثوقة بسرعة.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Button asChild size="lg">
                  <Link href="/register">سجل كمتطوع</Link>
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">بنسد الفجوة عشان نصل للمحتاج</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  في بلد ظروفه صعبة، "نداء" هو حلقة الوصل بين الزول المحتاج والزول البقدر يساعد. نظامنا مبني على الثقة والسرعة والسهولة.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <HandHeart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">بسيط وفعال</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                  أي زول يقدر يطلب مساعدة بكل سهولة. هدفنا إنو أي طلب مساعدة يلقى استجابة سريعة.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">ناس ثقة ومضمونين</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                  شبكتنا من المتطوعين والجهات الطبية بنتأكد منهم واحد واحد عشان نضمن إنو المساعدة بتجي من زول موثوق وقادر، عشان نبني مجتمع آمن ومتكاتف.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 نداء. كل الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

  
