import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    LayoutDashboard, BookOpen, Calendar, BarChart3,
    User, LogOut, MessageSquare, Database, MoreHorizontal
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/authSlice';
import { Dock, DockIcon, DockItem, DockLabel, DockSeparator } from "../../ui/dock";

interface MenuItem {
    id: string;
    label: string;
    icon: any;
    path: string;
}

const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
    { id: 'classes', label: 'Classes', icon: BookOpen, path: '/teacher/classrooms' },
    { id: 'question-banks', label: 'Q-Banks', icon: Database, path: '/teacher/question-banks' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/teacher/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/teacher/reports' }
];

// iOS HIG: max 5 tabs including "More"
const primaryTabs = allMenuItems.slice(0, 4);
const moreTabs: MenuItem[] = [
    ...allMenuItems.slice(4),
    { id: 'profile', label: 'Profile', icon: User, path: '/teacher/profile' },
];

function TeacherSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isMobile, setIsMobile] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Close "More" menu on outside click
    useEffect(() => {
        if (!moreOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [moreOpen]);

    const handleMenuClick = (path: string) => {
        navigate(path);
        setMoreOpen(false);
    };

    const isActiveInMore = moreTabs.some(t => location.pathname === t.path);

    // ─── iOS Tab Bar (mobile < 640px) ───
    if (isMobile) {
        return (
            <div
                className="fixed bottom-0 left-0 right-0 z-50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60">
                    <div className="flex items-stretch justify-around px-1">
                        {/* Primary 4 tabs */}
                        {primaryTabs.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            const unreadCount = item.id === 'messages' ? 8 : 0;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.path)}
                                    className="flex flex-col items-center justify-center gap-0.5 py-2 min-w-[44px] min-h-[49px] relative outline-none border-0"
                                >
                                    <div className="relative">
                                        <Icon
                                            className="w-[22px] h-[22px] transition-colors"
                                            style={{ color: isActive ? '#F37022' : '#8E8E93' }}
                                        />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] bg-[#FF3B30] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className="text-[10px] font-medium leading-tight transition-colors"
                                        style={{ color: isActive ? '#F37022' : '#8E8E93' }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}

                        {/* "More" tab */}
                        <div ref={moreRef} className="relative flex">
                            <button
                                onClick={() => setMoreOpen(!moreOpen)}
                                className="flex flex-col items-center justify-center gap-0.5 py-2 min-w-[44px] min-h-[49px] outline-none border-0"
                            >
                                <MoreHorizontal
                                    className="w-[22px] h-[22px] transition-colors"
                                    style={{ color: isActiveInMore || moreOpen ? '#F37022' : '#8E8E93' }}
                                />
                                <span
                                    className="text-[10px] font-medium leading-tight transition-colors"
                                    style={{ color: isActiveInMore || moreOpen ? '#F37022' : '#8E8E93' }}
                                >
                                    More
                                </span>
                            </button>

                            {/* More dropdown menu */}
                            {moreOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-200/50 overflow-hidden">
                                    <div className="py-1">
                                        {moreTabs.map(item => {
                                            const Icon = item.icon;
                                            const isActive = location.pathname === item.path;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleMenuClick(item.path)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 text-left outline-none border-0 transition-colors hover:bg-gray-50 active:bg-gray-100"
                                                >
                                                    <Icon
                                                        className="w-5 h-5 flex-shrink-0"
                                                        style={{ color: isActive ? '#F37022' : '#3C3C43' }}
                                                    />
                                                    <span
                                                        className="text-[15px] font-normal"
                                                        style={{ color: isActive ? '#F37022' : '#1C1C1E' }}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {/* Logout */}
                                        <div className="border-t border-gray-200/60 mt-1 pt-1">
                                            <button
                                                onClick={() => {
                                                    dispatch(logout());
                                                    navigate('/sign-in');
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left outline-none border-0 transition-colors hover:bg-gray-50 active:bg-gray-100"
                                            >
                                                <LogOut className="w-5 h-5 flex-shrink-0 text-[#FF3B30]" />
                                                <span className="text-[15px] font-normal text-[#FF3B30]">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── macOS Dock (desktop ≥ 640px) ───
    return (
        <div className="fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50 pointer-events-none px-4">
            <Dock className="pointer-events-auto">
                {allMenuItems.map(item => {
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
