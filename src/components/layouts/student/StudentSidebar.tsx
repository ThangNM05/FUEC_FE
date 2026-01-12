import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, BookOpen, MessageSquare, Calendar, BarChart3,
  User, LogOut, PanelLeftClose, Menu, Clock
} from 'lucide-react';
import fptLogo from '@/assets/img_fpt.svg';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

function StudentSidebar({ isOpen, toggleSidebar, isMobile = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'schedule', label: 'Schedule', icon: Clock, path: '/student/schedule' },
    { id: 'forums', label: 'Forums', icon: MessageSquare, path: '/student/forums' },
    { id: 'exams', label: 'Exam Schedule', icon: Calendar, path: '/student/exams' },
    { id: 'grades', label: 'Grades', icon: BarChart3, path: '/student/grades' }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) toggleSidebar();
  };

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-200 z-50 flex flex-col ${isMobile ? 'w-72' : isOpen ? 'w-64' : 'w-20'
          }`}
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {/* Header - Logo */}
        <div className={`p-4 ${!isOpen && !isMobile ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${isOpen || isMobile ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center ${isOpen || isMobile ? 'gap-3' : ''}`}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center p-2">
                <img src={fptLogo} alt="FPT Logo" className="w-full h-full object-contain" />
              </div>
              {(isOpen || isMobile) && (
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-[#F37022] text-base">EduConnect</h3>
                  <p className="text-[11px] text-gray-500">www.fpt.edu.vn</p>
                </div>
              )}
            </div>
            {(isOpen || isMobile) && (
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
              >
                <PanelLeftClose className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Button - Only when collapsed on desktop */}
        {!isMobile && !isOpen && (
          <div className="px-4 pb-3 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="w-12 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Menu className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto">
          {(isOpen || isMobile) && (
            <div className="px-3 mb-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">MENU</div>
          )}

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${isActive
                    ? 'bg-orange-50 text-[#F37022]'
                    : 'text-[#0A1B3C] hover:bg-gray-50'
                  } ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                onClick={() => handleMenuClick(item.path)}
                title={!isOpen && !isMobile ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(isOpen || isMobile) && (
                  <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-3 bg-white">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-[#0A1B3C] hover:bg-gray-50 rounded-lg transition-all mb-1 ${!isOpen && !isMobile ? 'justify-center' : ''
              }`}
            title={!isOpen && !isMobile ? 'Profile' : ''}
            onClick={() => handleMenuClick('/student/profile')}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {(isOpen || isMobile) && <span className="text-sm font-medium">Profile</span>}
          </button>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-[#0A1B3C] hover:bg-gray-50 rounded-lg transition-all ${!isOpen && !isMobile ? 'justify-center' : ''
              }`}
            title={!isOpen && !isMobile ? 'Logout' : ''}
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/sign-in');
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(isOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentSidebar;
