// web/components/NotificationBell.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { listNotifications, unreadCount, markRead, markAllRead, type Notification } from '@/lib/endpoints/notifications';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    unreadCount().then(setCount).catch(() => {});
    const interval = setInterval(() => unreadCount().then(setCount).catch(() => {}), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open) setNotifications(await listNotifications());
  }

  async function handleMarkAll() {
    await markAllRead();
    setCount(0);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  async function handleClickOne(n: Notification) {
    if (!n.read) {
      await markRead(n.id);
      setCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.link) window.location.href = n.link;
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative text-ink/60 hover:text-ink">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">Notifications</span>
            <button onClick={handleMarkAll} className="text-xs text-brand-blue underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="p-4 text-center text-sm text-ink/40">Nothing yet.</p>}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickOne(n)}
                className={`block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-black/5 ${
                  n.read ? '' : 'bg-brand-blue/5'
                }`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-ink/60">{n.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}