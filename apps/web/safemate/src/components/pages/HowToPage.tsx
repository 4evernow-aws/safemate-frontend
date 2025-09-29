import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  Folder as FolderIcon,
  Group as GroupIcon,
  PhotoLibrary as GalleryIcon,
  MonetizationOn as MonetizeIcon,
  PlayArrow as PlayIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';

const HowToPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const quickStartSteps = [
    {
      title: 'Create Your Wallet',
      description: 'Set up your Hedera wallet to start using blockchain features',
      icon: <WalletIcon color="primary" />,
      status: 'active'
    },
    {
      title: 'Upload Your First File',
      description: 'Learn how to securely upload and store your files',
      icon: <FolderIcon color="primary" />,
      status: 'active'
    },
    {
      title: 'Join or Create Groups',
      description: 'Collaborate with others by creating or joining groups',
      icon: <GroupIcon color="primary" />,
      status: 'coming-soon'
    },
    {
      title: 'Explore Gallery',
      description: 'View and manage your uploaded files and media',
      icon: <GalleryIcon color="primary" />,
      status: 'coming-soon'
    },
    {
      title: 'Monetize Content',
      description: 'Learn how to monetize your digital assets',
      icon: <MonetizeIcon color="primary" />,
      status: 'coming-soon'
    }
  ];

  const faqItems = [
    {
      question: 'What is SafeMate?',
      answer: 'SafeMate is a blockchain-powered file storage and sharing platform that uses Hedera Hashgraph for secure, decentralized file management with built-in monetization capabilities.'
    },
    {
      question: 'How secure is my data?',
      answer: 'Your data is encrypted using enterprise-grade encryption and stored on the Hedera network, ensuring maximum security and privacy. All transactions are cryptographically verified.'
    },
    {
      question: 'What blockchain does SafeMate use?',
      answer: 'SafeMate uses Hedera Hashgraph, a distributed ledger technology that provides fast, fair, and secure transactions with low fees and high throughput.'
    },
    {
      question: 'How do I create a wallet?',
      answer: 'Wallets are automatically created when you first sign up. You can view your wallet details in the Wallet section of the dashboard.'
    },
    {
      question: 'Can I share files with others?',
      answer: 'Yes! You can create groups and share files with specific members. Group features are coming soon and will allow for collaborative file management.'
    },
    {
      question: 'How much does it cost?',
      answer: 'SafeMate offers a free tier with basic features. Premium features and monetization tools will be available in upcoming releases.'
    }
  ];

  const tutorials = [
    {
      title: 'Getting Started with SafeMate',
      description: 'Complete beginner guide to using SafeMate',
      duration: '5 min',
      type: 'video',
      level: 'beginner'
    },
    {
      title: 'Wallet Management',
      description: 'Learn how to manage your Hedera wallet',
      duration: '3 min',
      type: 'guide',
      level: 'beginner'
    },
    {
      title: 'File Upload & Security',
      description: 'Best practices for secure file uploads',
      duration: '4 min',
      type: 'video',
      level: 'intermediate'
    },
    {
      title: 'Understanding Blockchain',
      description: 'Learn about Hedera Hashgraph and blockchain basics',
      duration: '8 min',
      type: 'guide',
      level: 'beginner'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'coming-soon':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          How To Use SafeMate
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Learn how to get the most out of SafeMate's blockchain-powered file storage and sharing platform.
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>New to SafeMate?</AlertTitle>
          Start with the Quick Start Guide below to get up and running in minutes.
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Start Guide */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Start Guide
              </Typography>
              <List>
                {quickStartSteps.map((step, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {step.title}
                          </Typography>
                          <Chip
                            label={step.status === 'active' ? 'Available' : 'Coming Soon'}
                            color={getStatusColor(step.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={step.description}
                      secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Tutorials */}
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Video Tutorials & Guides
              </Typography>
              <Grid container spacing={2}>
                {tutorials.map((tutorial, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {tutorial.type === 'video' ? <VideoIcon color="primary" /> : <BookIcon color="primary" />}
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {tutorial.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {tutorial.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={tutorial.level}
                          color={getLevelColor(tutorial.level) as any}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {tutorial.duration}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<PlayIcon />}
                          sx={{ ml: 'auto' }}
                        >
                          Watch
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* FAQ Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Frequently Asked Questions
              </Typography>
              {faqItems.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={expanded === `panel${index + 1}`}
                  onChange={handleChange(`panel${index + 1}`)}
                  sx={{
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pt: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Tips
                </Typography>
              </Box>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Never share your private keys"
                    secondary="Keep your wallet credentials secure"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Use strong passwords"
                    secondary="Enable two-factor authentication"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Verify file integrity"
                    secondary="Check file hashes before sharing"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HowToPage;
