import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  SportsSoccer, 
  PhotoCamera, 
  VideoLibrary, 
  EmojiEvents, 
  Group, 
  History,
  CheckCircle,
  Sports,
  Celebration,
  Security,
  Timeline,
  School
} from '@mui/icons-material';

const SportingTeams = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: <SportsSoccer sx={{ fontSize: 40 }} />, 
      title: "Team Photos", 
      description: "Store and organize team photos from games, practices, and team events.", 
      color: "#4CAF50" 
    },
    { 
      icon: <VideoLibrary sx={{ fontSize: 40 }} />, 
      title: "Game Videos", 
      description: "Preserve game footage, highlights, and memorable moments from the season.", 
      color: "#2196F3" 
    },
    { 
      icon: <EmojiEvents sx={{ fontSize: 40 }} />, 
      title: "Trophy Room", 
      description: "Document team achievements, awards, and championship moments.", 
      color: "#FF9800" 
    },
    { 
      icon: <Group sx={{ fontSize: 40 }} />, 
      title: "Team History", 
      description: "Maintain team records, statistics, and historical performance data.", 
      color: "#9C27B0" 
    },
    { 
      icon: <History sx={{ fontSize: 40 }} />, 
      title: "Season Archives", 
      description: "Create comprehensive season archives with photos, videos, and records.", 
      color: "#607D8B" 
    },
    { 
      icon: <PhotoCamera sx={{ fontSize: 40 }} />, 
      title: "Team Events", 
      description: "Store memories from team building events, celebrations, and social gatherings.", 
      color: "#E91E63" 
    }
  ];

  const benefits = [
    "Permanent preservation of team memories",
    "Secure storage of game footage and highlights",
    "Easy sharing with team members and families",
    "Historical record keeping for team achievements",
    "Cost-effective storage for sports organizations",
    "Digital preservation of team legacy"
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
            Sporting Teams Storage
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
            Preserve your team's legacy with secure storage for photos, videos, and records of your sporting achievements. 
            Create a lasting digital archive of your team's journey and accomplishments.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<SportsSoccer />}
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
              Why Choose SafeMate for Sporting Teams?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Sports sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Team Legacy
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Preserve your team's achievements, memories, and history for current and 
                  future team members to cherish and learn from.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Celebration sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Achievement Recognition
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Document and celebrate team victories, individual accomplishments, and 
                  special moments that define your team's journey.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Secure Sharing
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Share team content safely with players, coaches, families, and supporters 
                  while maintaining control over access and privacy.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Learning Resource
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Use archived footage and photos as training materials and learning resources 
                  for developing players and improving team performance.
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
              Key Benefits for Sporting Teams
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

export default SportingTeams; 