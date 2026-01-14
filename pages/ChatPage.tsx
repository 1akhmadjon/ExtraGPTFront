import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Conversation, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Search, Instagram, MessageCircle, MoreVertical } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Poll conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.business_id) return;
      try {
        const { data } = await apiClient.get<Conversation[]>(`/chat/conversations`, {
          params: { business_id: user.business_id }
        });
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations", error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Poll messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchHistory = async () => {
      try {
        const { data } = await apiClient.get<Message[]>(`/chat/history/${selectedConversation.id}`);
        // Only update if length changed to avoid jitter, or improve diffing logic
        setMessages(data);
        if (loadingMessages) setLoadingMessages(false);
      } catch (error) {
        console.error("Error fetching history", error);
      }
    };

    setLoadingMessages(true);
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await apiClient.post('/chat/send-message', {
        conversation_id: selectedConversation.id,
        content: newMessage,
      });
      setNewMessage('');
      // Optimistic update could happen here
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const toggleAI = async () => {
    if (!selectedConversation) return;
    try {
      const { data } = await apiClient.patch(`/chat/toggle-ai`, {
        conversation_id: selectedConversation.id,
        active: !selectedConversation.is_ai_active
      });
      // Update local state
      setSelectedConversation({ ...selectedConversation, is_ai_active: data.is_ai_active });
      setConversations(conversations.map(c => 
        c.id === selectedConversation.id ? { ...c, is_ai_active: data.is_ai_active } : c
      ));
    } catch (error) {
      console.error("Failed to toggle AI", error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar: Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                    {conv.customer_name}
                  </span>
                  {conv.platform === 'telegram' ? (
                    <MessageCircle size={14} className="text-blue-500" />
                  ) : (
                    <Instagram size={14} className="text-pink-600" />
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
              <div className="mt-2 flex items-center space-x-2">
                 {conv.is_ai_active && (
                   <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">AI Active</span>
                 )}
                 {conv.unread_count > 0 && (
                   <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold ml-auto">
                     {conv.unread_count}
                   </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Messages */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
            <div>
              <h2 className="font-bold text-gray-900">{selectedConversation.customer_name}</h2>
              <span className="text-xs text-gray-500 capitalize">{selectedConversation.platform}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleAI}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedConversation.is_ai_active 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {selectedConversation.is_ai_active ? 'AI Enabled' : 'AI Paused'}
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender_type === 'client' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                    msg.sender_type === 'client' 
                      ? 'bg-white text-gray-900 rounded-tl-none' 
                      : msg.sender_type === 'ai'
                        ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-none'
                        : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`mt-1 text-xs flex items-center ${
                    msg.sender_type === 'operator' ? 'text-indigo-200' : 'text-gray-400'
                  }`}>
                    {msg.sender_type === 'ai' && <Bot size={12} className="mr-1" />}
                    {msg.sender_type === 'operator' && <User size={12} className="mr-1" />}
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent focus:bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-3 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <MessageCircle size={48} className="mb-4 text-gray-300" />
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
