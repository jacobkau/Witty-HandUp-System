import { Box, Container, Typography, Avatar, Button, Paper, Grid, Stack, Chip, Divider } from '@mui/material';
import { 
  GitHub, LinkedIn, Email, Code, Storage, Cloud, 
  Terminal, Javascript, DeveloperMode, ArrowBack 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DeveloperProfile() {
  const navigate = useNavigate();

  const techStack = [
    { label: 'React.js', icon: <Code /> },
    { label: 'Node.js', icon: <Terminal /> },
    { label: 'MongoDB', icon: <Storage /> },
    { label: 'Express.js', icon: <DeveloperMode /> },
    { label: 'Material-UI', icon: <Javascript /> },
    { label: 'Socket.IO', icon: <Cloud /> },
  ];

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', pb: 10 }}>
      
      {/* HERO BANNER */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: 8, 
        pb: 12, 
        textAlign: 'center',
        backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)'
      }}>
        <Container maxWidth="md">
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)} 
            sx={{ color: 'white', mb: 4, textTransform: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
          >
            Back to App
          </Button>

          <Avatar 
            src="https://res.cloudinary.com/ozrcvfms/image/upload/v1792083177/admins/cwoapxllb9npcwljm07m.jpg" 
            alt="Jacob Kau"
            sx={{ 
              width: 150, 
              height: 150, 
              mx: 'auto', 
              mb: 3, 
              border: '4px solid white',
              boxShadow: 3
            }}
          />
          
          <Typography variant="h3" fontWeight="800" gutterBottom>
            Jacob Kau
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2, fontWeight: 400 }}>
            Full-Stack Software Engineer
          </Typography>
          
          <Chip 
            label="Creator of Witty HandUp System" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', mb: 4 }} 
          />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              startIcon={<GitHub />} 
              href="https://github.com/jacobkau/Witty-HandUp-System" 
              target="_blank"
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              GitHub Repo
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<LinkedIn />} 
              href="https://www.linkedin.com/in/jacob-mwambwa-8b7296362" 
              target="_blank"
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              LinkedIn
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* CONTENT SECTION */}
      <Container maxWidth="lg" sx={{ mt: -8 }}>
        <Grid container spacing={4}>
          
          {/* LEFT COLUMN: About */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                About the Developer
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" color="text.secondary" paragraph>
                Hi, I'm Jacob. I am a passionate full-stack developer dedicated to building tools that solve real-world problems. 
                Witty HandUp was born out of a desire to create a reliable, community-driven platform that connects people who need help with those willing to offer it, while ensuring both parties are protected.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                I designed and engineered this entire system from the ground up. This includes the RESTful API, the real-time WebSocket architecture for the chat and notifications, the secure wallet escrow logic, and the responsive frontend you are using right now.
              </Typography>
              
              <Typography variant="h6" fontWeight="bold" color="text.primary" mt={4} gutterBottom>
                Let's Connect
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                <Email color="action" />
                <Typography variant="body2" component="a" href="mailto:wittyhighbrowtechnologies@gmail.com" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold' }}>
                  wittyhighbrowtechnologies@gmail.com
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Tech Stack & Stats */}
          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              {/* TECH STACK */}
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                  Tech Stack Used
                </Typography>
                <Divider sx={{ mb: 3 }} />
                {/* ✅ FIXED: Closed with </Box> instead of </Chip> */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {techStack.map((tech, index) => (
                    <Chip 
                      key={index} 
                      icon={tech.icon} 
                      label={tech.label} 
                      variant="outlined" 
                      color="primary"
                      sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* APP STATS */}
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  System Architecture
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Frontend</Typography>
                    <Typography variant="body2" fontWeight="bold">React + Vite</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Backend</Typography>
                    <Typography variant="body2" fontWeight="bold">Node.js + Express</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Database</Typography>
                    <Typography variant="body2" fontWeight="bold">MongoDB Atlas</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Real-time Engine</Typography>
                    <Typography variant="body2" fontWeight="bold">Socket.IO</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Hosting</Typography>
                    <Typography variant="body2" fontWeight="bold">Render + Vercel</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
