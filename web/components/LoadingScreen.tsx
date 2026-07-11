// web/components/LoadingScreen.tsx
import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Image src="/logo.png" alt="" width={56} height={56} className="animate-breathe rounded-full" aria-hidden />
    </div>
  );
}