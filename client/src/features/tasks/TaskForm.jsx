import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { 
  TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl,
  Snackbar, Alert, Box, Stack, Paper
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function TaskForm({ initialValues = null, onSubmit, onCancel, isEdit = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'errands',
    location: { type: 'Point', coordinates: [0, 0], address: '' },
    deadline: null
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || 'errands',
        location: initialValues.location || { type: 'Point', coordinates: [0, 0], address: '' },
        deadline: initialValues.deadline || null
      });
    }
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!user) {
      setError('You must be logged in to perform this action');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...formData };
      
      if (onSubmit) {
        await onSubmit(payload);
        if (isEdit) setSuccess(true); 
      } else {
        payload.requester = user._id;
        await api.post('/tasks', payload);
        setSuccess(true);
        setTimeout(() => navigate('/tasks'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || (isEdit ? 'Failed to update task' : 'Failed to create task'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            coordinates: [pos.coords.longitude, pos.coords.latitude],
            address: `Detected Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          }
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        setError(`Location detection failed: ${err.message}`);
        setIsDetectingLocation(false);
      }
    );
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
        {isEdit ? 'Edit Task Details' : 'Post a New Task'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} mt={2}>
          <TextField
            label="Task Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            inputProps={{ maxLength: 100 }}
            helperText={`${formData.title.length}/100 characters`}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={formData.category} label="Category" onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                <MenuItem value="errands">Errands</MenuItem>
                <MenuItem value="repairs">Repairs</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="donations">Donations</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Deadline (optional)"
                value={formData.deadline}
                onChange={(newValue) => setFormData({...formData, deadline: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Stack>

          <Box sx={{ p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} /> Task Location
            </Typography>
            
            <TextField
              label="Address / Area Name"
              fullWidth
              margin="normal"
              size="small"
              value={formData.location.address || ''}
              onChange={(e) => setFormData({...formData, location: { ...formData.location, address: e.target.value }})}
            />
            
            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} flexWrap="wrap" gap={2}>
              <Typography variant="caption" color="text.secondary">
                GPS: {formData.location.coordinates[0].toFixed(4)}, {formData.location.coordinates[1].toFixed(4)}
              </Typography>
              
              <Button onClick={detectLocation} variant="outlined" size="small" startIcon={<LocationOnIcon />} disabled={isDetectingLocation}>
                {isDetectingLocation ? 'Detecting...' : 'Detect GPS Location'}
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} pt={2}>
            {onCancel && (
              <Button variant="outlined" color="inherit" size="large" fullWidth onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting} disableElevation>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Posting...') : (isEdit ? 'Save Changes' : 'Post Task')}
            </Button>
          </Stack>
        </Stack>
      </form>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success" variant="filled">
          {isEdit ? 'Task updated successfully!' : 'Task created successfully!'}
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Snackbar>
    </Paper>
  );
}
