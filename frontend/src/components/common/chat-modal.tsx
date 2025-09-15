import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, X, GripVertical, User, MessageCircle, Loader2 } from 'lucide-react';
import type { IChatModal, IChatMessage } from '../../interfaces/IChatModal';
import { messageService } from '../../services/message-service';
import { useToast } from './toast';

export default function ChatModal({
  isOpen,
  onClose,
  currentUser,
  chatUser,
  onSendMessage
}: IChatModal) {
  const constraintsRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const { showError, showSuccess } = useToast();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadConversation = useCallback(async () => {
    if (!currentUser || !chatUser || !isOpen) return;
    
    setLoading(true);
    try {
      const conversationMessages = await messageService.getConversation(currentUser.id, chatUser.id);
      
      const enhancedMessages: IChatMessage[] = conversationMessages.map((msg: any) => ({
        ...msg,
        isOwn: msg.from_user_id === currentUser.id,
        fromUser: msg.from_user_id === currentUser.id ? currentUser : chatUser,
        toUser: msg.to_user_id === currentUser.id ? currentUser : chatUser
      }));
      
      setMessages(enhancedMessages);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showError('Failed to load messages', 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [currentUser, chatUser, isOpen, showError, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !chatUser || sending) return;
    
    setSending(true);
    try {
      const messageData = {
        from_user_id: currentUser.id,
        to_user_id: chatUser.id,
        message: newMessage.trim()
      };
      
      const tempMessage = await messageService.sendMessage(messageData);
      
      const enhancedMessage: IChatMessage = {
        ...tempMessage,
        isOwn: true,
        fromUser: currentUser,
        toUser: chatUser
      };
      
      setMessages(prev => [...prev, enhancedMessage]);
      setNewMessage('');
      
      showSuccess('Message sent', 'Your message was sent successfully');
      
      if (onSendMessage) {
        onSendMessage(messageData.message);
      }
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      showError('Failed to send message', 'Please try again');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (isOpen && currentUser && chatUser) {
      messageService.setChatOpen(chatUser.id);
      loadConversation();
      
      const handleNewMessage = (notification: any) => {
        if (notification.type === 'message_received' && notification.message) {
          const msg = notification.message;
          if (msg.from_user_id === chatUser.id && msg.to_user_id === currentUser.id) {
            const enhancedMessage: IChatMessage = {
              ...msg,
              isOwn: false,
              fromUser: chatUser,
              toUser: currentUser
            };
            setMessages(prev => {
              const exists = prev.some(existingMsg => existingMsg.id === msg.id);
              if (!exists) {
                return [...prev, enhancedMessage];
              }
              return prev;
            });
            setTimeout(scrollToBottom, 100);
          }
        } else if (notification.type === 'message_updated' && notification.message) {
          const msg = notification.message;
          setMessages(prev => prev.map(existingMsg => {
            if (existingMsg.id === msg.tempId) {
              return {
                ...existingMsg,
                id: msg.id,
                created_at: msg.created_at,
                updated_at: msg.updated_at,
                isTemporary: false
              };
            }
            return existingMsg;
          }));
        } else if (notification.type === 'message_failed' && notification.message) {
          const tempId = notification.message.id;
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
          showError('Message failed to send', 'Please try again');
        }
      };
      
      const unsubscribe = messageService.subscribeToUserMessages(currentUser.id, handleNewMessage);
      
      return () => {
        messageService.setChatClosed(chatUser.id);
        unsubscribe();
      };
    } else if (!isOpen && chatUser) {
      messageService.setChatClosed(chatUser.id);
    }
  }, [isOpen, currentUser, chatUser, loadConversation, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser || !chatUser) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        className="absolute top-20 right-80 w-80 h-96 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative h-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-white/40 cursor-move" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                  {chatUser.avatar ? (
                    <img
                      src={chatUser.avatar}
                      alt={chatUser.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white/70" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{chatUser.username}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/60 text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white/60 group-hover:text-white" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading messages...</span>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/60 text-center">
                    <MessageCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs">Start a conversation with {chatUser.username}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 relative ${
                          message.isOwn
                            ? `${message.isTemporary ? 'bg-blue-500/50' : 'bg-blue-500/80'} text-white`
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <p className="text-sm break-words">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.isOwn ? 'text-blue-100' : 'text-white/60'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                          {message.isTemporary && (
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse ml-2" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="relative p-4 border-t border-white/10">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  disabled={sending}
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
                whileHover={{ scale: sending ? 1 : 1.05 }}
                whileTap={{ scale: sending ? 1 : 0.95 }}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}