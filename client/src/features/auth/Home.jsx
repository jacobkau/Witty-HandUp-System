import { Link } from 'react-router-dom';
import useAuth from './useAuth'; 
import { 
  Box, Typography, Button, Container, Grid, Paper, Stack, Chip 
} from '@mui/material';
import { 
  Gavel, AccountBalanceWallet, Work, Chat, 
  Security, ArrowForward 
} from '@mui/icons-material';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { title: "Live Bidding System", desc: "Post your budget and let helpers negotiate. Pick the best offer.", icon: <Gavel />, color: "#2196f3" },
    { title: "Manual Secure Payments", desc: "Pay directly via M-Pesa. Submit the transaction code to verify.", icon: <AccountBalanceWallet />, color: "#4caf50" },
    { title: "Skill Matching", desc: "Get instantly notified when tasks matching your skills are posted nearby.", icon: <Work />, color: "#ff9800" },
    { title: "In-App Chat", desc: "Coordinate directly with your helper without sharing personal numbers.", icon: <Chat />, color: "#9c27b0" }
  ];

  return (
    <Box sx={{ pb: 10 }}>
      
      {/* HERO SECTION */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: { xs: 10, md: 16 }, 
        pb: { xs: 10, md: 16 }, 
        textAlign: 'center',
        borderBottomLeftRadius: { xs: 30, md: 80 },
        borderBottomRightRadius: { xs: 30, md: 80 },
        backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
      }}>
        <Container maxWidth="md">
          <Chip 
            label="Trusted by the Community" 
            icon={<Security style={{ color: '#fbbf24' }} />} 
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', mb: 3, fontWeight: 'bold' }} 
          />
          <Typography variant="h2" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
            Get Help. Give Help. <br />
            <span style={{ color: '#fbbf24' }}>Earn Money.</span>
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 5, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            Witty HandUp is the easiest way to delegate your errands and tasks. 
            Post a job, receive bids from skilled helpers, and pay securely.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {user ? (
              <Button component={Link} to="/tasks" variant="contained" size="large" 
                sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f59e0b' }, px: 4, py: 1.5 }}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button component={Link} to="/register" variant="contained" size="large" 
                  sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f59e0b' }, px: 4, py: 1.5 }}>
                  Post a Task
                </Button>
                <Button component={Link} to="/register" variant="outlined" size="large" 
                  endIcon={<ArrowForward />}
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#fbbf24', color: '#fbbf24' }, px: 4, py: 1.5 }}>
                  Become a Helper
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* FEATURES SECTION - PURE FLEXBOX FOR ABSOLUTE PERFECTION */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          justifyContent: 'center' 
        }}>
          {features.map((feature, index) => (
            <Box 
              key={index} 
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
                display: 'flex' 
              }}
            >
              <Paper elevation={3} sx={{ 
                p: 4, 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                borderRadius: 3,
                minHeight: 240, // Inalazimisha cards zote ziwe na urefu sawa
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <Box sx={{ 
                  width: 60, height: 60, borderRadius: '50%', bgcolor: `${feature.color}15`, color: feature.color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, minHeight: 64, display: 'flex', alignItems: 'center' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {feature.desc}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* HOW IT WORKS & CTA SIDE-BY-SIDE */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 6, 
          alignItems: 'stretch' 
        }}>
          
          {/* Left Side: How It Works */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={4}>
              Getting help or earning money takes just a few clicks.
            </Typography>

            <Stack spacing={3}>
              {[
                { step: "1", title: "Post Your Task", desc: "Describe what you need done, set your budget, and pin your location." },
                { step: "2", title: "Receive Bids", desc: "Local helpers will review your task and submit their price offers." },
                { step: "3", title: "Accept & Chat", desc: "Pick the best helper, agree on terms, and coordinate via chat." },
                { step: "4", title: "Complete & Rate", desc: "Once done, pay via M-Pesa, verify the code, and rate the helper." }
              ].map((item, index) => (
                <Stack direction="row" spacing={2} alignItems="flex-start" key={index}>
                  <Box sx={{ 
                    width: 40, height: 40, flexShrink: 0, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' 
                  }}>
                    {item.step}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Right Side: CTA Box */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Paper elevation={0} sx={{ 
              p: 5, 
              borderRadius: 4, 
              backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%'
            }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ready to get started?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                Join thousands of users saving time and earning money on Witty HandUp. Create your free account today.
              </Typography>
              {!user ? (
                <Button component={Link} to="/register" variant="contained" size="large" disableElevation 
                  sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f59e0b' }, py: 1.5 }}>
                  Create a Free Account
                </Button>
              ) : (
                <Button component={Link} to="/tasks" variant="contained" size="large" disableElevation 
                  sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f59e0b' }, py: 1.5 }}>
                  Go to Dashboard
                </Button>
              )}
            </Paper>
          </Box>

        </Box>
      </Container>

    </Box>
  );
}
