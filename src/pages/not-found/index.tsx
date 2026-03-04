import { useNavigate } from 'react-router';
import Lottie from 'lottie-react';
import notFoundAnimation from '@/assets/lottie/404.json';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center px-4">
            {/* Background decorative blobs */}
            <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F37022]/8 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] bg-[#0A1B3C]/6 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-lg w-full">
                {/* Lottie Animation */}
                <div className="w-72 h-72 md:w-96 md:h-96 mx-auto -mb-4">
                    <Lottie
                        animationData={notFoundAnimation}
                        loop
                        autoplay
                        className="w-full h-full"
                    />
                </div>

                {/* Text Content */}
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-3">
                    Page Not Found
                </h1>
                <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    The page you are trying to access doesn't exist or has been moved. Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        ← Go Back
                    </button>
                    <button
                        onClick={() => navigate('/sign-in', { replace: true })}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#F37022] text-white rounded-xl text-sm font-semibold hover:bg-[#d95f19] transition-all active:scale-95 shadow-lg shadow-orange-200/50"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
