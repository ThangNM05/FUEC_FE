import { useState } from 'react';
import { Outlet } from 'react-router';
import AdminSidebar from './AdminSidebar';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`transition-all duration-200 ${isSidebarOpen ? 'ml-60' : 'ml-20'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
