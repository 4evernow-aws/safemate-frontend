import React from 'react';
import { Box, Alert, Chip, Typography } from '@mui/material';
import { landingContent } from '../data/landingContent';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import FunctionSection from './landing/FunctionSection';
import RoadmapSection from './landing/RoadmapSection';
import TokenomicsSection from './landing/TokenomicsSection';
import LandingFooter from './landing/LandingFooter';

const TestLandingPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflowX: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Test Page Banner */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 193, 7, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #ffc107',
          py: 1,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Chip 
            label="TEST PAGE" 
            color="warning" 
            size="small"
            sx={{ 
              fontWeight: 'bold',
              '& .MuiChip-label': {
                fontSize: '0.75rem',
                fontWeight: 700
              }
            }}
          />
          <Typography variant="body2" sx={{ color: '#000', fontWeight: 600 }}>
            This is a test version of the landing page for development and testing purposes
          </Typography>
          <Chip 
            label="V47.12" 
            color="info" 
            size="small"
            sx={{ 
              fontWeight: 'bold',
              '& .MuiChip-label': {
                fontSize: '0.75rem',
                fontWeight: 700
              }
            }}
          />
        </Box>
      </Box>

      {/* Add top padding to account for fixed banner */}
      <Box sx={{ position: 'relative', zIndex: 1, pt: 6 }}>
        <HeroSection content={landingContent.hero} />
        <FunctionSection content={landingContent.function} />
        <FeaturesSection content={landingContent.features} />
        <RoadmapSection content={landingContent.roadmap} />
        <TokenomicsSection content={landingContent.tokenomics} />
        <LandingFooter content={landingContent.footer} />
      </Box>

      {/* Test Features Alert */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          maxWidth: 400,
        }}
      >
        <Alert 
          severity="info" 
          sx={{ 
            backgroundColor: 'rgba(33, 150, 243, 0.9)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-message': {
              color: 'white'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            🧪 Test Page Features:
          </Typography>
          <Typography variant="caption" component="div">
            • Same content as production landing page<br/>
            • Visual test banner for identification<br/>
            • Safe for testing without affecting main site<br/>
            • V47.12 deployment testing
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default TestLandingPage;
