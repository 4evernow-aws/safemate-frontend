import React from 'react';
import { Box } from '@mui/material';
import { landingContent } from '../data/landingContent';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import FunctionSection from './landing/FunctionSection';
import RoadmapSection from './landing/RoadmapSection';
import TokenomicsSection from './landing/TokenomicsSection';
import LandingFooter from './landing/LandingFooter';

const LandingPage: React.FC = () => {
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
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <HeroSection content={landingContent.hero} />
        <FunctionSection content={landingContent.function} />
        <FeaturesSection content={landingContent.features} />
        <RoadmapSection content={landingContent.roadmap} />
        <TokenomicsSection content={landingContent.tokenomics} />
        <LandingFooter content={landingContent.footer} />
      </Box>
    </Box>
  );
};

export default LandingPage; 
 