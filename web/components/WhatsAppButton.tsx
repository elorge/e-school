// web/components/WhatsAppButton.tsx
'use client';

import { MessageCircle } from 'lucide-react';

// Set this in web/.env.local — country code, no +, no spaces (e.g. Nigerian mobile: 234XXXXXXXXXX)
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null; // silently hidden until you actually configure a number — never shows a dead link

  const message = encodeURIComponent("Hi, I'd like to know more about Elorge Schools.");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    
    <a
    href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-95"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}