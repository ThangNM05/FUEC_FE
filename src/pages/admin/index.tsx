import { useState, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { Search, Users, Book, Activity, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import {
  useGetSemestersQuery,
  useGetDefaultSemesterQuery,
  useGetSemesterReportQuery,
} from '@/api/semestersApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

function AdminDashboard() {
  const [semesterId, setSemesterId] = useState<string>('');

  const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });
  const { data: defaultSemester } = useGetDefaultSemesterQuery();
  const semestersList = semestersData?.items || [];
  const { data: reportData, isLoading: isReportLoading } = useGetSemesterReportQuery(semesterId, { skip: !semesterId });
  
  // Set default semester when data arrives
  useEffect(() => {
    if (defaultSemester?.id && !semesterId) {
      setSemesterId(defaultSemester.id);
    }
  }, [defaultSemester, semesterId]);

  const stats = reportData ? [
    { label: 'Total Students', value: reportData.totalStudents, icon: Users, color: 'blue', change: `${reportData.totalClasses} Classes` },
    { label: 'Total Teachers', value: reportData.totalTeachers, icon: Users, color: 'purple', change: 'Teaching Staff' },
    { label: 'Total Subjects', value: reportData.totalSubjects, icon: Book, color: 'orange', change: `${reportData.totalMaterialsUploaded} Materials` },
    { label: 'Average GPA', value: reportData.averageGpa.toFixed(2), icon: Activity, color: 'green', change: `${reportData.passingRate.toFixed(1)}% Passing Rate` }
  ] : [];

  const secondaryStats = reportData ? [
    { label: 'Assignments', value: reportData.totalAssignmentsCreated, icon: FileText },
    { label: 'Exams', value: reportData.totalExamsCreated, icon: AlertCircle },
  ] : [];

  const topSubjectsData = reportData?.topSubjectsByStudentCount.map(item => ({
    name: item.subjectCode,
    fullName: item.subjectName,
    students: item.studentCount,
    classes: item.classCount
  })) || [];

  const COLORS = ['#F37022', '#0A1B3C', '#0066b3', '#ff8a33', '#1a1f36'];

  const userStats = [
    { role: 'Students', count: 2456, percentage: 86, color: '#F37022' },
    { role: 'Teachers', count: 342, percentage: 12, color: '#ff8a33' },
    { role: 'Admins', count: 49, percentage: 2, color: '#ffb380' }
  ];

  const recentActivities = [
    { id: 1, action: 'New user registered', user: 'student_2847@fpt.edu.vn', time: '5 minutes ago', type: 'user' },
    { id: 2, action: 'Course created', user: 'Prof. Nguyen Van A', time: '1 hour ago', type: 'course' },
    { id: 3, action: 'Exam scheduled', user: 'Prof. Tran Thi B', time: '2 hours ago', type: 'exam' },
    { id: 4, action: 'System backup completed', user: 'System', time: '3 hours ago', type: 'system' }
  ];

  const systemAlerts = [
    { id: 1, message: 'Database backup scheduled for tonight at 2:00 AM', severity: 'info' },
    { id: 2, message: 'Server maintenance on May 15th, 2024', severity: 'warning' },
    { id: 3, message: 'High CPU usage detected on Server 2', severity: 'warning' }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">System Administration</h1>
          <Select
            value={semesterId}
            onChange={(value) => setSemesterId(value)}
            className="w-48"
            placeholder="Select semester"
            options={[
              ...semestersList.map((sem) => ({
                label: sem.semesterCode,
                value: sem.id,
              })),
              ...(semestersList.length === 0 && defaultSemester ? [{
                label: defaultSemester.semesterCode,
                value: defaultSemester.id,
              }] : [])
            ]}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isReportLoading ? (
            Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse h-32" />
            ))
        ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-[#0A1B3C]">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
                    </div>
                    <div className={`p-3 rounded-lg flex items-center justify-center bg-gray-50 text-[#F37022] group-hover:bg-[#F37022] group-hover:text-white transition-colors`}>
                      <Icon className={`w-6 h-6`} />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.change}</div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#F37022]"></div>
                </div>
              );
            })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
            {/* Top Subjects Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#0A1B3C]">Top Subjects by Students</h2>
                    <p className="text-sm text-gray-500">Semester View</p>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSubjectsData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={40}>
                                {topSubjectsData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Passing Rate & Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-[#0A1B3C] mb-4">Passing Rate</h3>
                    <div className="flex flex-col items-center justify-center h-48">
                        <div className="relative w-40 h-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Pass', value: reportData?.passingRate || 0 },
                                            { name: 'Fail', value: 100 - (reportData?.passingRate || 0) }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        <Cell fill="#F37022" />
                                        <Cell fill="#f3f4f6" />
                                    </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-[#0A1B3C]">{reportData?.passingRate.toFixed(1)}%</span>
                                <span className="text-[10px] text-gray-500 uppercase">Passing</span>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-[#0A1B3C] mb-4">Content Metrics</h3>
                    <div className="space-y-6 pt-2">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Assignments Created</span>
                                <span className="text-sm font-bold text-[#0A1B3C]">{reportData?.totalAssignmentsCreated}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#F37022] h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Materials Uploaded</span>
                                <span className="text-sm font-bold text-[#0A1B3C]">{reportData?.totalMaterialsUploaded}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#0A1B3C] h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Exams Scheduled</span>
                                <span className="text-sm font-bold text-[#0A1B3C]">{reportData?.totalExamsCreated}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Semester Progress Card */}
          {reportData && (
              <div className="bg-[#0A1B3C] p-6 rounded-xl border border-gray-200 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2 uppercase tracking-wider">{reportData.semesterCode}</h2>
                    <p className="text-xs text-blue-200 mb-6 font-medium">
                        {new Date(reportData.startDate).toLocaleDateString('en-GB')} - {new Date(reportData.endDate).toLocaleDateString('en-GB')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-[10px] text-blue-200 uppercase font-bold mb-1">Avg GPA</p>
                            <p className="text-xl font-bold">{reportData.averageGpa.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-[10px] text-blue-200 uppercase font-bold mb-1">Classes</p>
                            <p className="text-xl font-bold">{reportData.totalClasses}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-orange-500 rounded-full opacity-20 blur-xl"></div>
              </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-[#0A1B3C] mb-6 border-b pb-2">Quick Actions</h2>
            <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-gray-50 text-[#0A1B3C] rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-left flex items-center justify-between group shadow-sm">
                  <span>Manage Semesters</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 text-[#0A1B3C] rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-left flex items-center justify-between group shadow-sm">
                  <span>View Full Reports</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 text-[#0A1B3C] rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all text-left flex items-center justify-between group shadow-sm">
                  <span>Export Semester Data</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-[#0A1B3C] mb-6 border-b pb-2">Notifications</h2>
            {systemAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors mb-2 last:mb-0">
                <div className={`p-2 rounded-lg ${alert.severity === 'warning' ? 'bg-orange-100' : 'bg-blue-50'
                  }`}>
                  <AlertCircle className={`w-5 h-5 ${alert.severity === 'warning' ? 'text-[#F37022]' : 'text-blue-600'
                    }`} />
                </div>
                <p className="text-xs text-gray-700 flex-1 font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
