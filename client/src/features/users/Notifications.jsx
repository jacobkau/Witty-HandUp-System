import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { Notifications as BellIcon } from '@mui/icons-material';

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

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
        <BellIcon color="primary" fontSize="large" /> Notifications
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        {notifications.length === 0 ? (
          <Typography p={4} textAlign="center" color="text.secondary">No notifications yet.</Typography>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <Box key={notif._id}>
                <ListItem 
                  sx={{ bgcolor: notif.isRead ? 'white' : '#f0f9ff', cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                  onClick={() => navigate('/tasks')}
                >
                  <ListItemText
                    primary={notif.message}
                    secondary={`From ${notif.sender?.name || 'System'} • ${new Date(notif.createdAt).toLocaleString()}`}
                    primaryTypographyProps={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}
                  />
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
