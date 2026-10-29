import { useState, useEffect, useRef } from 'react';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import socket from '../../lib/socket'; 
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export default function ChatBox({ taskId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Bulletproof ID check
  const currentUserId = user?._id || user?.id;

  // Fetch initial message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${taskId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [taskId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on(`new-message-${taskId}`, handleNewMessage);

    return () => {
      socket.off(`new-message-${taskId}`, handleNewMessage);
    };
  }, [taskId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage(''); 

    try {
      await api.post(`/messages/${taskId}`, { text: messageText });
    } catch (err) {
      console.error('Failed to send message', err);
      setNewMessage(messageText); 
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;

  return (
    <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'grey.50', maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
         
      {/* Message List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, minHeight: '150px' }}>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((msg) => {
            // Check if the message sender ID matches the current user ID
            const senderId = msg.sender?._id || msg.sender;
            const isMe = currentUserId && senderId && currentUserId.toString() === senderId.toString();

            return (
              <Box 
                key={msg._id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: isMe ? 'flex-end' : 'flex-start', 
                  mb: 1.5 
                }}
              >
                <Box sx={{
                  maxWidth: '75%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isMe ? 'primary.main' : 'white',
                  color: isMe ? 'white' : 'text.primary',
                  border: isMe ? 'none' : '1px solid #e0e0e0',
                  borderBottomRightRadius: isMe ? 0 : 2,
                  borderBottomLeftRadius: isMe ? 2 : 0,
                  boxShadow: 1
                }}>
                  {/* Show the sender's name only if it's NOT me */}
                  {!isMe && (
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.5}>
                      {msg.sender?.name || 'User'} {msg.sender?.role === 'admin' && '(Admin)'}
                    </Typography>
                  )}
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ bgcolor: 'white' }}
        />
        <Button type="submit" variant="contained" disabled={!newMessage.trim()} sx={{ minWidth: '50px' }}>
          <SendIcon fontSize="small" />
        </Button>
      </Box>
    </Paper>
  );
}
