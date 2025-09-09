import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  FamilyRestroom, 
  PhotoCamera, 
  VideoLibrary, 
  RecordVoiceOver, 
  Event, 
  History 
} from '@mui/icons-material';

const Family = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FamilyRestroom sx={{ fontSize: 40 }} />,
      title: "Family Tree",
      description: "Create and preserve your family genealogy with photos, documents, and stories for future generations.",
      color: "#4CAF50"
    },
    {
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      title: "Family Photos",
      description: "Store and organize family photos from generations past, present, and future in one secure location.",
      color: "#2196F3"
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: "Family Videos",
      description: "Preserve precious family moments, celebrations, and milestones with permanent video storage.",
      color: "#FF9800"
    },
    {
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />,
      title: "Family Stories",
      description: "Record and store family stories, traditions, and oral histories for posterity.",
      color: "#9C27B0"
    },
    {
      icon: <Event sx={{ fontSize: 40 }} />,
      title: "Family Events",
      description: "Document family celebrations, reunions, and special occasions with photos and videos.",
      color: "#607D8B"
    },
    {
      icon: <History sx={{ fontSize: 40 }} />,
      title: "Family History",
      description: "Build a comprehensive family history archive with documents, photos, and personal accounts.",
      color: "#E91E63"
    }
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
            Family Storage
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
            Preserve your family's legacy with secure, permanent storage for photos, videos, stories, and memories that will be cherished by generations to come.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<FamilyRestroom />}
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
                <Box
                  sx={{
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
                  }}
                >
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
              Why Choose SafeMate for Family Storage?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }
            }}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }}>👨‍👩‍👧‍👦</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Family Privacy
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Your family's precious memories are encrypted and stored securely, ensuring complete privacy and protection.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#2196F3', mb: 2 }}>⏰</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Generational Legacy
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Create a lasting digital legacy that can be passed down through generations, never to be lost or forgotten.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#FF9800', mb: 2 }}>👤</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Family Control
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Maintain full control over your family's digital assets with secure access for authorized family members.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center' }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              background: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              color: 'white'
            }}
          >
            <Typography variant="body1">
              <strong>Ready to preserve your family's legacy?</strong> Start building your family's digital archive today with SafeMate.
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              borderColor: 'white',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
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

export default Family; 