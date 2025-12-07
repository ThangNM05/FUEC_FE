import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, Users, BookOpen, BarChart3, Database, Settings,
  ChevronDown, ChevronRight, User, LogOut, Menu, X, Layers
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

function AdminSidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    {
      id: 'student_mgmt',
      label: 'Student Management',
      icon: Users,
      subItems: [
        { id: 'students', label: 'Students', icon: Users, path: '/admin/students' },
        { id: 'classes', label: 'Classes', icon: Layers, path: '/admin/classes' }
      ]
    },
    { id: 'teachers', label: 'Teacher Management', icon: Users, path: '/admin/teachers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'database', label: 'Database', icon: Database, path: '/admin/database' },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'courses', label: 'Courses', icon: BookOpen, path: '/admin/settings/courses' },
        { id: 'exams', label: 'Exams', icon: BookOpen, path: '/admin/settings/exams' }
      ]
    }
  ];

  const isActiveMenu = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      toggleSubMenu(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-200 z-50 ${
        isOpen ? 'w-60' : 'w-20'
      }`}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <h3 className="font-semibold text-gray-900 text-base">EduConnect</h3>
              <p className="text-[11px] text-gray-500">www.fpt.edu.vn</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:text-orange-600 hover:border-orange-600 transition-all flex-shrink-0"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="py-4 px-3 overflow-y-auto h-[calc(100%-180px)]">
        {isOpen && <div className="px-3 mb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">MENU</div>}
        
        {menuItems.map(item => {
          const Icon = item.icon;
          const isExpanded = expandedMenus[item.id];
          const isActive = isActiveMenu(item);

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                } ${!isOpen ? 'justify-center' : ''}`}
                onClick={() => handleMenuClick(item)}
                title={!isOpen ? item.label : ''}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0`} />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    {item.subItems && (
                      <span className="flex-shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Sub-menu */}
              {isOpen && item.subItems && isExpanded && (
                <div className="ml-3 pl-3 border-l border-gray-200 mt-1 mb-1 flex flex-col gap-1">
                  {item.subItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = location.pathname === sub.path;
                    
                    return (
                      <button
                        key={sub.id}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                          isSubActive 
                            ? 'bg-orange-50 text-orange-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => navigate(sub.path)}
                      >
                        <SubIcon className="w-[14px] h-[14px] flex-shrink-0" />
                        <span className="font-medium">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-4 bg-white">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all mb-1 ${!isOpen ? 'justify-center' : ''}`}
          title={!isOpen ? 'Profile' : ''}
        >
          <User className="w-[18px] h-[18px] flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">Profile</span>}
        </button>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-all ${!isOpen ? 'justify-center' : ''}`}
          title={!isOpen ? 'Logout' : ''}
          onClick={() => {
            localStorage.removeItem('user');
            navigate('/sign-in');
          }}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
