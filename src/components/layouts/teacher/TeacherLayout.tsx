import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';

function TeacherLayout() {
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
            <TeacherSidebar />

            {/* Main Content */}
            <div className="transition-all duration-200">
                <TeacherHeader />
                <div className="pt-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default TeacherLayout;
