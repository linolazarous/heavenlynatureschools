// frontend/src/pages/SchoolLive.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Facebook, ExternalLink, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import LiveChatPanel from '../components/live/LiveChatPanel';

const FACEBOOK_PAGE = 'https://www.facebook.com/heavenlynatureministryss';
const SCHOOL_NAME = 'Heavenly Nature Nursery & Primary School';
const SCHOOL_MISSION = 'Nurturing Right Leaders — Juba City, South Sudan';

const SchoolLive = () => {
  const [websiteMessages, setWebsiteMessages] = useState([]);
  const [facebookMessages, setFacebookMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [chatConnected, setChatConnected] = useState(false);
  const [facebookPostId, setFacebookPostId] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // ✅ Safe user loading - works without AuthContext
  useEffect(() => {
    try {
      // Try multiple sources for user info
      const adminInfo = localStorage.getItem('admin_info');
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (adminInfo) {
        setUser(JSON.parse(adminInfo));
      } else if (userStr) {
        setUser(JSON.parse(userStr));
      } else if (token) {
        // Decode JWT for user info
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [websiteMessages, facebookMessages]);

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

  // ✅ Safe socket connection with dynamic import
  useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.heavenlynatureschools.com';
        const socket = io(API_URL, { 
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 10000,
        });

        socket.on('connect', () => {
          if (!mounted) return;
          setChatConnected(true);
          socket.emit('join_chat', { 
            username: user?.full_name || 'Guest', 
            user_id: user?.id || 'guest_' + Date.now(), 
            is_admin: isUserAdmin 
          });
        });

        socket.on('chat_history', (data) => { 
          if (mounted) setWebsiteMessages(data.messages || []); 
        });
        
        socket.on('new_message', (message) => { 
          if (mounted) setWebsiteMessages(prev => [...prev, message]); 
        });
        
        socket.on('online_count', (data) => { 
          if (mounted && data.count !== undefined) setOnlineCount(data.count); 
        });
        
        socket.on('message_deleted', (data) => { 
          if (mounted) setWebsiteMessages(prev => prev.filter(m => m.id !== data.message_id)); 
        });
        
        socket.on('disconnect', () => { 
          if (mounted) setChatConnected(false); 
        });

        socket.on('connect_error', (err) => {
          console.warn('Socket connection failed:', err.message);
          if (mounted) setChatConnected(false);
        });

        if (mounted) socketRef.current = socket;
      } catch (err) {
        console.warn('Socket.io not available - chat will work in offline mode');
        if (mounted) setChatConnected(false);
      }
    };

    // Delay connection until user is loaded
    const timeout = setTimeout(connectSocket, 500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.close();
      }
    };
  }, [user?.full_name, isUserAdmin]);

  const allMessages = [...websiteMessages, ...facebookMessages]
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { message: newMessage.trim() });
      setNewMessage('');
    } else {
      // Offline mode
      const localMsg = {
        id: 'local_' + Date.now(),
        username: user?.full_name || 'Guest',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        is_admin: isUserAdmin,
      };
      setWebsiteMessages(prev => [...prev, localMsg]);
      setNewMessage('');
      toast.info('Message sent (offline mode)');
    }
  }, [newMessage, user, isUserAdmin]);

  const handleDeleteMessage = useCallback((messageId) => {
    if (!isUserAdmin) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit('delete_message', { message_id: messageId });
      toast.success('Message deleted');
    } else {
      setWebsiteMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message removed');
    }
  }, [isUserAdmin]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative bg-primary text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-6">
            <GraduationCap className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
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
              {chatConnected ? 'Live Chat Active' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Facebook */}
          <div className="lg:col-span-2">
            {/* Live Video */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 mb-8">
              <div className="aspect-video bg-black relative">
                <div 
                  className="fb-video absolute inset-0"
                  data-href={`${FACEBOOK_PAGE}/live`}
                  data-width="100%"
                  data-allowfullscreen="true"
                  data-autoplay="true"
                  data-show-text="false"
                  data-show-captions="false"
                />
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8 -z-10">
                  <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                    <GraduationCap className="h-12 w-12 text-secondary" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-primary mb-2">Live Stream</h2>
                  <p className="text-muted-foreground mb-4 text-center">Live videos appear here during school events</p>
                  <a 
                    href={FACEBOOK_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                    Watch on Facebook
                  </a>
                </div>
              </div>
              <div className="p-4 bg-primary/5 flex justify-center border-t border-primary/5">
                <a 
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  Visit Our Facebook Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Facebook Page Plugin */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 p-4 mb-8">
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
                abandoned children, and orphans in Juba City, South Sudan.
              </p>
              <div className="flex flex-wrap gap-3">
                {['📚 Quality Education', '🙏 Christian Values', '💙 Free Tuition', '🌟 Leadership'].map(tag => (
                  <span key={tag} className="bg-secondary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <LiveChatPanel 
            messages={allMessages} 
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
  );
};

export default SchoolLive;
