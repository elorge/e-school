// web/components/WhatsAppButton.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Watch for the element the button tends to collide with —
    // give it id="whatsapp-avoid" on your final CTA / footer section.
    const target = document.getElementById('whatsapp-avoid');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: '0px 0px -80px 0px' } // start hiding 80px before it's fully in view
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname !== '/' || !WHATSAPP_NUMBER) return null;

  const message = encodeURIComponent("Hi, I'd like to know more about Elorge Schools.");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:brightness-95 ${
        hidden ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
      }`}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}