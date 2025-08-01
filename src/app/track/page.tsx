
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';
import { Search, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TrackRequestPage() {
  const [requestId, setRequestId] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestId.trim()) {
      router.push(`/track/${requestId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
          <CardTitle className="text-2xl font-headline">تابع حالة طلبك</CardTitle>
          <CardDescription>أكتب رقم الطلب بتاعك تحت عشان تشوف حالتو وتفاصيلو.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-2">
            <Input
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="أدخل رقم الطلب هنا..."
              required
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">تتبع</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
