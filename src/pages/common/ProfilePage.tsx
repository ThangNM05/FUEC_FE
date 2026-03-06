import { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Save, Edit2, Hash } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import { useGetAccountByIdQuery } from '../../api/accountsApi';

function ProfilePage() {
    const currentUser = useSelector(selectCurrentUser);
    // Use the ID from the token/state to fetch full profile
    const { data: userProfile, isLoading, error } = useGetAccountByIdQuery(currentUser?.id || '', {
        skip: !currentUser?.id
    });

    // Default to user data or placeholders
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        studentCode: ''
    });

    // Update form data when user data is fetched
    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                email: userProfile.email || '',
                studentCode: userProfile.studentCode || ''
            });
        }
    }, [userProfile]);


    if (isLoading) {
        return <div className="p-6">Loading profile...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading profile.</div>;
    }

    if (!currentUser) {
        return <div className="p-6">Please log in to view profile.</div>;
    }

    if (!userProfile) {
        return <div className="p-6">User profile not found.</div>;
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header - Aligned simple text as requested */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-5xl font-bold text-orange-600">
                                {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-[#F37022] text-white rounded-full hover:bg-[#D96419] shadow-lg cursor-default">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-[#0A1B3C] text-center">{userProfile.fullName}</h2>
                        {userProfile.studentCode && (
                            <div className="mt-1 text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full text-sm">
                                {userProfile.studentCode}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-[#0A1B3C] mb-6 text-lg">Personal Information</h3>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <User className="w-4 h-4 inline mr-2 text-gray-400" />Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>

                            {/* Student Code (if exists) */}
                            {formData.studentCode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Hash className="w-4 h-4 inline mr-2 text-gray-400" />Student Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.studentCode}
                                        disabled
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="w-4 h-4 inline mr-2 text-gray-400" />Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
