import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Description, 
  PhotoCamera, 
  VideoLibrary, 
  Audiotrack, 
  Archive, 
  Message 
} from '@mui/icons-material';

const Personal = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Description sx={{ fontSize: 40 }} />,
      title: "Important Documents",
      description: "Securely store and manage your personal documents like birth certificates, passports, wills, and legal papers.",
      color: "#4CAF50"
    },
    {
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      title: "Family Photos",
      description: "Preserve precious family memories with encrypted photo storage that lasts for generations.",
      color: "#2196F3"
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: "Home Videos",
      description: "Store and share family videos with secure, permanent storage on the blockchain.",
      color: "#FF9800"
    },
    {
      icon: <Audiotrack sx={{ fontSize: 40 }} />,
      title: "Personal Audio",
      description: "Keep voice recordings, music collections, and audio memories safe and accessible.",
      color: "#9C27B0"
    },
    {
      icon: <Archive sx={{ fontSize: 40 }} />,
      title: "Digital Archives",
      description: "Create permanent digital archives of your personal history and important moments.",
      color: "#607D8B"
    },
    {
      icon: <Message sx={{ fontSize: 40 }} />,
      title: "Private Messages",
      description: "Store personal messages, letters, and communications for future generations.",
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
            Personal Storage
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
            Secure your most precious personal assets - documents, photos, videos, and memories - with blockchain-powered storage that ensures they're safe for generations to come.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Archive />}
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
              Why Choose SafeMate for Personal Storage?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }
            }}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }}>🔒</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Military-Grade Security
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Your files are encrypted and stored on the Hedera blockchain, ensuring maximum security and privacy.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#2196F3', mb: 2 }}>⏰</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Permanent Storage
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Once stored, your files are permanently preserved on the blockchain, never to be lost or corrupted.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ fontSize: 60, color: '#FF9800', mb: 2 }}>👤</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Complete Control
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  You maintain full control over your files with private keys that only you possess.
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
              <strong>Ready to secure your personal assets?</strong> Join SafeMate today and start building your digital legacy.
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

export default Personal; 