import React from 'react';
import { Notification } from '../types';
import { Bell, Check, AlertCircle, Clock } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onSelectNotification: (trainingId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  onClose,
  onSelectNotification
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-4 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
      <div className="p-4 bg-indigo-50 flex justify-between items-center border-b border-indigo-100">
        <div className="flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
        </div>
        {notifications.length > 0 && (
            <button onClick={onClearAll} className="text-xs text-indigo-600 hover:underline">
                Tout effacer
            </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune nouvelle notification</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                    >
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                            {notif.type === 'alert' ? <Clock size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-gray-800">{notif.title}</h4>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onMarkAsRead(notif.id); }}
                                    className="text-gray-400 hover:text-indigo-600"
                                    title="Marquer comme lu"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                            <p 
                                className="text-xs text-gray-600 mt-1 cursor-pointer hover:text-indigo-600"
                                onClick={() => {
                                    onMarkAsRead(notif.id);
                                    if(notif.trainingId) onSelectNotification(notif.trainingId);
                                }}
                            >
                                {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2">
                                {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">
              Fermer
          </button>
      </div>
    </div>
  );
};

export default NotificationPanel;