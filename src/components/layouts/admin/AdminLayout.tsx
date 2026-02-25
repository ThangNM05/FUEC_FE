import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

function AdminLayout() {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AdminSidebar />

      {/* Main Content */}
      <div className="transition-all duration-200">
        <AdminHeader />
        <div className="pt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
