import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, BookOpen, MessageSquare, Calendar, BarChart3,
  User, LogOut, Clock
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

function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'schedule', label: 'Schedule', icon: Clock, path: '/student/schedule' },
    { id: 'forums', label: 'Forums', icon: MessageSquare, path: '/student/forums' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/student/messages' },
    { id: 'exams', label: 'Exam Schedule', icon: Calendar, path: '/student/exams' },
    { id: 'grades', label: 'Grades', icon: BarChart3, path: '/student/grades' }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50 pointer-events-none px-4">
      <Dock className="pointer-events-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const unreadCount = item.id === 'messages' ? 4 : 0;

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
            onClick={() => handleMenuClick('/student/profile')}
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

export default StudentSidebar;
