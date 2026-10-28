import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { toast } from 'react-toastify';

import { 
  Box, Paper, Typography, CircularProgress, Button, Divider, 
  Avatar, Chip, Stack, TextField, Alert, IconButton, InputAdornment 
} from '@mui/material';
import { 
  Person as PersonIcon, Email as EmailIcon, CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon, ArrowBack as ArrowBackIcon, 
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  Visibility, VisibilityOff
} from '@mui/icons-material';

export default function Profile() {
  const { user: authUser, updateUser } = useAuth(); 
  const [user, setUser] = useState(authUser || null);
  const [isLoading, setIsLoading] = useState(!authUser);
  const [error, setError] = useState('');
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      updateUser(res.data.user); 
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load profile';
      setError(errorMsg);
      toast.error(errorMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, updateUser]);

  useEffect(() => {
    if (!authUser) fetchProfile();
  }, [fetchProfile, authUser]);

  const handleEditClick = () => {
    setFormData({ name: user.name, email: user.email, password: '' });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/me', formData);
      setUser(res.data.user);
      updateUser(res.data.user); 
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error && !user) return <Box textAlign="center" mt={8}><Typography color="error">{error}</Typography></Box>;
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}>
        Back to Tasks
      </Button>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        
        {/* Header Section */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}>
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4" fontWeight="bold">{user.name}</Typography>
                {user.role === 'admin' && (
                  <Chip icon={<AdminIcon style={{ color: 'white' }} />} label="Admin" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
                )}
              </Stack>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>Witty HandUp Member</Typography>
            </Box>
          </Box>

          {!isEditing && (
            <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={handleEditClick} disableElevation sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Details / Edit Section */}
        <Box p={4}>
          {isEditing ? (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Edit Information</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={3}>
                <TextField label="Full Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <TextField label="Email Address" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <TextField 
                  label="New Password (leave blank to keep current)" 
                  type={showPassword ? 'text' : 'password'} 
                  fullWidth 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  helperText="Must be at least 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={2} pt={2}>
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => setIsEditing(false)} disabled={isSaving} startIcon={<CancelIcon />}>Cancel</Button>
                  <Button type="submit" variant="contained" fullWidth disabled={isSaving} startIcon={<SaveIcon />} disableElevation>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <>
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>Account Information</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">Full Name</Typography>
                  </Stack>
                  <Typography variant="body1">{user.name}</Typography>
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">Email Address</Typography>
                  </Stack>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">Member Since</Typography>
                  </Stack>
                  <Typography variant="body1">{formatDate(user.createdAt)}</Typography>
                </Box>
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
