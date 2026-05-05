import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Bell, Trash2, CheckCircle2 } from "lucide-react";
import { useSplash } from "@/contexts/SplashContext";

const LANG = 'es';

const t = (key: string, lang: string = 'es') => {
  const translations: Record<string, Record<string, string>> = {
    es: {
      notifications: "Notificaciones",
      noNotifications: "No hay notificaciones",
      noNotificationsDesc: "Aquí aparecerán tus notificaciones importantes",
      markAsRead: "Marcar como leído",
      delete: "Eliminar",
      back: "Volver",
    },
    en: {
      notifications: "Notifications",
      noNotifications: "No notifications",
      noNotificationsDesc: "Your important notifications will appear here",
      markAsRead: "Mark as read",
      delete: "Delete",
      back: "Back",
    },
  };
  return translations[lang]?.[key] || key;
};

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { showSplash } = useSplash();
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleBack = () => {
    showSplash();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-800">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#1A1A1A]">{t('notifications', LANG)}</h1>
        </div>
        <Bell className="w-5 h-5 text-[#C5A55A]" />
      </div>

      {/* Contenido */}
      <div className="max-w-md mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('noNotifications', LANG)}</h2>
            <p className="text-sm text-gray-500">{t('noNotificationsDesc', LANG)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-[#1A1A1A]">{notif.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{notif.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Padding para safe area */}
      <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}
