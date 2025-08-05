
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
      <span className="font-headline text-foreground">نداء</span>
    </Link>
  );
}
