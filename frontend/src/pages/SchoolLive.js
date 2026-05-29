// frontend/src/pages/SchoolLive.js
import React, { useState, useEffect } from 'react';
import { Facebook, ExternalLink, GraduationCap, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from '../api/axios';
import { io } from 'socket.io-client';
import LiveChatPanel from '../components/live/LiveChatPanel';

const FACEBOOK_PAGE = 'https://www.facebook.com/heavenlynatureministryss';
const SCHOOL_NAME = 'Heavenly Nature Nursery & Primary School';
const SCHOOL_MISSION = 'Nurturing Right Leaders — Juba City, South Sudan';

const SchoolLive = () => {
  const { user } = useAuth();
  const [websiteMessages, setWebsiteMessages] = useState([]);
  const [facebookMessages, setFacebookMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [chatConnected, setChatConnected] = useState(false);
  const [facebookPostId, setFacebookPostId] = useState(null);

  const userFullName = user?.full_name || 'Guest';
  const userId = user?.id || 'guest_' + Date.now();
  const userRole = user?.role || 'user';
  const isUserAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

  const allMessages = [...websiteMessages, ...facebookMessages]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Load Facebook SDK
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return;
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  }, []);

  // Connect to chat
  useEffect(() => {
    let mounted = true;
    let newSocket = null;

    const getFacebookInfo = async () => {
      try {
        const res = await axios.get('/facebook/comments');
        if (mounted && res.data.post_id) {
          setFacebookPostId(res.data.post_id);
          setFacebookMessages(res.data.comments || []);
        }
      } catch (error) {}
    };
    getFacebookInfo();

    const connectSocket = () => {
      try {
        const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.heavenlynatureministry.com';
        newSocket = io(API_URL, { 
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
          if (!mounted) return;
          setChatConnected(true);
          newSocket.emit('join_chat', { username: userFullName, user_id: userId, is_admin: isUserAdmin });
        });

        newSocket.on('chat_history', (data) => { if (mounted) setWebsiteMessages(data.messages || []); });
        newSocket.on('new_message', (message) => { if (mounted) setWebsiteMessages(prev => [...prev, message]); });
        newSocket.on('user_joined', (data) => { if (mounted && data.count !== undefined) setOnlineCount(data.count); });
        newSocket.on('user_left', (data) => { if (mounted && data.count !== undefined) setOnlineCount(data.count); });
        newSocket.on('online_count', (data) => { if (mounted && data.count !== undefined) setOnlineCount(data.count); });
        newSocket.on('message_deleted', (data) => { if (mounted) setWebsiteMessages(prev => prev.filter(m => m.id !== data.message_id)); });
        newSocket.on('disconnect', () => { if (mounted) setChatConnected(false); });

        if (mounted) setSocket(newSocket);
      } catch (error) {
        console.error('Chat socket initialization failed:', error);
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      if (newSocket) newSocket.close();
    };
  }, [userId, userFullName, isUserAdmin]);

  // Poll Facebook comments
  useEffect(() => {
    if (!facebookPostId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/facebook/comments?post_id=${facebookPostId}`);
        if (res.data.comments?.length) setFacebookMessages(res.data.comments);
      } catch (error) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [facebookPostId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !chatConnected) return;
    socket.emit('send_message', { message: newMessage.trim() });
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId) => {
    if (!socket || !chatConnected || !isUserAdmin) return;
    socket.emit('delete_message', { message_id: messageId });
    toast.success('Message deleted');
  };

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
          <p className="text-white/60 text-sm mt-4">
            Join us for school events, assemblies, and special programs
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Facebook Live + Page */}
          <div className="lg:col-span-2">
            {/* Live Video */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 mb-8">
              <div className="aspect-video bg-black">
                <div 
                  className="fb-video"
                  data-href={`${FACEBOOK_PAGE}/live`}
                  data-width="100%"
                  data-allowfullscreen="true"
                  data-autoplay="true"
                  data-show-text="false"
                  data-show-captions="false"
                />
                
                {/* Offline Fallback */}
                <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 p-8" id="fb-fallback">
                  <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                    <GraduationCap className="h-12 w-12 text-secondary" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-primary mb-2">No Live Stream</h2>
                  <p className="text-muted-foreground mb-4">Check back during school events</p>
                  <a 
                    href={FACEBOOK_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 rounded-full px-6 py-3 font-medium transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                    Visit Our Facebook
                  </a>
                </div>
              </div>

              {/* Watch on Facebook Button */}
              <div className="p-4 bg-primary/5 flex justify-center border-t border-primary/5">
                <a 
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  Watch on Facebook
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Facebook Page Plugin */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/5 p-4">
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

            {/* School Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-primary/5 mt-8">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-4">About Our School</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {SCHOOL_NAME} provides free, faith-based education to street children, 
                abandoned children, and orphans in Juba City, South Sudan. We nurture 
                right leaders through quality education rooted in Christian values.
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
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LiveChatPanel 
                messages={allMessages} 
                newMessage={newMessage} 
                onMessageChange={(val) => setNewMessage(val)} 
                onSendMessage={handleSendMessage} 
                onDeleteMessage={handleDeleteMessage} 
                onlineCount={onlineCount} 
                user={user} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolLive;
