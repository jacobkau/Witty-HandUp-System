import { Link } from 'react-router-dom';
import useAuth from './useAuth'; 
import { 
  Box, Typography, Button, Container, Paper, Stack, Chip 
} from '@mui/material';
import { 
  Gavel, AccountBalanceWallet, Work, Chat, 
  Security, ArrowForward 
} from '@mui/icons-material';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { title: "Live Bidding System", desc: "Post your budget and let helpers negotiate. Pick the best offer.", icon: <Gavel /> },
    { title: "Manual Secure Payments", desc: "Pay directly via M-Pesa. Submit the transaction code to verify.", icon: <AccountBalanceWallet /> },
    { title: "Skill Matching", desc: "Get instantly notified when tasks matching your skills are posted nearby.", icon: <Work /> },
    { title: "In-App Chat", desc: "Coordinate directly with your helper without sharing personal numbers.", icon: <Chat /> }
  ];

  return (
    <Box sx={{ pb: 10 }}>
      
      {/* HERO SECTION - Solid Dark Blue */}
      <Box sx={{ 
        bgcolor: '#0f172a', // Rangi moja tuli (no gradient)
        color: 'white', 
        pt: { xs: 10, md: 14 }, 
        pb: { xs: 10, md: 14 }, 
        textAlign: 'center',
        borderBottomLeftRadius: { xs: 30, md: 80 },
        borderBottomRightRadius: { xs: 30, md: 80 },
      }}>
        <Container maxWidth="md">
          <Chip 
            label="Trusted by the Community" 
            icon={<Security style={{ color: '#94a3b8' }} />} 
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#e2e8f0', mb: 3, fontWeight: 'bold' }} 
          />
          <Typography variant="h2" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: '-1px' }}>
            Get Help. Give Help. <br />
            <span style={{ color: '#38bdf8' }}>Earn Money.</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 5, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
            Witty HandUp is the easiest way to delegate your errands and tasks. 
            Post a job, receive bids from skilled helpers, and pay securely.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {user ? (
              <Button component={Link} to="/tasks" variant="contained" size="large" 
                sx={{ bgcolor: '#2563eb', color: 'white', fontWeight: 'bold', '&:hover': { bgcolor: '#1d4ed8' }, px: 4, py: 1.5, textTransform: 'none' }}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button component={Link} to="/register" variant="contained" size="large" 
                  sx={{ bgcolor: '#2563eb', color: 'white', fontWeight: 'bold', '&:hover': { bgcolor: '#1d4ed8' }, px: 4, py: 1.5, textTransform: 'none' }}>
                  Post a Task
                </Button>
                <Button component={Link} to="/register" variant="outlined" size="large" 
                  endIcon={<ArrowForward />}
                  sx={{ color: 'white', borderColor: '#475569', '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(255,255,255,0.05)' }, px: 4, py: 1.5, textTransform: 'none' }}>
                  Become a Helper
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* FEATURES SECTION - Clean White Cards */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, display: 'flex' }}>
              <Paper elevation={0} sx={{ 
                p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                borderRadius: 3, minHeight: 240, border: '1px solid #e2e8f0', 
                transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
              }}>
                <Box sx={{ 
                  width: 60, height: 60, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#334155', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, minHeight: 64, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1, color: '#64748b' }}>
                  {feature.desc}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* HOW IT WORKS & CTA SIDE-BY-SIDE */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'stretch' }}>
          
          {/* Left Side: How It Works */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
              How It Works
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b', mb: 4 }}>
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
                    width: 40, height: 40, flexShrink: 0, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#0f172a', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' 
                  }}>
                    {item.step}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b' }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>{item.desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Right Side: CTA Box - Solid Dark Blue (No Gradient) */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Paper elevation={0} sx={{ 
              p: 5, borderRadius: 4, bgcolor: '#0f172a', color: 'white', // Solid color 
              display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', width: '100%',
              border: '1px solid #1e293b'
            }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ready to get started?
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
                Join thousands of users saving time and earning money on Witty HandUp. Create your free account today.
              </Typography>
              {!user ? (
                <Button component={Link} to="/register" variant="contained" size="large" disableElevation 
                  sx={{ bgcolor: '#2563eb', color: 'white', fontWeight: 'bold', '&:hover': { bgcolor: '#1d4ed8' }, py: 1.5, textTransform: 'none' }}>
                  Create a Free Account
                </Button>
              ) : (
                <Button component={Link} to="/tasks" variant="contained" size="large" disableElevation 
                  sx={{ bgcolor: '#2563eb', color: 'white', fontWeight: 'bold', '&:hover': { bgcolor: '#1d4ed8' }, py: 1.5, textTransform: 'none' }}>
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
