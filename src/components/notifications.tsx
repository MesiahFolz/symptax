"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-white text-sm">Notifications</span>
            {unreadCount > 0 && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{unreadCount} New</span>}
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                <p className="text-sm text-slate-500 dark:text-slate-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{n.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1.5 uppercase font-semibold">
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/20 text-center">
               <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-tight">Mark all as read</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
