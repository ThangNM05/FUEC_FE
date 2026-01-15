import { useState } from 'react';
import { Bell } from 'lucide-react';

interface AdminHeaderProps {
    className?: string;
}

function AdminHeader({ className = '' }: AdminHeaderProps) {
    const [notificationCount] = useState(3);

    return (
        <div className={`h-14 bg-white border-b border-gray-200 flex items-center justify-end px-4 md:px-6 gap-4 ${className}`}>
            {/* Notification Bell */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notificationCount}
                    </span>
                )}
            </button>

            {/* User Avatar */}
            <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F37022] to-[#D96419] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    A
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
            </button>
        </div>
    );
}

export default AdminHeader;
