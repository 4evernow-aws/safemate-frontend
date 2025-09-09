import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Business as BusinessIcon, 
  PhotoCamera, 
  VideoLibrary, 
  Security, 
  Description, 
  Archive,
  CheckCircle,
  Shield,
  Timeline,
  Group
} from '@mui/icons-material';

const Business = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      title: "Business Documents",
      description: "Store and manage important business documents, contracts, and legal files securely.",
      color: "#4CAF50"
    },
    {
      icon: <Archive sx={{ fontSize: 40 }} />,
      title: "Company Records",
      description: "Maintain comprehensive company records and historical data for compliance and reference.",
      color: "#2196F3"
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Client Files",
      description: "Secure storage for sensitive client information and confidential business data.",
      color: "#FF9800"
    },
    {
      icon: <Description sx={{ fontSize: 40 }} />,
      title: "Financial Data",
      description: "Protect financial records, invoices, and accounting documents with enterprise-grade security.",
      color: "#9C27B0"
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: "Legal Contracts",
      description: "Store and manage legal contracts, agreements, and compliance documentation.",
      color: "#607D8B"
    },
    {
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      title: "Business Assets",
      description: "Preserve digital assets, presentations, and marketing materials for your business.",
      color: "#E91E63"
    }
  ];

  const benefits = [
    "Enterprise-grade security with blockchain encryption",
    "Compliance-ready storage for regulatory requirements",
    "Permanent storage with no data loss risk",
    "Collaborative access controls for team members",
    "Audit trails and version control for all documents",
    "Cost-effective long-term storage solution"
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
            Business Storage
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
            Secure your business assets with enterprise-grade storage for documents, records, and intellectual property. 
            Protect your company's future with blockchain-powered permanent storage.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<BusinessIcon />}
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
              Why Choose SafeMate for Business Storage?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Enterprise Security
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Military-grade encryption and blockchain technology ensure your business data is protected 
                  against cyber threats, data breaches, and unauthorized access.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Compliance Ready
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Meet regulatory requirements with audit trails, version control, and permanent storage 
                  that satisfies industry compliance standards.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Team Collaboration
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Enable secure collaboration with role-based access controls, shared workspaces, 
                  and real-time document management for your team.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Permanent Storage
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                  Never lose critical business data again. Our blockchain-powered storage ensures 
                  your documents and records are preserved permanently.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Key Benefits for Your Business
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2, 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
            }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: '#4CAF50', mr: 2, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/')} 
            sx={{ 
              borderColor: 'white', 
              color: 'white',
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

export default Business; 