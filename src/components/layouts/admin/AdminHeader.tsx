import { useState } from 'react';
import { Bell, ChevronDown, Settings, Moon } from 'lucide-react';

interface AdminHeaderProps {
    className?: string;
}

function AdminHeader({ className = '' }: AdminHeaderProps) {
    const [selectedSemester, setSelectedSemester] = useState('Spring2025');
    const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
    const [notificationCount] = useState(3);

    const semesters = [
        { id: 'spring2025', label: 'Spring 2025', value: 'Spring2025' },
        { id: 'fall2024', label: 'Fall 2024', value: 'Fall2024' },
        { id: 'summer2024', label: 'Summer 2024', value: 'Summer2024' },
    ];

    return (
        <div className={`h-14 bg-white border-b border-gray-200 flex items-center justify-end px-4 md:px-6 gap-4 ${className}`}>
            {/* Semester Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">{selectedSemester}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showSemesterDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSemesterDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            {semesters.map((semester) => (
                                <button
                                    key={semester.id}
                                    onClick={() => {
                                        setSelectedSemester(semester.value);
                                        setShowSemesterDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${selectedSemester === semester.value
                                        ? 'text-[#F37022] font-medium bg-[#FFF5ED]'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {semester.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>


            {/* Notification Bell */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notificationCount}
                    </span>
                )}
            </button>

            {/* User Avatar */}
            <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F37022] to-[#D96419] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    A
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
            </button>
        </div>
    );
}

export default AdminHeader;
