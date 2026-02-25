import { useNavigate, useLocation } from 'react-router';
import {
    LayoutDashboard, BookOpen, Calendar, BarChart3,
    User, LogOut, MessageSquare
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/authSlice';
import { Dock, DockIcon, DockItem, DockLabel, DockSeparator } from "../../ui/dock";
import { useIsMobile } from '../../../hooks/use-mobile';

interface MenuItem {
    id: string;
    label: string;
    icon: any;
    path: string;
}

function TeacherSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isMobile = useIsMobile();

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
        { id: 'classes', label: 'My Classes', icon: BookOpen, path: '/teacher/classrooms' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/teacher/schedule' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
        { id: 'reports', label: 'Reports', icon: BarChart3, path: '/teacher/reports' }
    ];

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className="fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50 pointer-events-none px-2 sm:px-4">
            <Dock className="pointer-events-auto" iconSize={isMobile ? 36 : 48}>
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const unreadCount = item.id === 'messages' ? 8 : 0;

                    return (
                        <DockItem key={item.id}>
                            <button
                                onClick={() => handleMenuClick(item.path)}
                                className="flex h-full w-full items-center justify-center outline-none border-0 focus:outline-none relative"
                            >
                                <DockIcon className={isActive ? "text-[#F37022]" : "text-[#0A1B3C]"}>
                                    <Icon className="w-5 h-5" />
                                </DockIcon>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#F37022] text-white text-[10px] font-bold rounded-full flex items-center justify-center -translate-y-1/2 translate-x-1/2">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                                <DockLabel>{item.label}</DockLabel>
                            </button>
                        </DockItem>
                    );
                })}

                <DockSeparator />

                <DockItem>
                    <button
                        onClick={() => handleMenuClick('/teacher/profile')}
                        className="flex h-full w-full items-center justify-center outline-none border-0 focus:outline-none"
                    >
                        <DockIcon className="text-[#0A1B3C]">
                            <User className="w-5 h-5" />
                        </DockIcon>
                        <DockLabel>Profile</DockLabel>
                    </button>
                </DockItem>
                <DockItem>
                    <button
                        onClick={() => {
                            dispatch(logout());
                            navigate('/sign-in');
                        }}
                        className="flex h-full w-full items-center justify-center outline-none border-0 focus:outline-none"
                    >
                        <DockIcon className="text-[#0A1B3C]">
                            <LogOut className="w-5 h-5" />
                        </DockIcon>
                        <DockLabel>Logout</DockLabel>
                    </button>
                </DockItem>
            </Dock>
        </div>
    );
}

export default TeacherSidebar;
