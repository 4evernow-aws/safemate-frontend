import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Group, 
  PhotoCamera, 
  VideoLibrary, 
  RecordVoiceOver, 
  History, 
  School,
  CheckCircle,
  People,
  Celebration,
  Security,
  Timeline
} from '@mui/icons-material';

const Community = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: <Group sx={{ fontSize: 40 }} />, 
      title: "Community Groups", 
      description: "Create and manage secure storage for community organizations, clubs, and local groups.", 
      color: "#4CAF50" 
    },
    { 
      icon: <PhotoCamera sx={{ fontSize: 40 }} />, 
      title: "Community Events", 
      description: "Store and share photos from community events, festivals, and local celebrations.", 
      color: "#2196F3" 
    },
    { 
      icon: <VideoLibrary sx={{ fontSize: 40 }} />, 
      title: "Community Videos", 
      description: "Preserve community meetings, events, and important moments with secure video storage.", 
      color: "#FF9800" 
    },
    { 
      icon: <School sx={{ fontSize: 40 }} />, 
      title: "Educational Content", 
      description: "Store educational materials, workshops, and community learning resources.", 
      color: "#9C27B0" 
    },
    { 
      icon: <History sx={{ fontSize: 40 }} />, 
      title: "Public Records", 
      description: "Maintain secure public records and community documentation for future reference.", 
      color: "#607D8B" 
    },
    { 
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />, 
      title: "Shared Resources", 
      description: "Create shared storage spaces for community resources and collaborative projects.", 
      color: "#E91E63" 
    }
  ];

  const benefits = [
    "Secure collaboration for community organizations",
    "Permanent preservation of community history",
    "Easy sharing of resources and knowledge",
    "Access control for different community groups",
    "Cost-effective storage for non-profit organizations",
    "Digital preservation of cultural heritage"
  ];

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: theme => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      pt: 8, 
      pb: 6 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Community Storage
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              maxWidth: 800, 
              mx: 'auto', 
              lineHeight: 1.6,
              mb: 4 
            }}
          >
            Empower your community with secure, collaborative storage for events, resources, and shared memories. 
            Build a lasting digital legacy for your community.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Group />}
            onClick={handleGetStarted}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #4CAF50)'
              }
            }}
          >
            Get Started
          </Button>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gap: 4, 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
          mb: 6 
        }}>
          {features.map((feature, index) => (
            <Card 
              key={index} 
              sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.4)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3, 
                  background: feature.color, 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2 
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: 1.6 
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                mb: 4,
                textAlign: 'center'
              }}
            >
              Why Choose SafeMate for Community Storage?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Community Collaboration
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Enable multiple community members to contribute, share, and access resources 
                  while maintaining security and organization.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Celebration sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Event Preservation
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Capture and preserve community events, celebrations, and important moments 
                  for future generations to enjoy and learn from.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Secure Sharing
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Share community resources safely with controlled access, ensuring sensitive 
                  information remains protected while enabling collaboration.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Historical Preservation
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Create a permanent digital archive of your community's history, achievements, 
                  and cultural heritage for future reference.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Key Benefits for Your Community
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2, 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
            }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/')} 
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Community; 