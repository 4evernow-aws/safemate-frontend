import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  AppBar,
  Toolbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { HeroContent } from '../../types/content';
import ThemeToggle from '../ThemeToggle';

const HeroBackground = styled(Box)(() => ({
  color: 'white',
  minHeight: '30vh',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const HeroContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
}));

interface HeroSectionProps {
  content: HeroContent;
}

const HeroSection: React.FC<HeroSectionProps> = ({ content }) => {
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    if (content.primary_cta_link.startsWith('/')) {
      navigate(content.primary_cta_link);
    } else {
      window.open(content.primary_cta_link, '_blank');
    }
  };

  const handleSecondaryCTA = () => {
    window.open(content.secondary_cta_link, '_blank');
  };

  return (
    <HeroBackground>
      {/* Navigation */}
      <AppBar position="static" elevation={0} sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(20px)',
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 2
      }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            SafeMate Portal
          </Typography>
          
          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
            {['Features', 'Roadmap', 'Tokenomics'].map((section) => (
              <Button
                key={section}
                color="inherit"
                onClick={() => document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }
                }}
              >
                {section}
              </Button>
            ))}
            <Button
              color="inherit"
              onClick={() => navigate('/faq')}
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }
              }}
            >
              FAQ
            </Button>
          </Box>
          
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Hero Content */}
      <HeroContent>
        <Container maxWidth="lg">
          <Box sx={{ 
            maxWidth: '56.25%', 
            mx: 'auto',
            textAlign: 'center'
          }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.2rem', md: '3rem' },
                lineHeight: 1.2
              }}
            >
              {content.title}
            </Typography>
            <Typography 
              variant="h5" 
              paragraph 
              sx={{ 
                opacity: 0.9, 
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6
              }}
            >
              {content.subtitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                              <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handlePrimaryCTA}
                  sx={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    color: 'white',
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 8px 30px rgba(79, 70, 229, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(79, 70, 229, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                {content.primary_cta_text}
              </Button>
                              <Button 
                  variant="outlined" 
                  size="large"
                  onClick={handleSecondaryCTA}
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.7)', 
                    color: 'white',
                    borderWidth: '2px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                      borderColor: 'white',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 255, 255, 0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                {content.secondary_cta_text}
              </Button>
            </Box>
          </Box>
        </Container>
      </HeroContent>
    </HeroBackground>
  );
};

export default HeroSection; 