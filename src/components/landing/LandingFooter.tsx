import React from 'react';
import { 
  Box, 
  Container, 
  Typography,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { FooterContent } from '../../types/content';

const FooterContainer = styled(Box)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(6, 0, 4, 0),
  position: 'relative',
}));

const FooterGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const FooterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SocialLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

interface LandingFooterProps {
  content: FooterContent;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ content }) => {
  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <FooterGrid>
          {/* Company Info */}
          <FooterSection>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              SafeMate Portal
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              {content.tagline}
            </Typography>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection>
            <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Contact
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                Email: 
                <Link 
                  href={`mailto:${content.contact_email}`} 
                  sx={{ 
                    color: '#667eea', 
                    textDecoration: 'none',
                    ml: 1,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {content.contact_email}
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Website: 
                <Link 
                  href={`https://${content.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#667eea', 
                    textDecoration: 'none',
                    ml: 1,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {content.website}
                </Link>
              </Typography>
            </Box>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection>
            <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="#features" 
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.8,
                  '&:hover': { opacity: 1, color: '#667eea' }
                }}
              >
                Features
              </Link>
              <Link 
                href="#roadmap" 
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.8,
                  '&:hover': { opacity: 1, color: '#667eea' }
                }}
              >
                Roadmap
              </Link>
              <Link 
                href="#tokenomics" 
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.8,
                  '&:hover': { opacity: 1, color: '#667eea' }
                }}
              >
                Tokenomics
              </Link>
              <Link 
                href="/faq" 
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  opacity: 0.8,
                  '&:hover': { opacity: 1, color: '#667eea' }
                }}
              >
                FAQ
              </Link>
              <Link 
                href="/app" 
                sx={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 'medium',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Try TestNet
              </Link>
            </Box>
          </FooterSection>

          {/* Social Media */}
          <FooterSection>
            <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Follow Us
            </Typography>
            <SocialLinks>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Stay tuned for social media links!
              </Typography>
            </SocialLinks>
          </FooterSection>
        </FooterGrid>

        {/* Bottom Copyright */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            pt: 3, 
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {content.copyright}
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default LandingFooter; 