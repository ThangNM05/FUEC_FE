import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';

function TeacherLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

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
        <div className="min-h-screen bg-gray-50">
            <TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            {/* Mobile Header */}
            {isMobile && !isSidebarOpen && (
                <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center px-4">
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="ml-3 font-semibold text-gray-900">EduConnect</span>
                </div>
            )}

            <div className={`transition-all duration-200 ${isMobile
                ? 'ml-0 pt-14'
                : isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}>
                {/* Teacher Header - Only on desktop */}
                {!isMobile && (
                    <TeacherHeader />
                )}
                <Outlet />
            </div>
        </div>
    );
}

export default TeacherLayout;
