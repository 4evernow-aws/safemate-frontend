import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Museum, 
  PhotoCamera, 
  VideoLibrary, 
  MusicNote, 
  History, 
  School,
  CheckCircle,
  Celebration,
  Security,
  Timeline,
  Book
} from '@mui/icons-material';

const Cultural = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: <Museum sx={{ fontSize: 40 }} />, 
      title: "Cultural Heritage", 
      description: "Preserve cultural artifacts, traditions, and heritage materials for future generations.", 
      color: "#4CAF50" 
    },
    { 
      icon: <PhotoCamera sx={{ fontSize: 40 }} />, 
      title: "Cultural Events", 
      description: "Document cultural festivals, ceremonies, and traditional celebrations with photos.", 
      color: "#2196F3" 
    },
    { 
      icon: <VideoLibrary sx={{ fontSize: 40 }} />, 
      title: "Cultural Videos", 
      description: "Record and preserve cultural performances, rituals, and traditional practices.", 
      color: "#FF9800" 
    },
    { 
      icon: <MusicNote sx={{ fontSize: 40 }} />, 
      title: "Traditional Music", 
      description: "Store traditional music, songs, and audio recordings of cultural significance.", 
      color: "#9C27B0" 
    },
    { 
      icon: <History sx={{ fontSize: 40 }} />, 
      title: "Cultural History", 
      description: "Maintain records of cultural history, stories, and traditional knowledge.", 
      color: "#607D8B" 
    },
    { 
      icon: <School sx={{ fontSize: 40 }} />, 
      title: "Cultural Education", 
      description: "Create educational resources for cultural learning and preservation.", 
      color: "#E91E63" 
    }
  ];

  const benefits = [
    "Permanent preservation of cultural heritage",
    "Secure storage of traditional knowledge",
    "Digital archiving of cultural artifacts",
    "Educational resource creation",
    "Multi-generational cultural transmission",
    "Protection against cultural loss"
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
            Cultural Storage
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
            Preserve cultural heritage and traditions with secure, permanent storage for artifacts, performances, and knowledge. 
            Ensure your cultural legacy lives on for future generations.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Museum />}
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
              Why Choose SafeMate for Cultural Preservation?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Museum sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Heritage Protection
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Protect precious cultural artifacts, traditions, and knowledge from loss, 
                  damage, or deterioration with permanent digital preservation.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Celebration sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Cultural Continuity
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Ensure cultural practices, ceremonies, and traditions are preserved 
                  and can be passed down to future generations without alteration.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Secure Preservation
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Store cultural materials securely with access controls that respect 
                  cultural sensitivities while enabling educational access.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Book sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Educational Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Create educational resources that allow people to learn about and 
                  appreciate cultural heritage while maintaining respect for traditions.
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
              Key Benefits for Cultural Preservation
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

export default Cultural; 