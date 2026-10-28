import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';

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
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: 4,
          borderRadius: 2,
          borderTop: '4px solid #2563eb' // Solid blue accent matching your email template
        }}
      >
        {/* Professional Icon Header instead of a plain text header */}
        <Box sx={{ 
          backgroundColor: '#eff6ff', 
          p: 1.5, 
          borderRadius: '50%', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LockOutlined sx={{ color: '#2563eb' }} />
        </Box>

        <Typography component="h1" variant="h5" fontWeight="bold" color="text.primary">
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Join Witty HandUp to post or claim tasks.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            margin="normal"
            size="small"
            value={formData.name}
            onChange={handleInputChange('name')}
            disabled={isSubmitting}
            required
            autoFocus
          />
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            size="small"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={isSubmitting}
            required
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            size="small"
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
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Must be at least 6 characters"
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isSubmitting}
            disableElevation // Removes the 3D shadow for a flat, modern look
            sx={{ 
              mt: 3, 
              mb: 2,
              backgroundColor: '#2563eb', // Solid blue
              '&:hover': {
                backgroundColor: '#1d4ed8', 
              },
              py: 1.2,
              fontWeight: 'bold',
              textTransform: 'none'
            }}
            size="large"
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#2563eb', 
                  fontWeight: 600, 
                  textDecoration: 'none' 
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
