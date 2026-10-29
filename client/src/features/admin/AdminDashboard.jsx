import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Avatar, Stack, Button 
} from '@mui/material';
import { 
  People, Assignment, LocalAtm, PendingActions, 
  AdminPanelSettings, ArrowBack 
} from '@mui/icons-material';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Fetch both stats and users simultaneously
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is an admin
    if (user?.role === 'admin') {
      fetchAdminData();
    } else {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;

  if (error) {
    return (
      <Box textAlign="center" p={6}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>{error}</Alert>
        <Button onClick={() => navigate('/tasks')} startIcon={<ArrowBack />}>Back to Dashboard</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <AdminPanelSettings fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">Admin Control Panel</Typography>
          <Typography variant="body2" color="text.secondary">Manage users and monitor system activity</Typography>
        </Box>
      </Stack>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '5px solid #2196f3' }}>
            <People color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">{stats?.totalUsers || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '5px solid #4caf50' }}>
            <Assignment color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">{stats?.totalTasks || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Total Tasks Posted</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '5px solid #ff9800' }}>
            <PendingActions sx={{ color: '#ff9800', fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">{stats?.activeTasks || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Active Tasks</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderLeft: '5px solid #9c27b0' }}>
            <LocalAtm sx={{ color: '#9c27b0', fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">KES {stats?.totalVolume?.toLocaleString() || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Total Value Escrowed</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Typography variant="h5" fontWeight="bold" mb={2}>Registered Users ({users.length})</Typography>
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell fontWeight="bold">User</TableCell>
              <TableCell fontWeight="bold">Email</TableCell>
              <TableCell fontWeight="bold">Role</TableCell>
              <TableCell fontWeight="bold">Wallet (KES)</TableCell>
              <TableCell fontWeight="bold">Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">{u.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={u.role.toUpperCase()} 
                    size="small" 
                    color={u.role === 'admin' ? 'secondary' : 'default'} 
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="success.main">
                    {u.walletBalance?.toLocaleString() || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  {u.numReviews > 0 ? `${u.rating.toFixed(1)} (${u.numReviews})` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}
