import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip
} from '@mui/material';
import { Block, CheckCircle, Delete, Warning } from '@mui/icons-material';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportedTasks, setReportedTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/reports') 
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setReportedTasks(reportsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
    else { setError('Access Denied. Admin only.'); setLoading(false); }
  }, [user]);

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to toggle'); }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await api.delete(`/admin/users/${selectedUser._id}`);
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); } finally { setIsProcessing(false); }
  };

  // Resolve Report
  const handleResolveReport = async (taskId) => {
    try {
      await api.put(`/admin/reports/${taskId}/resolve`);
      setReportedTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) { alert("Failed to resolve report"); }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  if (error) return <Box textAlign="center" p={6}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>Admin Control Panel</Typography>
      
      {/* Stats Grid */}
      <Grid container spacing={3} mb={6}>
        {[
          { title: 'Total Users', value: stats?.totalUsers, color: 'primary.main' },
          { title: 'Total Tasks', value: stats?.totalTasks, color: 'success.main' },
          { title: 'Active Tasks', value: stats?.activeTasks, color: 'warning.main' },
          { title: 'Total Volume', value: `KES ${stats?.totalVolume?.toLocaleString() || 0}`, color: 'text.primary' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase" mb={1}>{stat.title}</Typography>
              <Typography variant="h4" fontWeight="bold" color={stat.color}>{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Reported Tasks Section */}
      <Typography variant="h6" fontWeight="bold" mb={2}>Reported Tasks (Needs Attention)</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 6 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'error.50' }}>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Helper</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportedTasks.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No reported tasks</TableCell></TableRow>
            ) : (
              reportedTasks.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.requester?.name}</TableCell>
                  <TableCell>{t.helper?.name}</TableCell>
                  <TableCell><Chip label={t.reportReason} size="small" color="error" /></TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" color="success" onClick={() => handleResolveReport(t._id)}>
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Management */}
      <Typography variant="h6" fontWeight="bold" mb={2}>User Management</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{u.name?.charAt(0)}</Avatar>
                    <Typography variant="body2" fontWeight="medium">{u.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.role.toUpperCase()} size="small" color={u.role === 'admin' ? 'primary' : 'default'} /></TableCell>
                <TableCell><Chip label={u.isActive ? 'Active' : 'Inactive'} size="small" color={u.isActive ? 'success' : 'error'} variant="outlined" /></TableCell>
                <TableCell align="right">
                  {u.role !== 'admin' && (
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title={u.isActive ? "Deactivate" : "Activate"}>
                        <Button size="small" variant="outlined" color={u.isActive ? "warning" : "success"} onClick={() => handleToggleStatus(u._id)}>
                          {u.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button size="small" variant="outlined" color="error" onClick={() => { setSelectedUser(u); setDeleteModalOpen(true); }}>
                          <Delete fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}><Warning /> Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Delete <strong>{selectedUser?.name}</strong> permanently?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
