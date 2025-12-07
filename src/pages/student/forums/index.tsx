import { Search, MessageSquare, ThumbsUp, MessageCircle, Clock } from 'lucide-react';

function StudentForums() {
  const forumCategories = [
    { id: 1, name: 'General Discussion', threads: 245, posts: 1823, color: 'orange' },
    { id: 2, name: 'Course Questions', threads: 189, posts: 1456, color: 'blue' },
    { id: 3, name: 'Study Groups', threads: 67, posts: 432, color: 'green' },
    { id: 4, name: 'Announcements', threads: 34, posts: 156, color: 'purple' }
  ];

  const recentThreads = [
    {
      id: 1,
      title: 'Help with Database Normalization Assignment',
      category: 'Course Questions',
      author: 'Nguyen Van A',
      replies: 12,
      likes: 8,
      lastActivity: '2 hours ago',
      isAnswered: true
    },
    {
      id: 2,
      title: 'Study Group for SWE101 Final Exam',
      category: 'Study Groups',
      author: 'Tran Thi B',
      replies: 24,
      likes: 15,
      lastActivity: '3 hours ago',
      isAnswered: false
    },
    {
      id: 3,
      title: 'Best Resources for Learning React?',
      category: 'General Discussion',
      author: 'Le Van C',
      replies: 31,
      likes: 22,
      lastActivity: '5 hours ago',
      isAnswered: true
    },
    {
      id: 4,
      title: 'Important: Final Exam Schedule Updated',
      category: 'Announcements',
      author: 'Admin',
      replies: 5,
      likes: 45,
      lastActivity: '1 day ago',
      isAnswered: false,
      isPinned: true
    },
    {
      id: 5,
      title: 'Tips for Mobile App Development Project',
      category: 'Course Questions',
      author: 'Pham Thi D',
      replies: 18,
      likes: 12,
      lastActivity: '1 day ago',
      isAnswered: true
    }
  ];

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.orange;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Forums</h1>
          <p className="text-gray-600 mt-1">Discuss, ask questions, and collaborate with peers.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search forums..." className="outline-none text-sm text-gray-900 bg-transparent w-40" />
          </div>
          <button className="px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600">
            New Thread
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {forumCategories.map(category => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 ${getCategoryColor(category.color)} rounded-xl flex items-center justify-center mb-3`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.threads} threads • {category.posts} posts</p>
          </div>
        ))}
      </div>

      {/* Recent Discussions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900">Recent Discussions</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200">All</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200">My Threads</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200">Following</button>
          </div>
        </div>

        <div className="space-y-3">
          {recentThreads.map(thread => (
            <div 
              key={thread.id} 
              className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                thread.isPinned ? 'border-l-4 border-orange-500 bg-orange-50' : 'border border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {thread.isPinned && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Pinned</span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{thread.category}</span>
                    {thread.isAnswered && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">Answered</span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{thread.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>by {thread.author}</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{thread.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{thread.likes} likes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                  <span>{thread.lastActivity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
            Load More Threads
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentForums;
