import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, IconButton, CircularProgress,
  Paper, Chip, Divider
} from '@mui/material';
import { Send as SendIcon, Lock as LockIcon } from '@mui/icons-material';
import { getMessages, sendMessage } from '../../api/messages';
import { useAuth } from '../../context/AuthContext';

const RouteChat = ({ routeId, routeStatus, readOnly = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);
  const { currentUser } = useAuth();

  const isClosed = routeStatus === 'COMPLETED' || routeStatus === 'CANCELLED';
  const canWrite = !readOnly && !isClosed;

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMessages(routeId);
      setMessages(res.data);
    } catch {
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(() => fetchMessages(true), 15000);
    return () => clearInterval(intervalRef.current);
  }, [routeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(routeId, input.trim());
      setInput('');
      await fetchMessages(true);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roleLabel = (role) => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'DISPATCHER') return 'Répartiteur';
    return 'Chauffeur';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Aucun message pour cette tournée
          </Typography>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderUsername === currentUser?.username;
            return (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ maxWidth: '75%' }}>
                  {!isMe && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {msg.senderUsername} · {roleLabel(msg.senderRole)}
                    </Typography>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.5, py: 1,
                      bgcolor: isMe ? 'primary.main' : 'grey.100',
                      color: isMe ? 'white' : 'text.primary',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mx: 1, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                    {new Date(msg.sentAt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </Box>

      <Divider />

      {isClosed ? (
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.50' }}>
          <LockIcon fontSize="small" color="disabled" />
          <Typography variant="caption" color="text.secondary">
            Messagerie fermée — tournée terminée
          </Typography>
        </Box>
      ) : readOnly ? (
        <Box sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary">Lecture seule</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder="Écrire un message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={sending}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default RouteChat;
