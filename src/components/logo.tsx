import { HandHeart } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
      <HandHeart className="h-6 w-6" />
      <span className="font-headline text-foreground">عوني السودان</span>
    </Link>
  );
}
