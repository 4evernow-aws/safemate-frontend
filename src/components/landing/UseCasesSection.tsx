import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { UseCasesContent } from '../../types/content';

const UseCaseCard = styled(Card)(({ theme }) => ({
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

interface UseCasesSectionProps {
  content: UseCasesContent;
}

const UseCasesSection: React.FC<UseCasesSectionProps> = ({ content }) => {
  return (
    <Box 
      id="usecases"
      sx={{ 
        py: 10, 
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(26, 26, 26, 0.5)' 
          : '#ffffff'
      }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#333',
              mb: 3
            }}
          >
            {content.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            {content.subtitle}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {content.categories.map((category, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <UseCaseCard>
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
                    {category.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 3,
                      color: '#333'
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    {category.items.map((item, itemIndex) => (
                      <Typography 
                        key={itemIndex}
                        variant="body2" 
                        sx={{ 
                          opacity: 0.8,
                          lineHeight: 1.6,
                          mb: 0.5,
                          position: 'relative',
                          pl: 2,
                          '&:before': {
                            content: '"•"',
                            position: 'absolute',
                            left: 0,
                            color: '#667eea',
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </UseCaseCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default UseCasesSection; 