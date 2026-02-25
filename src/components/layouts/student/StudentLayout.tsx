import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

function StudentLayout() {
  const [isMobile, setIsMobile] = useState(false);

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
      <StudentSidebar />

      {/* Main Content */}
      <div className="transition-all duration-200">
        <StudentHeader />
        <div className="pt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
