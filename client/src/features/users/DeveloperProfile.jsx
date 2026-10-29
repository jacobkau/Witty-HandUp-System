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
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      
      {/* HERO BANNER */}
      <Box sx={{ 
        bgcolor: '#0f172a', 
        color: 'white', 
        pt: 8, 
        pb: 12, 
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)} 
            sx={{ color: '#94a3b8', mb: 4, textTransform: 'none', '&:hover': { color: 'white' } }}
          >
            Back to App
          </Button>

          <Avatar 
            src="https://res.cloudinary.com/ozrcvfms/image/upload/v1792083177/admins/cwoapxllb9npcwljm07m.jpg" 
            alt="Jacob Kau"
            sx={{ 
              width: 150, height: 150, mx: 'auto', mb: 3, 
              border: '4px solid #1e293b', boxShadow: 3
            }}
          />
          
          <Typography variant="h3" fontWeight="800" gutterBottom>
            Jacob Kau
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', mb: 2, fontWeight: 400 }}>
            Full-Stack Software Engineer
          </Typography>
          
          <Chip 
            label="Creator of Witty HandUp System" 
            sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 'bold', mb: 4 }} 
          />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              startIcon={<GitHub />} 
              href="https://github.com/jacobkau/HandUp.git" 
              target="_blank"
              sx={{ bgcolor: '#2563eb', color: 'white', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none' }}
            >
              GitHub Repo
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<LinkedIn />} 
              href="https://www.linkedin.com/in/jacob-mwambwa-8b7296362" 
              target="_blank"
              sx={{ color: 'white', borderColor: '#475569', '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(255,255,255,0.05)' }, textTransform: 'none' }}
            >
              LinkedIn
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* CONTENT SECTION */}
      <Container maxWidth="lg" sx={{ mt: -8 }}>
        {/* Tumeanza na Grid container, alignItems="stretch" inahakikisha zote zina urefu sawa */}
        <Grid container spacing={4} alignItems="stretch">
          
          {/* LEFT COLUMN: About (Takes 7 columns out of 12) */}
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, width: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b' }} gutterBottom>
                About the Developer
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" sx={{ color: '#64748b', flexGrow: 1 }} paragraph>
                Hi, I'm Jacob. I am a passionate full-stack developer dedicated to building tools that solve real-world problems. 
                Witty HandUp was born out of a desire to create a reliable, community-driven platform that connects people who need help with those willing to offer it, while ensuring both parties are protected.
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', flexGrow: 1 }} paragraph>
                I designed and engineered this entire system from the ground up. This includes the RESTful API, the real-time WebSocket architecture for the chat and notifications, the secure wallet escrow logic, and the responsive frontend you are using right now.
              </Typography>
              
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mt: 3 }} gutterBottom>
                Let's Connect
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                <Email sx={{ color: '#64748b' }} />
                <Typography variant="body2" component="a" href="mailto:wittyhighbrowtechnologies@gmail.com" sx={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
                  wittyhighbrowtechnologies@gmail.com
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Tech Stack & Stats (Takes 5 columns out of 12) */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Stack spacing={4} sx={{ width: '100%' }}>
              
              {/* TECH STACK */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }} gutterBottom>
                  Tech Stack Used
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {techStack.map((tech, index) => (
                    <Chip 
                      key={index} 
                      icon={tech.icon} 
                      label={tech.label} 
                      variant="outlined" 
                      size="small"
                      sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* APP STATS */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#0f172a', color: 'white', border: '1px solid #1e293b' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  System Architecture
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#1e293b' }} />
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Frontend</Typography>
                    <Typography variant="body2" fontWeight="bold">React + Vite</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Backend</Typography>
                    <Typography variant="body2" fontWeight="bold">Node.js + Express</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Database</Typography>
                    <Typography variant="body2" fontWeight="bold">MongoDB Atlas</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Real-time Engine</Typography>
                    <Typography variant="body2" fontWeight="bold">Socket.IO</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Hosting</Typography>
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
