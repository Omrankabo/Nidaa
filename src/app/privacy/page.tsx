
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
                 <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة للرئيسية
                    </Link>
                </Button>
            </div>
            <Logo />
        </div>
      </header>
      <main className="flex-grow container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">سياسة الخصوصية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-lg leading-relaxed">
                    <p>
                        نشكرك على ثقتك في مشروع نداء. نحن ملتزمون بحماية خصوصيتك وضمان سرية المعلومات التي تقدمها لنا. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها ومشاركتها عند استخدامك لخدماتنا.
                    </p>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">1. المعلومات التي نجمعها</h2>
                        <p>قد نقوم بجمع المعلومات التالية:</p>
                        <ul className="list-disc pr-8 space-y-2">
                            <li>معلومات الاتصال مثل رقم الهاتف.</li>
                            <li>الموقع الجغرافي (في حال كان ذلك جزءًا من الخدمة، وبموافقتك).</li>
                            <li>معلومات الاستخدام، مثل وقت وتاريخ استخدامك للخدمة.</li>
                            <li>معلومات تقدمها طوعًا عند تسجيلك كمتطوع أو كمقدم خدمة طبية أو عند تقديم طلب مساعدة.</li>
                        </ul>
                    </div>
                     <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">2. كيفية استخدام المعلومات</h2>
                        <p>نستخدم المعلومات التي نجمعها من أجل:</p>
                        <ul className="list-disc pr-8 space-y-2">
                            <li>ربط طالبي المساعدة بالجهات القادرة على تقديمها.</li>
                            <li>تحسين جودة الخدمة وتقديم دعم أفضل للمستخدمين.</li>
                            <li>التواصل معك إذا لزم الأمر بشأن الطلبات أو التنبيهات.</li>
                        </ul>
                    </div>
                     <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">3. مشاركة المعلومات</h2>
                        <p>نلتزم بعدم بيع أو تأجير بياناتك الشخصية لأي جهة. قد نشارك بعض المعلومات مع:</p>
                        <ul className="list-disc pr-8 space-y-2">
                            <li>المتطوعين أو المؤسسات الطبية التي تحتاجها للاستجابة لحالات الطوارئ.</li>
                            <li>الجهات الموثوقة التي تعمل معنا على تحسين الخدمة أو تقديم الدعم الفني، بشرط التزامها بسياسة الخصوصية.</li>
                        </ul>
                    </div>
                     <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">4. أمن المعلومات</h2>
                        <p>نحرص على حماية معلوماتك عبر وسائل أمان تقنية وتنظيمية مناسبة. ورغم ذلك، لا يمكننا ضمان حماية مطلقة، ونوصي بعدم مشاركة معلومات حساسة جدًا عبر الرسائل النصية.</p>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">5. خياراتك وحقوقك</h2>
                         <ul className="list-disc pr-8 space-y-2">
                            <li>يمكنك طلب تعديل أو حذف بياناتك في أي وقت.</li>
                            <li>يمكنك إلغاء الاشتراك في الخدمة متى شئت، عبر التواصل معنا.</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">6. التعديلات على السياسة</h2>
                        <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر الموقع أو الرسائل.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 نداء. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
