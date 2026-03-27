import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/authSlice';
import NotificationBell from '../../shared/NotificationBell';

interface AdminHeaderProps {
    className?: string;
}

function AdminHeader({ className = '' }: AdminHeaderProps) {

    const user = useSelector(selectCurrentUser);

    const displayName = user?.fullName || 'Admin';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className={`h-14 bg-white/40 backdrop-blur-xl border-b border-white/40 flex items-center justify-end px-4 md:px-6 gap-4 shadow-sm z-40 relative ${className}`}>
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Avatar */}
            <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F37022] to-[#D96419] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {avatarInitial}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">{displayName}</span>
            </button>
        </div>
    );
}

export default AdminHeader;
