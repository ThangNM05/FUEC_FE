import { useState } from 'react';
import { Search, Users, Book, Activity, Server, AlertCircle } from 'lucide-react';

function AdminDashboard() {
  const [semester, setSemester] = useState('SPRING2025');

  const stats = [
    { label: 'Total Users', value: '2,847', icon: Users, color: 'orange', change: '+127 this month' },
    { label: 'Active Courses', value: '156', icon: Book, color: 'orange', change: '12 new courses' },
    { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'orange', change: 'Last 30 days' },
    { label: 'Storage Used', value: '67%', icon: Server, color: 'orange', change: '2.4 TB / 3.6 TB' }
  ];

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
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">System Administration</h1>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
            >
              <option value="SPRING2025">Spring 2025</option>
              <option value="FALL2024">Fall 2024</option>
              <option value="SUMMER2024">Summer 2024</option>
            </select>
          </div>

        </div>
        <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-white rounded-lg border border-gray-200">
          <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, courses, logs..."
            className="flex-1 outline-none text-sm md:text-base text-[#0A1B3C]"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-[#0A1B3C]">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-sm text-[#F37022] font-medium">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0A1B3C]">User Distribution</h2>
              <a href="#" className="text-orange-500 text-sm font-medium hover:underline">View Details</a>
            </div>
            {userStats.map(stat => (
              <div key={stat.role} className="mb-5 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-[#0A1B3C]">{stat.role}</span>
                  <span className="text-sm font-semibold text-gray-700">{stat.count} ({stat.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0A1B3C]">Recent Activities</h2>
              <a href="#" className="text-orange-500 text-sm font-medium hover:underline">View All Logs</a>
            </div>
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors mb-2 last:mb-0">
                <div className="p-2 bg-orange-100 rounded-lg">
                  {activity.type === 'user' && <Users className="w-5 h-5 text-orange-600" />}
                  {activity.type === 'course' && <Book className="w-5 h-5 text-orange-600" />}
                  {activity.type === 'exam' && <Activity className="w-5 h-5 text-orange-600" />}
                  {activity.type === 'system' && <Server className="w-5 h-5 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#0A1B3C] text-sm">{activity.action}</h4>
                  <p className="text-sm text-gray-600 mt-1">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Alerts */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-[#0A1B3C] mb-6">System Alerts</h2>
            {systemAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors mb-2 last:mb-0">
                <div className={`p-2 rounded-lg ${alert.severity === 'warning' ? 'bg-orange-100' : 'bg-orange-50'
                  }`}>
                  <AlertCircle className={`w-5 h-5 ${alert.severity === 'warning' ? 'text-[#F37022]' : 'text-orange-400'
                    }`} />
                </div>
                <p className="text-sm text-gray-700 flex-1">{alert.message}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-[#0A1B3C] mb-6">Quick Actions</h2>
            <button className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors mb-2">
              Add New User
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors mb-2">
              Create Course
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors mb-2">
              System Settings
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
