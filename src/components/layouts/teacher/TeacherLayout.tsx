import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/authSlice';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';

function TeacherLayout() {
    const [isMobile, setIsMobile] = useState(false);
    const user = useSelector(selectCurrentUser);

    if (!user || user.role !== 'Teacher') {
        return <Navigate to="/not-found" replace />;
    }

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="h-screen bg-slate-50/50 relative overflow-hidden">
            {/* Glassmorphism Background Blobs */}
            <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F37022]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#0A1B3C]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

            <div className="relative z-10">
                <TeacherSidebar />

                {/* Main Content */}
                <div className="transition-all duration-200">
                    <TeacherHeader />
                    <div className="pt-4 h-[calc(100vh-56px)] overflow-y-auto px-0">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherLayout;
