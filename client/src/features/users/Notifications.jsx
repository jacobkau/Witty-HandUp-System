import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Chip } from '@mui/material';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data);
        await api.put('/notifications/read');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6, mb: 6, px: 2 }}>
      
      {/* Professional Header */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stay updated with your latest bids, payments, and task activity.
        </Typography>
      </Box>

      {/* List Container */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              You have no new notifications.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <Box key={notif._id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    py: 2, 
                    px: 3,
                    bgcolor: notif.isRead ? 'transparent' : '#f8fafc', 
                    cursor: 'pointer', 
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'grey.50' } 
                  }}
                  onClick={() => navigate('/tasks')}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={notif.isRead ? 500 : 700}
                        color={notif.isRead ? 'text.primary' : 'primary.main'}
                      >
                        {notif.type.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    
                    <ListItemText
                      primary={notif.message}
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        color: notif.isRead ? 'text.secondary' : 'text.primary',
                        fontWeight: notif.isRead ? 400 : 500
                      }}
                      secondary={`From: ${notif.sender?.name || 'Witty HandUp System'}`}
                      secondaryTypographyProps={{ variant: 'caption', mt: 1, display: 'block' }}
                    />
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
