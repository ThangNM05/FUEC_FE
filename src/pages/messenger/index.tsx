import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Send,
  Search,
  Paperclip,
  Smile,
  Users,
  Plus,
  Phone,
  MoreVertical,
  ArrowLeft,
  X,
  UserPlus,
  UserMinus,
  Edit3,
  Image as ImageIcon,
  LogOut,
  ChevronDown,
  Loader2,
  MessageSquare,
  Check,
  CheckCheck,
  Video as VideoIcon,
} from 'lucide-react';
import { useUploadFileMutation } from '@/api/filesApi';
import { selectCurrentUser } from '@/redux/authSlice';
import {
  useGetUserConversationsQuery,
  useGetConversationByIdQuery,
  useGetConversationMessagesQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useCreateMessageMutation,
  useMarkMessagesAsReadMutation,
} from '@/api/messengerApi';
import { useSearchParams } from 'react-router-dom';
import { useLazyGetAccountsQuery } from '@/api/accountsApi';
import type { Account } from '@/types/account.types';
import { useChatHub } from '@/hooks/useChatHub';
import type {
  ConversationDto,
  MessageDto,
  SignalRMessageDto,
  SignalRConversationDto,
  MemberAddedEvent,
} from '@/types/messenger.types';
import { ConversationType, MessageType, MessageStatus } from '@/types/messenger.types';
import StudentSidebar from '@/components/layouts/student/StudentSidebar';
import TeacherSidebar from '@/components/layouts/teacher/TeacherSidebar';
import AdminSidebar from '@/components/layouts/admin/AdminSidebar';
import StudentHeader from '@/components/layouts/student/StudentHeader';
import TeacherHeader from '@/components/layouts/teacher/TeacherHeader';
import AdminHeader from '@/components/layouts/admin/AdminHeader';
// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const parseUtcDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`);
};
function Messenger() {
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? '';

  // ── Local state ──
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<MessageDto[]>([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  // Custom modals
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberResults, setAddMemberResults] = useState<Account[]>([]);
  const [addMemberSelected, setAddMemberSelected] = useState<Account[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [pendingAttachment, setPendingAttachment] = useState<{ file: File; type: MessageType; previewUrl: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendingAttachment, setSendingAttachment] = useState<{ type: MessageType; previewUrl: string } | null>(null);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(true);

  // ── User search state (Teams-like) ──
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [pendingChatUser, setPendingChatUser] = useState<Account | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Track unread dot locally inside the session
  const [hasNewMessages, setHasNewMessages] = useState<Set<string>>(new Set());

  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // ── RTK Query hooks ──
  const {
    data: conversationsData,
    refetch: refetchConversations,
  } = useGetUserConversationsQuery(
    { userId, pageSize: 100 },
    { skip: !userId }
  );

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetConversationMessagesQuery(
    { conversationId: selectedConversation?.id ?? '', page: messagePage, pageSize: 200 },
    { skip: !selectedConversation?.id }
  );

  const [createMessage] = useCreateMessageMutation();
  const [createConversation] = useCreateConversationMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [addMember] = useAddMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [triggerSearchAccounts] = useLazyGetAccountsQuery();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Optional: limit file size to 5MB
    const limitMB = 5;
    if (file.size > limitMB * 1024 * 1024) {
      alert(`File size exceeds ${limitMB}MB limit`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let mType: MessageType = MessageType.File;
    if (file.type.startsWith('image/')) mType = MessageType.Image;
    else if (file.type.startsWith('video/')) mType = MessageType.Video;

    if (pendingAttachment) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingAttachment({ file, type: mType, previewUrl });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const conversations = conversationsData?.items ?? [];

  // ── Sync selectedConversation with latest data from conversations list ──
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updated = conversations.find((c) => c.id === selectedConversation.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedConversation)) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations]);

  // ── Reset pagination when conversation changes ──
  useEffect(() => {
    setMessagePage(1);
    setHasMoreMessages(true);
    setLocalMessages([]);
  }, [selectedConversation?.id]);

  // ── Sync messages from API to local state ──
  useEffect(() => {
    if (messagesData?.items) {
      setLocalMessages((prev) => {
        const combined = [...prev, ...messagesData.items];
        const uniqueMap = new Map();
        combined.forEach(m => uniqueMap.set(m.id, m));
        const unique = Array.from(uniqueMap.values());
        return unique.sort((a, b) => {
          const tA = parseUtcDate(a.createdAt)?.getTime() || 0;
          const tB = parseUtcDate(b.createdAt)?.getTime() || 0;
          return tA - tB;
        });
      });

      if (messagesData.items.length < 10) {
        setHasMoreMessages(false);
      } else {
        setHasMoreMessages(true);
      }
    }
  }, [messagesData]);

  // ── Track responsive breakpoints ──
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileDevice(mobile);
      if (mobile) setAdminSidebarOpen(false);
      else setAdminSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // ── Clear unread on window focus
  useEffect(() => {
    const onFocus = () => {
      setHasNewMessages(new Set());
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const isAdmin = currentUser?.role === 'Admin';

  // Restore scroll position when older messages are loaded
  useLayoutEffect(() => {
    if (messagePage > 1 && prevScrollHeightRef.current > 0 && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [localMessages, messagePage]);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // ── Scroll to bottom on first load and new messages ──
  useEffect(() => {
    if (messagePage === 1) {
      scrollToBottom();
    }
  }, [localMessages, messagePage, sendingAttachment]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && !isFetchingMessages && hasMoreMessages) {
      prevScrollHeightRef.current = scrollHeight;
      setMessagePage((p) => p + 1);
    }
  };

  // ── Mark messages as read when opening a conversation ──
  useEffect(() => {
    if (selectedConversation?.id && userId) {
      markAsRead({ conversationId: selectedConversation.id, userId }).catch(() => { });
    }
  }, [selectedConversation?.id, userId, markAsRead]);

  // ── Debounced user search ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const result = await triggerSearchAccounts({
          page: 0,
          pageSize: 10,
          searchTerm: searchQuery.trim(),
        }).unwrap();
        // Filter out the current user from results
        const filtered = (result.items ?? []).filter((acc: Account) => acc.id !== userId);
        setSearchResults(filtered);
        setShowSearchDropdown(filtered.length > 0);
      } catch (err) {
        console.error('Failed to search accounts:', err);
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, triggerSearchAccounts, userId]);

  // ── Close search dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── SignalR ──
  const [searchParams] = useSearchParams();
  const conversationIdFromParams = searchParams.get('conversationId') ?? '';
  const { data: conversationFromParam } = useGetConversationByIdQuery(conversationIdFromParams, { skip: !conversationIdFromParams });

  const handleReceiveMessage = useCallback(
    (msg: SignalRMessageDto) => {
      // Convert SignalR DTO to local MessageDto format
      const newMsg: MessageDto = {
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        messageContent: msg.messageContent,
        messageType: msg.messageType,
        messageStatus: msg.messageStatus,
        senderFullName: msg.senderName,
        createdAt: msg.createdAt,
        isActive: true,
      };

      if (msg.conversationId === selectedConversation?.id) {
        setLocalMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Refresh conversations list to update last message/counts 
      // when someone ELSE sends a message. 
      // If WE are the sender, the mutation tags will handle the refresh.
      if (msg.senderId !== userId) {
        refetchConversations();

        const isCurrentActive = msg.conversationId === selectedConversation?.id;
        const isFocused = document.hasFocus();

        // Add to unread set if we are not actively viewing it
        if (!isCurrentActive || !isFocused) {
          setHasNewMessages((prev) => {
            const next = new Set(prev);
            next.add(msg.conversationId);
            return next;
          });
        }
      }
    },
    [selectedConversation?.id, refetchConversations, userId]
  );

  const handleNewConversation = useCallback(
    (_conv: SignalRConversationDto) => {
      refetchConversations();
    },
    [refetchConversations]
  );

  const handleAddedToConversation = useCallback(
    (_conv: SignalRConversationDto) => {
      refetchConversations();
    },
    [refetchConversations]
  );

  const handleRemovedFromConversation = useCallback(
    (evt: { conversationId: string }) => {
      if (evt.conversationId === selectedConversation?.id) {
        setSelectedConversation(null);
        setLocalMessages([]);
      }
      refetchConversations();
    },
    [selectedConversation?.id, refetchConversations]
  );

  const handleMemberRemoved = useCallback(
    (evt: { conversationId: string; userId: string }) => {
      if (evt.conversationId === selectedConversation?.id) {
        refetchConversations();
      }
    },
    [selectedConversation?.id, refetchConversations]
  );

  const handleMemberAdded = useCallback(
    (evt: MemberAddedEvent) => {
      if (evt.conversationId === selectedConversation?.id) {
        refetchConversations();
      }
    },
    [selectedConversation?.id, refetchConversations]
  );

  const handleUserTyping = useCallback(
    (evt: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (evt.conversationId === selectedConversation?.id && evt.userId !== userId) {
        setTypingUsers((prev) => ({ ...prev, [evt.userId]: evt.isTyping }));
      }
    },
    [selectedConversation?.id, userId]
  );

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  } = useChatHub({
    onReceiveMessage: handleReceiveMessage,
    onMessageUpdated: handleReceiveMessage,
    onReceiveDirectMessage: handleReceiveMessage,
    onNewConversation: handleNewConversation,
    onAddedToConversation: handleAddedToConversation,
    onRemovedFromConversation: handleRemovedFromConversation,
    onMemberRemoved: handleMemberRemoved,
    onMemberAdded: handleMemberAdded,
    onUserTyping: handleUserTyping,
    onMessageDeleted: (evt) => {
      setLocalMessages((prev) => prev.filter((m) => m.id !== evt.messageId));
    },
  });

  // ── Join/Leave conversation on SignalR ──
  const prevConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const newId = selectedConversation?.id ?? null;
    const oldId = prevConvIdRef.current;

    if (oldId && oldId !== newId) {
      leaveConversation(oldId);
    }
    if (newId && newId !== oldId) {
      joinConversation(newId);
    }
    prevConvIdRef.current = newId;
  }, [selectedConversation?.id, isConnected, joinConversation, leaveConversation]);

  // ── If URL contains conversationId, open that conversation automatically ──
  useEffect(() => {
    if (conversationFromParam && conversationIdFromParams) {
      setSelectedConversation(conversationFromParam);
      setMobileView('chat');
    }
  }, [conversationFromParam, conversationIdFromParams]);

  // ── Typing indicator (debounced) ──
  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);
      if (!selectedConversation?.id) return;

      startTyping(selectedConversation.id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedConversation?.id) stopTyping(selectedConversation.id);
      }, 2000);
    },
    [selectedConversation?.id, startTyping, stopTyping]
  );

  // ── Send message (handles both existing conversation and pending chat) ──
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !pendingAttachment) || !userId) return;

    setIsSending(true);
    const textContent = messageInput.trim();
    const currentAttachment = pendingAttachment;

    setMessageInput('');
    setPendingAttachment(null);

    // Show skeleton placeholder while uploading
    if (currentAttachment) {
      setSendingAttachment({ type: currentAttachment.type, previewUrl: currentAttachment.previewUrl });
    }

    try {
      let activeConvId = selectedConversation?.id;
      // ─── PENDING CHAT: Create conversation first ───
      if (pendingChatUser && !activeConvId) {
        setIsCreatingConversation(true);
        const newConversation = await createConversation({
          dto: {
            conversationName: pendingChatUser.fullName,
            conversationType: ConversationType.Private,
            memberUserIds: [userId, pendingChatUser.id],
          },
          creatorUserId: userId,
        }).unwrap();
        setPendingChatUser(null);
        setSelectedConversation(newConversation);
        activeConvId = newConversation.id;
        setIsCreatingConversation(false);
      }

      if (!activeConvId) return;

      if (activeConvId) stopTyping(activeConvId);

      // Send attachment if exists
      if (currentAttachment) {
        const uploaded = await uploadFile({ file: currentAttachment.file, folder: 'chat-attachments' }).unwrap();
        if (uploaded?.fileUrl) {
          await createMessage({
            conversationId: activeConvId,
            senderId: userId,
            messageContent: uploaded.fileUrl,
            messageType: currentAttachment.type,
          }).unwrap();
        }
      }

      // Send text message if exists
      if (textContent) {
        await createMessage({
          conversationId: activeConvId,
          senderId: userId,
          messageContent: textContent,
          messageType: MessageType.Text,
        }).unwrap();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      if (currentAttachment) {
        URL.revokeObjectURL(currentAttachment.previewUrl);
      }
      setSendingAttachment(null);
      setIsSending(false);
      setIsCreatingConversation(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Select conversation ──
  const handleSelectConversation = (conv: ConversationDto) => {
    setSelectedConversation(conv);
    setPendingChatUser(null); // Clear pending chat when selecting an existing conversation
    setShowInfoPanel(false);
    setMobileView('chat');
    setTypingUsers({});

    // Clear unread dot on FE
    setHasNewMessages((prev) => {
      const next = new Set(prev);
      next.delete(conv.id);
      return next;
    });
  };

  // ── Select user from search results (Teams-like pending chat) ──
  const handleSelectSearchUser = (account: Account) => {
    // Check if a Private conversation already exists with this user
    const existingConversation = conversations.find(
      (conv) =>
        conv.conversationType === ConversationType.Private &&
        conv.members?.some((m) => m.userId === account.id)
    );

    if (existingConversation) {
      // Open the existing conversation
      handleSelectConversation(existingConversation);
    } else {
      // Open a pending chat (no conversation created yet)
      setPendingChatUser(account);
      setSelectedConversation(null);
      setLocalMessages([]);
      setMobileView('chat');
    }

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // ── Create group conversation ──
  const handleCreateGroup = async () => {
    if (!groupName.trim() || !userId) return;
    try {
      const result = await createConversation({
        dto: {
          conversationName: groupName.trim(),
          conversationType: ConversationType.Group,
          memberUserIds: [userId],
        },
        creatorUserId: userId,
      }).unwrap();

      setShowCreateGroup(false);
      setGroupName('');
      setSelectedConversation(result);
      refetchConversations();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  // ── Get display name for conversation ──
  const getConversationDisplayName = (conv: ConversationDto) => {
    if (conv.conversationType === ConversationType.Private && conv.members?.length >= 2) {
      const otherMember = conv.members.find((m) => m.userId !== userId);
      return otherMember?.userFullName || conv.conversationName || 'Private Chat';
    }
    return conv.conversationName || 'Unnamed Conversation';
  };

  // ── Filter conversations ──
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const name = getConversationDisplayName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // ── Typing indicator text ──
  const typingText = Object.entries(typingUsers)
    .filter(([, isTyping]) => isTyping)
    .map(([uid]) => {
      const member = selectedConversation?.members?.find((m) => m.userId === uid);
      return member?.userFullName?.split(' ')[0] || 'Someone';
    });

  // ── Message status icon ──
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Read:
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case MessageStatus.Delivered:
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case MessageStatus.Sent:
        return <Check className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <div className="h-screen bg-slate-50/50 relative overflow-hidden">
      {/* Glassmorphism Background Blobs - matching other layouts */}
      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F37022]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#0A1B3C]/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none z-0"></div>

      {/* Admin sidebar */}
      {isAdmin && <AdminSidebar isOpen={adminSidebarOpen} toggleSidebar={() => setAdminSidebarOpen(!adminSidebarOpen)} isMobile={isMobileDevice} />}

      <div className={`relative z-10 flex flex-col h-screen transition-all duration-200 ${isAdmin && !isMobileDevice ? (adminSidebarOpen ? 'ml-64' : 'ml-20') : ''
        }`}>
        {/* Top Header - Synced with Layouts */}
        {currentUser?.role === 'Student' && <StudentHeader />}
        {currentUser?.role === 'Teacher' && <TeacherHeader />}
        {isAdmin && <AdminHeader />}

        <div className="flex flex-col flex-1 min-h-0 pt-4 px-4 pb-4 overflow-hidden">
          {/* Page Title - matching other pages */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {mobileView === 'chat' && (
                <button
                  onClick={() => { setMobileView('list'); setSelectedConversation(null); }}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-[#0A1B3C]">Messages</h1>
            </div>
          </div>

          {/* Messenger Card - glass style matching other pages */}
          <div className="flex flex-1 min-h-0 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
            {/* ─────────────── LEFT SIDEBAR ─────────────── */}
            <div
              className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'
                } w-full md:w-80 lg:w-96 flex-col border-r border-gray-200/40`}
            >
              {/* Search & Actions */}
              <div className="p-4 space-y-3">
                <div className="relative" ref={searchDropdownRef}>
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search people or conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#F37022]/40 focus:border-[#F37022]
                           transition-all duration-200 placeholder-gray-400"
                  />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* ── Search Results Dropdown ── */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">People</span>
                      </div>
                      {searchResults.map((account) => (
                        <button
                          key={account.id}
                          onClick={() => handleSelectSearchUser(account)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50/60 transition-all duration-150 text-left group"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F37022] to-[#ff8c42] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                            {account.fullName?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#F37022] transition-colors">
                              {account.fullName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{account.email}</p>
                          </div>
                          <MessageSquare className="w-4 h-4 text-gray-300 group-hover:text-[#F37022] transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F37022] to-[#ff8c42]
                         text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-200
                         transition-all duration-200 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  New Group
                </button>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto px-2 pb-20 sm:pb-2">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No conversations yet</p>
                    <p className="text-xs mt-1">Start a group to begin chatting</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    const displayName = getConversationDisplayName(conv);
                    const isGroup = conv.conversationType === ConversationType.Group;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full flex items-center gap-3 p-3 mb-1 rounded-xl text-left transition-all duration-200
                      ${isSelected
                            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-[#F37022]/20 shadow-sm'
                            : 'hover:bg-gray-50/80'
                          }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm
                          ${isGroup
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                : 'bg-gradient-to-br from-[#F37022] to-[#ff8c42]'
                              }`}
                          >
                            {isGroup ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              displayName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          {/* Online indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`font-semibold text-sm truncate ${isSelected ? 'text-[#F37022]' : 'text-gray-900'}`}>
                              {displayName}
                            </span>
                            {/* Real-time unread dot handled locally on FE */}
                            {!isSelected && hasNewMessages.has(conv.id) && (
                              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 ml-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.memberCount || 0} members
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─────────────── MAIN CHAT AREA ─────────────── */}
            <div
              className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'
                } flex-1 flex-col ${showInfoPanel ? 'md:mr-0' : ''}`}
            >
              {selectedConversation || pendingChatUser ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200/40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setMobileView('list'); setSelectedConversation(null); setPendingChatUser(null); }}
                        className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        {/* Avatar for pending chat user or existing conversation */}
                        {pendingChatUser && !selectedConversation ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F37022] to-[#ff8c42] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {pendingChatUser.fullName?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${selectedConversation?.conversationType === ConversationType.Group
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                            : 'bg-gradient-to-br from-[#F37022] to-[#ff8c42]'
                            }`}>
                            {selectedConversation?.conversationType === ConversationType.Group ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              getConversationDisplayName(selectedConversation!).substring(0, 2).toUpperCase()
                            )}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 text-sm leading-tight">
                          {pendingChatUser && !selectedConversation
                            ? pendingChatUser.fullName
                            : getConversationDisplayName(selectedConversation!)}
                        </h2>
                        <p className="text-xs text-emerald-500 font-medium">
                          {pendingChatUser && !selectedConversation
                            ? 'New conversation'
                            : typingText.length > 0
                              ? `${typingText.join(', ')} typing...`
                              : `${selectedConversation!.memberCount} members`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {pendingChatUser && !selectedConversation ? (
                        <button
                          onClick={() => { setPendingChatUser(null); setMobileView('list'); }}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowInfoPanel(!showInfoPanel)}
                          className={`p-2 rounded-lg transition-colors ${showInfoPanel
                            ? 'text-[#F37022] bg-orange-50'
                            : 'text-gray-500 hover:text-[#F37022] hover:bg-orange-50'
                            }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                  >
                    {isFetchingMessages && messagePage > 1 && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="w-5 h-5 text-[#F37022] animate-spin" />
                      </div>
                    )}
                    {pendingChatUser && !selectedConversation ? (
                      /* ── Pending chat empty state ── */
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F37022] to-[#ff8c42] flex items-center justify-center text-white text-lg font-bold">
                            {pendingChatUser.fullName?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                        </div>
                        <p className="text-base font-semibold text-gray-700">{pendingChatUser.fullName}</p>
                        <p className="text-xs text-gray-400 mt-1">{pendingChatUser.email}</p>
                        <p className="text-sm text-gray-500 mt-4 max-w-xs text-center leading-relaxed">
                          This is the beginning of your conversation with <span className="font-medium text-[#F37022]">{pendingChatUser.fullName}</span>.
                          Send a message to get started.
                        </p>
                      </div>
                    ) : isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-[#F37022] animate-spin" />
                      </div>
                    ) : localMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-1">Send the first message!</p>
                      </div>
                    ) : (
                      localMessages.map((msg) => {
                        const isMe = msg.senderId === userId;
                        const isImage = msg.messageType === MessageType.Image;
                        const isVideo = msg.messageType === MessageType.Video;
                        const isFile = msg.messageType === MessageType.File;
                        const isSystem = msg.messageType === MessageType.System;

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center">
                              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                                {msg.messageContent}
                              </span>
                            </div>
                          );
                        }

                          return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 min-w-0 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-5">
                                {(msg.senderFullName || msg.senderEmail || '?').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className={`min-w-0 max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                              <span className={`text-[11px] font-medium mb-1 px-1 truncate max-w-full ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                                {isMe ? 'You' : msg.senderFullName || msg.senderEmail || 'Unknown'}
                              </span>
                              <div
                                className={`rounded-2xl shadow-sm min-w-0 ${isImage || isVideo
                                  ? 'overflow-hidden'
                                  : isMe
                                    ? 'bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white px-4 py-2.5'
                                    : 'bg-white border border-gray-100 text-gray-900 px-4 py-2.5'
                                  }`}
                              >
                                {isImage ? (
                                  <img
                                    src={msg.messageContent || ''}
                                    alt="Shared image"
                                    className="w-full max-w-[240px] rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                                    loading="lazy"
                                    onLoad={() => scrollToBottom(true)}
                                  />
                                ) : isVideo ? (
                                  <video
                                    src={msg.messageContent || ''}
                                    controls
                                    className="w-full max-w-[240px] rounded-2xl"
                                  />
                                ) : isFile ? (
                                  <a
                                    href={msg.messageContent || ''}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 underline"
                                  >
                                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm break-all">Attachment</span>
                                  </a>
                                ) : (
                                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.messageContent}</p>
                                )}
                              </div>
                              <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : ''}`}>
                                <span className="text-[10px] text-gray-400">
                                  {msg.createdAt
                                    ? parseUtcDate(msg.createdAt)?.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                    : ''}
                                </span>
                                {isMe && getStatusIcon(msg.messageStatus)}
                              </div>
                            </div>
                          </div>
                          );
                        })
                    )}
                    {/* Sending attachment skeleton */}
                    {sendingAttachment && (
                      <div className="flex gap-2 justify-end min-w-0">
                        <div className="min-w-0 max-w-[75%] flex flex-col items-end">
                          <span className="text-[11px] font-medium mb-1 px-1 text-gray-400">You</span>
                          <div className="rounded-2xl overflow-hidden shadow-sm">
                            {sendingAttachment.type === MessageType.Image ? (
                              <div className="relative">
                                <img
                                  src={sendingAttachment.previewUrl}
                                  alt="Sending..."
                                  className="w-full max-w-[240px] rounded-2xl opacity-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                              </div>
                            ) : sendingAttachment.type === MessageType.Video ? (
                              <div className="relative w-64 h-36 bg-gray-200 rounded-2xl flex items-center justify-center">
                                <VideoIcon className="w-8 h-8 text-gray-400 absolute" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white rounded-2xl opacity-70">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">Sending file...</span>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 px-1 justify-end">
                            <span className="text-[10px] text-gray-400">Sending...</span>
                            <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-5 py-3 border-t border-gray-200/40 flex flex-col gap-3 pb-20 sm:pb-3">
                    {pendingAttachment && (
                      <div className="relative inline-flex items-center self-start p-2 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(pendingAttachment.previewUrl);
                            setPendingAttachment(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {pendingAttachment.type === MessageType.Image ? (
                          <img src={pendingAttachment.previewUrl} alt="preview" className="h-16 w-auto rounded-lg object-contain bg-black/5" />
                        ) : pendingAttachment.type === MessageType.Video ? (
                          <video src={pendingAttachment.previewUrl} className="h-16 w-auto rounded-lg object-contain bg-black/5" />
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2">
                            <Paperclip className="w-5 h-5 text-[#F37022]" />
                            <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">{pendingAttachment.file.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "*/*"; fileInputRef.current.click(); } }}
                          disabled={isUploadingFile || isSending}
                          className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Attach File"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } }}
                          disabled={isUploadingFile || isSending}
                          className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Attach Image"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); } }}
                          disabled={isUploadingFile || isSending}
                          className="p-2 text-gray-400 hover:text-[#F37022] hover:bg-orange-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Attach Video"
                        >
                          <VideoIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={messageInput}
                          onChange={(e) => pendingChatUser && !selectedConversation
                            ? setMessageInput(e.target.value)
                            : handleInputChange(e.target.value)
                          }
                          onKeyDown={handleKeyPress}
                          placeholder={pendingChatUser && !selectedConversation
                            ? `Message ${pendingChatUser.fullName}...`
                            : 'Type a message...'}
                          rows={1}
                          className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-full text-sm
                                 focus:outline-none focus:ring-2 focus:ring-[#F37022]/40 focus:border-[#F37022]
                                 transition-all duration-200 resize-none placeholder-gray-400 max-h-[44px] overflow-hidden leading-snug flex items-center"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={(!messageInput.trim() && !pendingAttachment) || isCreatingConversation || isUploadingFile || isSending}
                        className="p-2.5 shrink-0 bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white rounded-full
                               hover:shadow-lg hover:shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed
                               disabled:shadow-none transition-all duration-200 active:scale-95 flex items-center justify-center h-[44px] w-[44px]"
                      >
                        {isCreatingConversation || isUploadingFile || isSending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-[#F37022]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Messages</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Select a conversation from the sidebar or search for someone to start chatting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ─────────────── RIGHT INFO PANEL ─────────────── */}
            {showInfoPanel && selectedConversation && (
              <div className="hidden md:flex w-80 flex-col border-l border-gray-200/40">
                {/* Profile Section */}
                <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-gray-100">
                  <div className="relative mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md ${selectedConversation.conversationType === ConversationType.Group
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      : 'bg-gradient-to-br from-[#F37022] to-[#ff8c42]'
                      }`}>
                      {selectedConversation.conversationType === ConversationType.Group ? (
                        <Users className="w-8 h-8" />
                      ) : (
                        getConversationDisplayName(selectedConversation).substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-3 border-white shadow-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">
                    {getConversationDisplayName(selectedConversation)}
                  </h3>
                  <span className="text-xs text-emerald-500 font-medium mt-1">Active now</span>
                </div>

                {/* Members */}
                {selectedConversation.conversationType !== ConversationType.Private && (
                  <div className="p-4 border-b border-gray-100">
                    <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        Members ({selectedConversation.members?.length || 0})
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedConversation.members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-white text-xs font-semibold">
                              {(member.userFullName || member.userEmail || '?').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 leading-tight flex items-center gap-1">
                                {member.userFullName || member.userEmail}
                                {member.userId === userId && (
                                  <span className="text-[10px] text-gray-400 ml-1">(You)</span>
                                )}
                                {member.isAdmin && (
                                  <span className="text-[10px] text-orange-500 ml-1 font-semibold">Admin</span>
                                )}
                              </p>
                            </div>
                          </div>
                          {/* Show kick button only if current user is admin and not kicking self or another admin */}
                          {member.userId !== userId &&
                            selectedConversation.members?.find((m) => m.userId === userId)?.isAdmin &&
                            !member.isAdmin && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Remove ${member.userFullName || 'this member'}?`)) {
                                    try {
                                      await removeMember({
                                        conversationId: selectedConversation.id,
                                        userId: member.userId,
                                      });
                                      refetchConversations();
                                    } catch (err) {
                                      console.error('Failed to remove member:', err);
                                    }
                                  }
                                }}
                                className="hidden group-hover:block p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                    {/* Show add member button only if current user is admin */}
                    {selectedConversation.members?.find((m) => m.userId === userId)?.isAdmin && (
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setShowAddMemberModal(true)}
                      >
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        Add members
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                {selectedConversation.conversationType === ConversationType.Group && (
                  <div className="p-4 space-y-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setShowChangeNameModal(true)}
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                      Change chat name
                    </button>

                    {/* Change Chat Name Modal */}
                    {showChangeNameModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Change Chat Name</h3>
                            <button
                              onClick={() => setShowChangeNameModal(false)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                          <div className="p-6 space-y-4">
                            <input
                              type="text"
                              value={newChatName}
                              onChange={e => setNewChatName(e.target.value)}
                              placeholder="Enter new chat name..."
                              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]/40 focus:border-[#F37022] transition-all duration-200 placeholder-gray-400"
                              autoFocus
                            />
                          </div>
                          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                            <button
                              onClick={() => setShowChangeNameModal(false)}
                              className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (!selectedConversation?.id || !newChatName.trim()) return;
                                setIsUpdating(true);
                                try {
                                  await updateConversation({
                                    id: selectedConversation.id,
                                    dto: { conversationName: newChatName.trim() },
                                  });
                                  setShowChangeNameModal(false);
                                  setNewChatName('');
                                  refetchConversations();
                                } catch (err) {
                                  // handle error
                                } finally {
                                  setIsUpdating(false);
                                }
                              }}
                              disabled={!newChatName.trim() || isUpdating}
                              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white rounded-xl hover:shadow-lg hover:shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add Member Modal */}
                    {showAddMemberModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Add Members</h3>
                            <button
                              onClick={() => setShowAddMemberModal(false)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                          <div className="p-6 space-y-4">
                            <input
                              type="text"
                              value={addMemberSearch}
                              onChange={async e => {
                                setAddMemberSearch(e.target.value);
                                if (e.target.value.trim()) {
                                  try {
                                    const result = await triggerSearchAccounts({ page: 0, pageSize: 10, searchTerm: e.target.value.trim() }).unwrap();
                                    setAddMemberResults(result.items || []);
                                  } catch {
                                    setAddMemberResults([]);
                                  }
                                } else {
                                  setAddMemberResults([]);
                                }
                              }}
                              placeholder="Search by name or email..."
                              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]/40 focus:border-[#F37022] transition-all duration-200 placeholder-gray-400"
                              autoFocus
                            />
                            <div className="max-h-40 overflow-y-auto">
                              {addMemberResults.map(acc => (
                                <button
                                  key={acc.id}
                                  onClick={() => {
                                    if (!addMemberSelected.some(sel => sel.id === acc.id)) {
                                      setAddMemberSelected([...addMemberSelected, acc]);
                                    }
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50/60 transition-all duration-150 text-left group"
                                >
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F37022] to-[#ff8c42] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                                    {acc.fullName?.substring(0, 2).toUpperCase() || '??'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#F37022] transition-colors">
                                      {acc.fullName}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {addMemberSelected.map(acc => (
                                <span key={acc.id} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-2">
                                  {acc.fullName}
                                  <button onClick={() => setAddMemberSelected(addMemberSelected.filter(sel => sel.id !== acc.id))} className="text-orange-700 hover:text-red-500 ml-2">
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                            <button
                              onClick={() => { setShowAddMemberModal(false); setAddMemberSelected([]); setAddMemberSearch(''); setAddMemberResults([]); }}
                              className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (!selectedConversation?.id || addMemberSelected.length === 0) return;
                                setIsUpdating(true);
                                try {
                                  for (const acc of addMemberSelected) {
                                    await addMember({ conversationId: selectedConversation.id, dto: { userId: acc.id } });
                                  }
                                  setShowAddMemberModal(false);
                                  setAddMemberSelected([]);
                                  setAddMemberSearch('');
                                  setAddMemberResults([]);
                                  refetchConversations();
                                } catch (err) {
                                  // handle error
                                } finally {
                                  setIsUpdating(false);
                                }
                              }}
                              disabled={addMemberSelected.length === 0 || isUpdating}
                              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white rounded-xl hover:shadow-lg hover:shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to leave this group?')) {
                          try {
                            await removeMember({
                              conversationId: selectedConversation.id,
                              userId,
                            });
                            setSelectedConversation(null);
                            setShowInfoPanel(false);
                            refetchConversations();
                          } catch (err) {
                            console.error('Failed to leave group:', err);
                          }
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave group
                    </button>
                    {/* Media/files section placeholder */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Media & Files</h4>
                      <div className="space-y-2">
                        {/* TODO: Render media/files sent in group chat here */}
                        <span className="text-xs text-gray-500">No media/files yet</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─────────────── CREATE GROUP MODAL ─────────────── */}
          {showCreateGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Create New Group</h3>
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateGroup();
                        }
                      }}
                      placeholder="Enter group name..."
                      className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#F37022]/40 focus:border-[#F37022]
                             transition-all duration-200 placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <button
                    onClick={() => { setShowCreateGroup(false); setGroupName(''); }}
                    className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-[#F37022] to-[#ff8c42] text-white rounded-xl
                           hover:shadow-lg hover:shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Conditionally render the dock for mobile/desktop navigation based on role */}
      {currentUser?.role === 'Student' && <StudentSidebar />}
      {currentUser?.role === 'Teacher' && <TeacherSidebar />}
    </div>
  );
}

export default Messenger;
