import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({...formData, [field]: e.target.value});
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleInputChange('name')}
            disabled={isSubmitting}
            required
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={isSubmitting}
            required
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isSubmitting}
            required
            inputProps={{ minLength: 6 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Password must be at least 6 characters long"
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2 }}
            size="large"
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button 
              component="a" 
              href="/login" 
              variant="text" 
              size="small"
              disabled={isSubmitting}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
