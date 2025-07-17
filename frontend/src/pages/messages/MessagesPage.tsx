import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  UserPlus,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import type { RootState } from "../../store";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useMarkConversationAsReadMutation,
  useDeleteConversationMutation,
  useSearchUsersQuery,
  type Message,
  type User,
} from "../../store/api/apiSlice";

export const MessagesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // API hooks
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useGetConversationsQuery();

  // Debug logging for conversations
  React.useEffect(() => {
    console.log("Conversations updated:", conversations);
    console.log("Conversations loading:", conversationsLoading);
  }, [conversations, conversationsLoading]);
  const { data: messages = [], isLoading: messagesLoading } =
    useGetMessagesQuery(selectedConversation!, { skip: !selectedConversation });
  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchUsersQuery(
      { query: userSearchQuery },
      { skip: !userSearchQuery || userSearchQuery.length < 2 }
    );

  // Debug logging for search results
  React.useEffect(() => {
    if (userSearchQuery.length >= 2) {
      console.log("Search query:", userSearchQuery);
      console.log("Search results:", searchResults);
      console.log("Search loading:", searchLoading);
    }
  }, [userSearchQuery, searchResults, searchLoading]);

  const [sendMessage, { isLoading: sendingMessage }] = useSendMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markConversationAsRead] = useMarkConversationAsReadMutation();
  const [deleteConversation] = useDeleteConversationMutation();

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current conversation data or create a virtual one for new conversations
  const currentConversation =
    conversations.find((conv) => conv.partner.id === selectedConversation) ||
    (selectedUser && selectedConversation === selectedUser.id
      ? {
          partner: {
            id: selectedUser.id,
            name: selectedUser.name,
            profileImage: selectedUser.profileImage,
            role: selectedUser.role,
          },
          lastMessage: null,
          unreadCount: 0,
        }
      : null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (
      selectedConversation &&
      currentConversation &&
      currentConversation.unreadCount > 0
    ) {
      console.log(
        "Marking conversation as read:",
        selectedConversation,
        "unread count:",
        currentConversation.unreadCount
      );
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation, currentConversation, markConversationAsRead]);

  const handleSendMessage = async () => {
    console.log("handleSendMessage called");
    console.log("newMessage:", newMessage);
    console.log("selectedConversation:", selectedConversation);
    console.log("sendingMessage:", sendingMessage);

    if (!newMessage.trim() || !selectedConversation || sendingMessage) {
      console.log(
        "Early return from handleSendMessage - missing required data"
      );
      return;
    }

    try {
      console.log("Attempting to send message to:", selectedConversation);
      const result = await sendMessage({
        receiverId: selectedConversation,
        content: newMessage.trim(),
      }).unwrap();
      console.log("Message sent successfully:", result);
      console.log(
        "This should trigger conversation list refresh via RTK Query cache invalidation"
      );
      setNewMessage("");

      // Force a refetch of conversations to ensure the sidebar updates
      setTimeout(() => {
        refetchConversations();
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      await updateMessage({
        messageId: editingMessageId,
        content: editContent.trim(),
      }).unwrap();
      setEditingMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    try {
      await deleteConversation(selectedConversation).unwrap();
      setSelectedConversation(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleStartNewConversation = (user: User) => {
    console.log("Starting new conversation with user:", user);
    console.log("Setting selectedConversation to:", user.id);
    setSelectedConversation(user.id);
    setSelectedUser(user);
    setShowNewConversationModal(false);
    setUserSearchQuery("");
    console.log("New conversation modal closed, search query cleared");
  };

  const isMessageEditable = (message: Message) => {
    const messageSenderId =
      typeof message.senderId === "object" && message.senderId !== null
        ? (message.senderId as any).id || (message.senderId as any)._id
        : message.senderId;
    if (messageSenderId !== user?.id) return false;
    const messageTime = new Date(message.createdAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return messageTime > fiveMinutesAgo;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "scout":
        return "text-blue-600";
      case "coach":
        return "text-green-600";
      case "player":
        return "text-sport-600";
      case "manager":
        return "text-purple-600";
      case "club":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "scout":
        return "bg-blue-100 text-blue-700";
      case "coach":
        return "bg-green-100 text-green-700";
      case "player":
        return "bg-sport-100 text-sport-700";
      case "manager":
        return "bg-purple-100 text-purple-700";
      case "club":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sport-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.partner.id}
                onClick={() => {
                  setSelectedConversation(conversation.partner.id);
                  setSelectedUser(null); // Clear selected user when selecting existing conversation
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.partner.id
                    ? "bg-sport-50 border-r-2 border-r-sport-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        conversation.partner.profileImage ||
                        `https://ui-avatars.com/api/?name=${conversation.partner.name}&background=0ea5e9&color=fff`
                      }
                      alt={conversation.partner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.partner.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(
                          conversation.partner.role
                        )}`}
                      >
                        {conversation.partner.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-sport-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        currentConversation.partner.profileImage ||
                        `https://ui-avatars.com/api/?name=${currentConversation.partner.name}&background=0ea5e9&color=fff`
                      }
                      alt={currentConversation.partner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {currentConversation.partner.name}
                    </h2>
                    <p
                      className={`text-sm ${getRoleColor(
                        currentConversation.partner.role
                      )}`}
                    >
                      {currentConversation.partner.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video className="w-5 h-5" />
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            handleDeleteConversation();
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete Conversation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                messages.map((message) => {
                  // Handle both string and object senderId formats
                  const messageSenderId =
                    typeof message.senderId === "object" &&
                    message.senderId !== null
                      ? (message.senderId as any).id ||
                        (message.senderId as any)._id
                      : message.senderId;
                  const isMyMessage = messageSenderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-6 ${
                        isMyMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar for received messages */}
                      {!isMyMessage && (
                        <img
                          src={
                            currentConversation?.partner.profileImage ||
                            `https://ui-avatars.com/api/?name=${currentConversation?.partner.name}&background=0ea5e9&color=fff`
                          }
                          alt={currentConversation?.partner.name}
                          className="w-8 h-8 rounded-full object-cover mr-3 mt-auto"
                        />
                      )}

                      <div
                        className={`max-w-xs lg:max-w-md group relative ${
                          isMyMessage ? "text-right" : "text-left"
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          /* Edit Mode */
                          <div className="bg-gray-100 rounded-lg p-3">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-sport-500"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditContent("");
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateMessage}
                                className="px-3 py-1 text-sm bg-sport-600 text-white rounded hover:bg-sport-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <>
                            <div
                              className={`px-4 py-3 rounded-lg shadow-sm ${
                                isMyMessage
                                  ? "bg-sport-600 text-white rounded-br-sm"
                                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
                              }`}
                            >
                              {/* Add sender name for received messages */}
                              {!isMyMessage && (
                                <p className="text-xs font-medium text-sport-600 mb-1">
                                  {typeof message.senderId === "object" &&
                                  message.senderId !== null &&
                                  (message.senderId as any)?.name
                                    ? (message.senderId as any).name
                                    : currentConversation?.partner.name}
                                </p>
                              )}

                              <p className="text-sm">{message.content}</p>
                              {message.edited && (
                                <p className="text-xs opacity-75 mt-1">
                                  (edited)
                                </p>
                              )}
                              <div
                                className={`flex items-center justify-between mt-2 ${
                                  isMyMessage
                                    ? "text-sport-200"
                                    : "text-gray-500"
                                }`}
                              >
                                <span className="text-xs">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                                {isMyMessage && (
                                  <div className="ml-2">
                                    {message.read ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Message Actions */}
                            {isMyMessage && (
                              <div className="flex justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isMessageEditable(message) && (
                                  <button
                                    onClick={() => handleEditMessage(message)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setShowDeleteConfirm(message.id)
                                  }
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sport-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-sport-600 text-white p-2 rounded-lg hover:bg-sport-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Start New Conversation
              </h3>
              <button
                onClick={() => {
                  setShowNewConversationModal(false);
                  setUserSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sport-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Searching...
                </div>
              ) : userSearchQuery.length < 2 ? (
                <div className="text-center py-4 text-gray-500">
                  Type at least 2 characters to search for users
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults
                    .filter((searchUser) => searchUser.id !== user?.id) // Exclude current user
                    .map((searchUser) => (
                      <div
                        key={searchUser.id}
                        onClick={() => handleStartNewConversation(searchUser)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              searchUser.profileImage ||
                              `https://ui-avatars.com/api/?name=${searchUser.name}&background=0ea5e9&color=fff`
                            }
                            alt={searchUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {searchUser.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(
                                  searchUser.role
                                )}`}
                              >
                                {searchUser.role}
                              </span>
                              {searchUser.isVerified && (
                                <span className="text-blue-500 text-xs">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Message
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
