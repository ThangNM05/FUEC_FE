import { Search } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    showSemester?: boolean;
    semester?: string;
    onSemesterChange?: (semester: string) => void;
    showSearch?: boolean;
    searchPlaceholder?: string;
}

function PageHeader({
    title,
    description,
    showSemester = false,
    semester = 'SPRING2025',
    onSemesterChange,
    showSearch = false,
    searchPlaceholder = 'Search...'
}: PageHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            {/* Title and Semester */}
            <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">{title}</h1>
                    {showSemester && (
                        <select
                            value={semester}
                            onChange={(e) => onSemesterChange?.(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
                        >
                            <option value="SPRING2025">Spring 2025</option>
                            <option value="FALL2024">Fall 2024</option>
                            <option value="SUMMER2024">Summer 2024</option>
                        </select>
                    )}
                </div>
                {description && (
                    <p className="text-sm md:text-base text-gray-600">{description}</p>
                )}
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="flex-1 outline-none text-sm md:text-base text-[#0A1B3C]"
                    />
                </div>
            )}
        </div>
    );
}

export default PageHeader;
