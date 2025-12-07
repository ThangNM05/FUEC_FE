import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit2, Camera, Save } from 'lucide-react';

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Nguyen Van A',
    email: 'nguyenvana@fpt.edu.vn',
    phone: '+84 123 456 789',
    address: 'District 9, Ho Chi Minh City',
    dob: '2002-05-15',
    studentId: 'SE171234',
    major: 'Software Engineering',
    year: '3rd Year',
    gpa: '8.5'
  });

  const achievements = [
    { id: 1, title: 'Dean\'s List', semester: 'Fall 2023', icon: Award },
    { id: 2, title: 'Best Project Award', semester: 'Spring 2024', icon: Award },
    { id: 3, title: 'Perfect Attendance', semester: 'Fall 2023', icon: Award }
  ];

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile saved successfully!');
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage your personal information.</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold ${
            isEditing 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 mx-auto">
                  {profile.name.charAt(0)}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">{profile.name}</h2>
              <p className="text-gray-600">{profile.studentId}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {profile.major}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-500">Year</span>
                  <p className="font-medium text-gray-900">{profile.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-500">Current GPA</span>
                  <p className="font-bold text-green-600 text-lg">{profile.gpa}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map(achievement => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-500">{achievement.semester}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={e => setProfile({...profile, dob: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-6">Academic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={profile.studentId}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                <input
                  type="text"
                  value={profile.major}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="text"
                  value={profile.year}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current GPA</label>
                <input
                  type="text"
                  value={profile.gpa}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
