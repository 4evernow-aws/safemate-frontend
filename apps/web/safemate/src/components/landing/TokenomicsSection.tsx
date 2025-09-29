import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Paper,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { TokenomicsContent } from '../../types/content';

const TokenInfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(6),
}));

const TokenInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
  },
}));

const DistributionGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

const DistributionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
}));

interface TokenomicsSectionProps {
  content: TokenomicsContent;
}

const TokenomicsSection: React.FC<TokenomicsSectionProps> = ({ content }) => {
  const handleCTA = () => {
    if (content.cta_link.startsWith('/')) {
      // Navigation would be handled here if it's an internal link
      window.location.href = content.cta_link;
    } else {
      window.open(content.cta_link, '_blank');
    }
  };

  return (
    <Box 
      id="tokenomics"
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
              mb: 2
            }}
          >
            {content.title}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 'medium',
              mb: 3
            }}
          >
            {content.subtitle}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: '1.1rem'
            }}
          >
            {content.description}
          </Typography>
        </Box>

        {/* Token Information */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h3" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}
          >
            Token Information
          </Typography>
          <TokenInfoGrid>
            <TokenInfoCard elevation={2}>
              <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Initial Supply
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'black' }}>
                {content.token_info.initial_supply}
              </Typography>
            </TokenInfoCard>
            <TokenInfoCard elevation={2}>
              <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Max Supply
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'black' }}>
                {content.token_info.max_supply}
              </Typography>
            </TokenInfoCard>
            <TokenInfoCard elevation={2}>
              <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Token ID
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', fontFamily: 'monospace' }}>
                {content.token_info.token_id}
              </Typography>
            </TokenInfoCard>
            <TokenInfoCard elevation={2}>
              <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Network
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>
                {content.token_info.network}
              </Typography>
            </TokenInfoCard>
          </TokenInfoGrid>
        </Box>

        {/* Token Distribution */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h3" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}
          >
            Token Distribution
          </Typography>
          <DistributionGrid>
            {content.distribution.map((item, index) => (
              <DistributionItem key={index}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {item.category}
                  </Typography>
                </Box>
                <Chip
                  label={`${item.percentage}%`}
                  sx={{
                    backgroundColor: item.color,
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </DistributionItem>
            ))}
          </DistributionGrid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleCTA}
            sx={{
              backgroundColor: '#667eea',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { 
                backgroundColor: '#5a67d8',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {content.cta_text}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TokenomicsSection; 