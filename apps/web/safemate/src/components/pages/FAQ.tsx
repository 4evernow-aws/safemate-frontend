import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmailIcon from '@mui/icons-material/Email';
import { useTheme } from '@mui/material/styles';

const FAQPage: React.FC = () => {
  const theme = useTheme();

  const faqItems = [
    {
      question: "What is SafeMate?",
      answer: "SafeMate is a secure, decentralized file storage platform powered by Hedera blockchain technology. It provides users with a safe and reliable way to store and manage their files with enterprise-grade security."
    },
    {
      question: "How does SafeMate ensure file security?",
      answer: "SafeMate uses advanced encryption protocols and Hedera's distributed ledger technology to ensure your files are securely stored and protected. All data is encrypted both in transit and at rest."
    },
    {
      question: "What is the $MATE token?",
      answer: "The $MATE token is SafeMate's native utility token that powers the platform's ecosystem. It can be used for various platform features and governance decisions."
    },
    {
      question: "How do I get started with SafeMate?",
      answer: "To get started, simply create an account and set up your Hedera wallet. Once connected, you can begin uploading and managing your files securely on the platform."
    },
    {
      question: "Is SafeMate free to use?",
      answer: "SafeMate offers both free and premium tiers. Basic storage is available for free, while premium features and additional storage require $MATE tokens or subscription plans."
    },
    {
      question: "What file types are supported?",
      answer: "SafeMate supports a wide range of file types including documents, images, videos, audio files, and more. Files up to 50MB are supported with size limits depending on your account tier."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <HelpOutlineIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Find answers to common questions about SafeMate
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* FAQ Accordion */}
      <Box sx={{ mb: 6 }}>
        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 2, boxShadow: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Contact Support Section */}
      <Card sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 3
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <EmailIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Still Need Help?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Can't find the answer you're looking for? Our support team is here to help you with any questions or issues you may have.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Contact Support:</strong> For technical issues, account problems, or general inquiries, please reach out to our support team at{' '}
              <strong>support@forevernow.today</strong>
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<EmailIcon />}
              onClick={() => window.open('mailto:support@forevernow.today', '_blank')}
              sx={{ px: 4 }}
            >
              Email Support
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FAQPage; 