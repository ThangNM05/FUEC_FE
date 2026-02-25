import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, Users, BookOpen, Database, Settings,
  LogOut, Layers, Building2, DoorOpen, GraduationCap, ClipboardList, Calendar, FileText, BookMarked
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/authSlice';
import { Dock, DockIcon, DockItem, DockLabel, DockSeparator } from "../../ui/dock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useIsMobile } from '../../../hooks/use-mobile';

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

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

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
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/admin/schedule' },
    { id: 'database', label: 'Database', icon: Database, path: '/admin/database' },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'majors', label: 'Majors', icon: Building2, path: '/admin/settings/majors' },
        { id: 'classrooms', label: 'Classrooms', icon: DoorOpen, path: '/admin/settings/classrooms' },
        { id: 'subjects', label: 'Subjects', icon: GraduationCap, path: '/admin/settings/subjects' },
        { id: 'exam-types', label: 'Exam Types', icon: ClipboardList, path: '/admin/settings/exam-types' },
        { id: 'semesters', label: 'Semesters', icon: Calendar, path: '/admin/settings/semesters' },
        { id: 'curriculum', label: 'Curriculum', icon: BookMarked, path: '/admin/settings/curriculum' },
        { id: 'syllabus', label: 'Syllabus', icon: FileText, path: '/admin/settings/syllabus' }
      ]
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (path: string) => {
    navigate(path);
  };

  const isActiveMenu = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  return (
    <div className="fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50 pointer-events-none px-2 sm:px-4">
      <Dock className="pointer-events-auto" iconSize={isMobile ? 36 : 48}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = isActiveMenu(item);

          return (
            <DockItem key={item.id}>
              {item.subItems ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-full w-full items-center justify-center outline-none border-0 focus:outline-none">
                    <DockIcon className={isActive ? "text-[#F37022]" : "text-[#0A1B3C]"}>
                      <Icon className="w-5 h-5" />
                    </DockIcon>
                    <DockLabel>{item.label}</DockLabel>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="center" className="mb-2 z-50">
                    {item.subItems.map(sub => {
                      const SubIcon = sub.icon;
                      return (
                        <DropdownMenuItem key={sub.id} onClick={() => handleSubMenuClick(sub.path)} className="cursor-pointer gap-2 py-2">
                          <SubIcon className="h-4 w-4" />
                          <span>{sub.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button onClick={() => handleMenuClick(item)} className="flex h-full w-full items-center justify-center outline-none border-0 focus:outline-none">
                  <DockIcon className={isActive ? "text-[#F37022]" : "text-[#0A1B3C]"}>
                    <Icon className="w-5 h-5" />
                  </DockIcon>
                  <DockLabel>{item.label}</DockLabel>
                </button>
              )}
            </DockItem>
          );
        })}

        <DockSeparator />

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

export default AdminSidebar;
