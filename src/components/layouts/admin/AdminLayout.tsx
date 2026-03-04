import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen bg-slate-50/50 relative overflow-hidden">
      {/* Glassmorphism Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F37022]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#0A1B3C]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>

      <div className="relative z-10 w-full h-screen flex flex-col">
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Mobile Header */}
        {isMobile && !isSidebarOpen && (
          <div className="fixed top-0 left-0 right-0 h-14 bg-white/40 backdrop-blur-xl border-b border-white/40 z-30 flex items-center px-4 shadow-sm">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <span className="ml-3 font-semibold text-[#0A1B3C]">EduConnect</span>
          </div>
        )}

        {/* Main Content */}
        <div className={`transition-all duration-200 relative flex-1 ${isMobile
          ? 'ml-0 pt-14'
          : isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}>
          {/* Admin Header - Only on desktop */}
          {!isMobile && (
            <AdminHeader />
          )}
          <div className="pt-4 px-4 pb-6 h-[calc(100vh-56px)] overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
