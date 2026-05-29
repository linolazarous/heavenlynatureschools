// frontend/src/components/live/LiveChatPanel.js
import React from 'react';
import { Send, Users as UsersIcon, Circle, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const LiveChatPanel = ({ 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  onDeleteMessage, 
  onlineCount, 
  user, 
  messagesEndRef 
}) => (
  <div className="lg:col-span-1">
    <Card className="bg-white border-primary/10 h-full flex flex-col shadow-lg">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-primary flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-secondary" />
            School Chat
          </span>
          <div className="flex items-center gap-2 text-sm font-normal" aria-live="polite" aria-atomic="true">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" aria-hidden="true" />
            <span className="text-muted-foreground">{onlineCount || 0} online</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50"
          style={{ maxHeight: '500px' }}
          role="log"
          aria-labelledby="school-chat-heading"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-secondary/40" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Be the first to welcome our students! 👋</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-start gap-2">
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.is_admin ? 'bg-secondary' : 
                      msg.source === 'facebook' ? 'bg-blue-500' : 
                      'bg-primary/20'
                    }`}
                    aria-hidden="true"
                  >
                    <span className="text-sm font-bold text-white">
                      {msg.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${
                        msg.is_admin ? 'text-secondary' : 'text-primary'
                      }`}>
                        {msg.username || 'Anonymous'}
                      </span>
                      
                      {msg.is_admin && (
                        <span className="bg-secondary text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                          STAFF
                        </span>
                      )}
                      {msg.source === 'facebook' && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          FB
                        </span>
                      )}
                      
                      <time className="text-xs text-muted-foreground/60" dateTime={msg.timestamp}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </time>
                    </div>
                    <p className="text-sm text-foreground mt-1 break-words">
                      {msg.message}
                    </p>
                  </div>
                  
                  {/* Delete Button (Admin only) */}
                  {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'moderator') && (
                    <button
                      onClick={() => onDeleteMessage?.(msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 text-xs transition-opacity"
                      aria-label={`Delete message from ${msg.username}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-primary/10 bg-white">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newMessage?.trim()) onSendMessage(e);
          }} className="flex gap-2">
            <Input
              value={newMessage || ''}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-secondary"
              maxLength={500}
              aria-label="Message text"
            />
            <Button 
              type="submit" 
              disabled={!newMessage?.trim()}
              className="bg-secondary hover:bg-secondary/90 text-primary disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {user ? `Chatting as ${user.full_name || user.name || 'User'}` : 'Chatting as Guest'}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default LiveChatPanel;
