import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import api from '../../lib/api';
import { 
  TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl,
  Snackbar, Alert, Box, Stack, Paper, InputAdornment, CircularProgress, FormControlLabel, Switch
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'errands',
    location: { type: 'Point', coordinates: [0, 0], address: '' },
    deadline: null, price: 0, isUrgent: false
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || 'errands',
        location: initialValues.location || { type: 'Point', coordinates: [0, 0], address: '' },
        deadline: initialValues.deadline || null,
        price: initialValues.price || 0,
        isUrgent: initialValues.isUrgent || false
      });
    }
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      return setError('Please detect your location or search for an address.');
    }

    setIsSubmitting(true);
    try {
    
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        isUrgent: formData.isUrgent || false
      };

      if (onSubmit) {
        await onSubmit(payload);
        if (isEdit) setSuccess(true); 
      } else {
        await api.post('/tasks', payload);
        setSuccess(true);
        setTimeout(() => navigate('/tasks'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            coordinates: [pos.coords.longitude, pos.coords.latitude], 
            address: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          }
        });
        setIsDetectingLocation(false);
      },
      (err) => { setError(err.message); setIsDetectingLocation(false); },
      { enableHighAccuracy: true }
    );
  };

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        setFormData({
          ...formData,
          location: { type: 'Point', coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)], address: data[0].display_name }
        });
      } else { setError('Address not found'); }
    } catch (err) { setError('Search failed'); } finally { setIsSearching(false); }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">{isEdit ? 'Edit Task' : 'Post a New Task'}</Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} mt={2}>
          <TextField label="Task Title" fullWidth required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <TextField label="Description" fullWidth multiline rows={3} required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <TextField 
              label="Starting Budget (KES)" 
              type="number" 
              fullWidth 
              required 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
              helperText="Enter 0 if offering for free" 
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={formData.category} label="Category" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <MenuItem value="errands">Errands</MenuItem>
                <MenuItem value="repairs">Repairs</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="donations">Donations</MenuItem>
                <MenuItem value="cleaning">Cleaning</MenuItem>
                <MenuItem value="tech">Tech Support</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="events">Events</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker label="Deadline" value={formData.deadline} onChange={(val) => setFormData({...formData, deadline: val})} sx={{ flex: 1 }} />
            </LocalizationProvider>
            
            <FormControlLabel
              control={<Switch checked={formData.isUrgent} onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})} color="error" />}
              label="Mark as Urgent"
            />
          </Stack>

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Location</Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <TextField label="Search Address" fullWidth size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button variant="contained" onClick={handleAddressSearch} disabled={isSearching}>Search</Button>
            </Stack>
            <Button variant="outlined" onClick={detectLocation} disabled={isDetectingLocation}>Detect GPS</Button>
            {formData.location.address && <Typography variant="caption" display="block" mt={1}>{formData.location.address}</Typography>}
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Post Task'}</Button>
        </Stack>
      </form>
      <Snackbar open={!!error} autoHideDuration={6000}><Alert severity="error">{error}</Alert></Snackbar>
    </Paper>
  );
}
