import { useState } from 'react';
import { Send, Search, Paperclip, Image, Smile, Users } from 'lucide-react';

interface Message {
    id: number;
    sender: string;
    senderRole: 'student' | 'teacher';
    message: string;
    time: string;
    isMe?: boolean;
}

interface ClassChat {
    id: number;
    courseCode: string;
    courseName: string;
    className: string;
    unreadCount: number;
    lastMessage: string;
    lastMessageTime: string;
    participants: number;
}

function StudentMessages() {
    const [selectedChat, setSelectedChat] = useState<ClassChat | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const classChats: ClassChat[] = [
        {
            id: 1,
            courseCode: 'WEB301',
            courseName: 'Web Development',
            className: 'SE1803',
            unreadCount: 3,
            lastMessage: 'Prof. Le Van C: Remember to submit your final project by Friday',
            lastMessageTime: '10:30 AM',
            participants: 40
        },
        {
            id: 2,
            courseCode: 'DBS202',
            courseName: 'Database Systems',
            className: 'SE1801',
            unreadCount: 0,
            lastMessage: 'Nguyen Van A: Can anyone help with Question 3?',
            lastMessageTime: 'Yesterday',
            participants: 45
        },
        {
            id: 3,
            courseCode: 'NET301',
            courseName: 'Computer Networks',
            className: 'SE1805',
            unreadCount: 1,
            lastMessage: 'Prof. Vu Thi F: Class is postponed to next week',
            lastMessageTime: '2 days ago',
            participants: 38
        }
    ];

    const messages: Message[] = selectedChat ? [
        {
            id: 1,
            sender: 'Prof. Le Van C',
            senderRole: 'teacher',
            message: 'Good morning everyone! Today we will cover React Hooks.',
            time: '8:00 AM'
        },
        {
            id: 2,
            sender: 'Nguyen Van A',
            senderRole: 'student',
            message: 'Good morning professor!',
            time: '8:02 AM'
        },
        {
            id: 3,
            sender: 'Tran Thi B',
            senderRole: 'student',
            message: 'Could you share the lecture slides?',
            time: '8:15 AM'
        },
        {
            id: 4,
            sender: 'Prof. Le Van C',
            senderRole: 'teacher',
            message: 'Sure, I will upload them to the course page shortly.',
            time: '8:17 AM'
        },
        {
            id: 5,
            sender: 'You',
            senderRole: 'student',
            message: 'Thank you professor! Looking forward to today\'s lesson.',
            time: '8:20 AM',
            isMe: true
        },
        {
            id: 6,
            sender: 'Prof. Le Van C',
            senderRole: 'teacher',
            message: 'Remember to submit your final project by Friday. No extensions!',
            time: '10:30 AM'
        }
    ] : [];

    const filteredChats = classChats.filter(chat => {
        const query = searchQuery.toLowerCase();
        return (
            chat.courseCode.toLowerCase().includes(query) ||
            chat.courseName.toLowerCase().includes(query) ||
            chat.className.toLowerCase().includes(query)
        );
    });

    const handleSendMessage = () => {
        if (messageInput.trim() && selectedChat) {
            // In a real app, this would send the message to the backend
            console.log('Sending message:', messageInput);
            setMessageInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col p-4 md:p-6 h-[calc(100vh-4rem)] animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-6">Messages</h1>

            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                {/* Left Sidebar - Class Chats List */}
                <div className="w-full lg:w-80 flex flex-col bg-white rounded-xl border border-gray-200 animate-slideIn">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Chats List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left ${selectedChat?.id === chat.id ? 'bg-orange-50 border-l-4 border-l-[#F37022]' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
                                            {chat.courseCode}
                                        </span>
                                        <span className="text-xs text-gray-500">{chat.className}</span>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-[#F37022] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="font-medium text-[#0A1B3C] text-sm mb-1">{chat.courseName}</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{chat.participants} participants</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                                <p className="text-xs text-gray-400 mt-1">{chat.lastMessageTime}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Chat Interface */}
                <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
                                                {selectedChat.courseCode}
                                            </span>
                                            <span className="text-sm text-gray-500">{selectedChat.className}</span>
                                        </div>
                                        <h2 className="font-semibold text-[#0A1B3C]">{selectedChat.courseName}</h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Users className="w-4 h-4" />
                                        <span>{selectedChat.participants} participants</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex animate-slideUp ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.isMe ? 'order-2' : 'order-1'}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className={`text-xs font-semibold ${msg.senderRole === 'teacher' ? 'text-[#F37022]' : 'text-gray-700'
                                                    }`}>
                                                    {msg.sender}
                                                </span>
                                                <span className="text-xs text-gray-400">{msg.time}</span>
                                            </div>
                                            <div className={`rounded-lg p-3 ${msg.isMe
                                                ? 'bg-[#F37022] text-white'
                                                : msg.senderRole === 'teacher'
                                                    ? 'bg-orange-50 text-[#0A1B3C] border border-orange-200'
                                                    : 'bg-gray-100 text-[#0A1B3C]'
                                                }`}>
                                                <p className="text-sm">{msg.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex items-end gap-3">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-colors">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-colors">
                                            <Image className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-colors">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="p-2.5 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Select a class to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentMessages;
