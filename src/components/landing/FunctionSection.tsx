import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { FeaturesContent } from '../../types/content';

// Navigation function for different sections
const handleCardClick = (title: string) => {
  switch (title.toLowerCase()) {
    case 'personal':
      window.open('/personal', '_blank');
      break;
    case 'family':
      window.open('/family', '_blank');
      break;
    case 'business':
      window.open('/business', '_blank');
      break;
    case 'community':
      window.open('/community', '_blank');
      break;
    case 'cultural':
      window.open('/cultural', '_blank');
      break;
    case 'sporting teams':
      window.open('/sporting-teams', '_blank');
      break;
    default:
      window.open('/app', '_blank');
  }
};

const FunctionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(102, 126, 234, 0.2)'
    : '1px solid rgba(102, 126, 234, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 50px rgba(102, 126, 234, 0.3)'
      : '0 20px 50px rgba(102, 126, 234, 0.15)',
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const FunctionGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(4),
  marginTop: theme.spacing(6),
}));

interface FunctionSectionProps {
  content: FeaturesContent;
}

const FunctionSection: React.FC<FunctionSectionProps> = ({ content }) => {
  return (
    <Box 
      id="function"
      sx={{ 
        py: 10, 
        color: 'white',
        position: 'relative',
      }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 3
            }}
          >
            {content.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            {content.subtitle}
          </Typography>
        </Box>

        <FunctionGrid>
          {content.features.map((feature, index) => (
            <FunctionCard key={index} onClick={() => handleCardClick(feature.title)}>
              <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1 }}>
                <Box 
                  sx={{ 
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    fontSize: '2rem',
                    mb: 3
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h5" 
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
                  variant="body1" 
                  sx={{ 
                    opacity: 0.8,
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </FunctionCard>
          ))}
        </FunctionGrid>
      </Container>
    </Box>
  );
};

export default FunctionSection; 