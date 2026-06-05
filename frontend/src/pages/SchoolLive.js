// frontend/src/pages/SchoolLive.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Facebook, ExternalLink, GraduationCap, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const FACEBOOK_PAGE = 'https://www.facebook.com/heavenlynatureministryss';
const SCHOOL_NAME = 'Heavenly Nature Nursery & Primary School';
const SCHOOL_MISSION = 'Nurturing Right Leaders — Juba City, South Sudan';

// ─── Inline Chat Panel (replaces LiveChatPanel import) ─────
const ChatPanel = ({ messages, newMessage, onMessageChange, onSendMessage, onDeleteMessage, onlineCount, user, messagesEndRef }) => {
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'moderator';
  const userName = user?.full_name || user?.name || 'Guest';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 h-full flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">💬 School Chat</h3>
          <span className="flex items-center gap-1 text-secondary text-xs">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {onlineCount || 0} online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50" style={{ maxHeight: '400px', minHeight: '250px' }}>
        {(!messages || messages.length === 0) ? (
          <div className="text-center py-8 text-gray-400">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.isCurrentUser || msg.username === userName ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                (msg.isCurrentUser || msg.username === userName)
                  ? 'bg-primary text-white rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
              }`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold opacity-75">{msg.username || 'User'}</p>
                  {msg.is_admin && <span className="text-[10px] bg-secondary text-primary px-1.5 py-0.5 rounded-full font-bold">STAFF</span>}
                </div>
                <p className="text-sm">{msg.message || msg.text || ''}</p>
                <p className="text-[10px] mt-0.5 opacity-60">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
              {isAdmin && onDeleteMessage && (
                <button 
                  onClick={() => onDeleteMessage(msg.id)} 
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs ml-1 self-start mt-1"
                  title="Delete message"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!newMessage?.trim()}
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Send
        </button>
      </form>

      <div className="px-3 pb-2 text-center">
        <p className="text-[11px] text-gray-400">Chatting as <span className="font-medium text-gray-500">{userName}</span></p>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const SchoolLive = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [chatConnected, setChatConnected] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // ✅ Safe user loading
  useEffect(() => {
    try {
      const adminInfo = localStorage.getItem('admin_info');
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (adminInfo) {
        setUser(JSON.parse(adminInfo));
      } else if (userStr) {
        setUser(JSON.parse(userStr));
      } else if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'user',
            full_name: payload.name || 'User',
            name: payload.name || 'User',
          });
        } catch {
          setUser({ full_name: 'Guest', role: 'user' });
        }
      } else {
        setUser({ full_name: 'Guest', role: 'user' });
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setUser({ full_name: 'Guest', role: 'user' });
    }
  }, []);

  const isUserAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'moderator';

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load Facebook SDK
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return;
    try {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    } catch (err) {
      console.error('Failed to load Facebook SDK:', err);
    }
  }, []);

  // ✅ REST API Chat Polling (NO socket.io dependency)
  useEffect(() => {
    let mounted = true;
    const API_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/live-chat/messages?limit=50`);
        if (res.ok && mounted) {
          const data = await res.json();
          setMessages(data.messages || []);
          setOnlineCount(data.online_count || 0);
          setChatConnected(true);
        }
      } catch (err) {
        if (mounted) {
          setChatConnected(false);
        }
      }
    };

    // Initial fetch
    fetchMessages();
    
    // Poll every 10 seconds
    pollingRef.current = setInterval(fetchMessages, 10000);

    return () => {
      mounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ✅ Send message via REST API
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgText = newMessage.trim();
    const userName = user?.full_name || 'Guest';

    // Add locally for instant feedback
    const localMsg = {
      id: 'local_' + Date.now(),
      username: userName,
      message: msgText,
      timestamp: new Date().toISOString(),
      is_admin: isUserAdmin,
      isCurrentUser: true,
    };
    setMessages(prev => [...prev, localMsg]);
    setNewMessage('');

    // Send to server
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';
      const token = localStorage.getItem('access_token');
      
      await fetch(`${API_URL}/api/live-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: msgText, username: userName }),
      });
    } catch (err) {
      // Message stays locally even if server fails
      console.log('Message saved locally');
    }
  }, [newMessage, user, isUserAdmin]);

  // ✅ Delete message
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!isUserAdmin) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';
      const token = localStorage.getItem('access_token');
      
      const res = await fetch(`${API_URL}/api/live-chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success('Message deleted');
      }
    } catch (err) {
      // Remove locally anyway
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message removed');
    }
  }, [isUserAdmin]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative bg-primary text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            School Live Stream
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-white/90 max-w-3xl mx-auto">
            {SCHOOL_NAME}
          </p>
          <p className="text-lg text-white/70 italic max-w-2xl mx-auto">
            {SCHOOL_MISSION}
          </p>
          <div className="mt-4">
            <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
              chatConnected ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${chatConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
              {chatConnected ? 'Connected' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Facebook */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Video */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5">
              <div className="aspect-video bg-gray-900 relative">
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(FACEBOOK_PAGE)}&show_text=false&width=100%`}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="School Live Stream"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8 -z-10">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-white/80 text-lg">Live videos appear during school events</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 flex justify-center border-t border-primary/5">
                <a 
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors text-sm"
                >
                  <Facebook className="h-5 w-5" />
                  Watch on Facebook
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Facebook Page Plugin */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 p-4">
              <h3 className="font-semibold text-primary mb-3 px-2">📱 Facebook Updates</h3>
              <div 
                className="fb-page"
                data-href={FACEBOOK_PAGE}
                data-tabs="timeline"
                data-width="100%"
                data-height="400"
                data-small-header="true"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="false"
              >
                <blockquote cite={FACEBOOK_PAGE} className="fb-xfbml-parse-ignore">
                  <a href={FACEBOOK_PAGE}>Heavenly Nature Ministry</a>
                </blockquote>
              </div>
            </div>

            {/* School Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-primary/5">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-4">About Our School</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {SCHOOL_NAME} provides free, faith-based education to street children, 
                abandoned children, and orphans in Juba City, South Sudan. We nurture 
                right leaders through quality education rooted in Christian values.
              </p>
              <div className="flex flex-wrap gap-2">
                {['📚 Quality Education', '🙏 Christian Values', '💙 Free Tuition', '🌟 Leadership'].map(tag => (
                  <span key={tag} className="bg-secondary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ChatPanel 
                messages={messages} 
                newMessage={newMessage} 
                onMessageChange={setNewMessage} 
                onSendMessage={handleSendMessage} 
                onDeleteMessage={handleDeleteMessage} 
                onlineCount={onlineCount} 
                user={user}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolLive;
