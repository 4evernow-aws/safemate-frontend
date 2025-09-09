import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  Chip,
  Avatar,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  ExpandMore, 
  HelpOutline, 
  QuestionAnswer, 
  ContactSupport, 
  BugReport, 
  Settings, 
  Security,
  AccountBalanceWallet,
  CloudUpload,
  Group,
  FileCopy,
  Lock,
  Speed,
  VerifiedUser,
  Star,
  TrendingUp,
  Support,
  Email,
  Phone,
  Chat,
  Person,
  Business,
  Share
} from '@mui/icons-material';

const HelpPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🆘 Help & Support Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Everything you need to know about SafeMate
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip icon={<Support />} label="24/7 Support" color="primary" variant="outlined" />
          <Chip icon={<VerifiedUser />} label="Secure & Private" color="success" variant="outlined" />
          <Chip icon={<Speed />} label="Fast & Reliable" color="info" variant="outlined" />
        </Box>
      </Box>

      {/* Quick Actions Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              <AccountBalanceWallet />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Wallet Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Learn how to create and manage your Hedera wallet
            </Typography>
            <Button variant="contained" size="small">
              Get Started
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'secondary.main' }}>
              <CloudUpload />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              File Upload
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload and secure your files on the blockchain
            </Typography>
            <Button variant="contained" size="small">
              Learn More
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
              <Group />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Team Collaboration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share files and collaborate with your team
            </Typography>
            <Button variant="contained" size="small">
              Explore
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - FAQ */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuestionAnswer color="primary" />
              Frequently Asked Questions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">How do I create my Hedera wallet?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Your Hedera wallet is automatically created when you sign up for SafeMate! 
                  We use advanced blockchain technology to generate a secure wallet for you.
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    💡 Pro Tip:
                  </Typography>
                  <Typography variant="body2">
                    Your wallet is accessible from the Dashboard → Wallet section. 
                    You can view your balance, send funds, and manage transactions.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">How secure is my data on SafeMate?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  SafeMate uses enterprise-grade security with blockchain encryption. 
                  Your data is decentralized, tamper-proof, and we never have access to your private keys.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Lock color="success" /></ListItemIcon>
                    <ListItemText primary="End-to-end encryption" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                    <ListItemText primary="Blockchain verification" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Security color="success" /></ListItemIcon>
                    <ListItemText primary="Zero-knowledge architecture" />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">How do I upload and share files?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  Uploading files is simple! Navigate to the Upload section and either drag & drop 
                  your files or click to browse. Files are automatically encrypted and stored securely.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Sharing Process:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><FileCopy color="primary" /></ListItemIcon>
                    <ListItemText primary="1. Upload your file" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Group color="primary" /></ListItemIcon>
                    <ListItemText primary="2. Create or join a group" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Share color="primary" /></ListItemIcon>
                    <ListItemText primary="3. Share with group members" />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">What are the different account types?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  SafeMate supports multiple account types to suit different needs:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Chip icon={<Person />} label="Personal" color="primary" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Individual users with basic features
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip icon={<Group />} label="Family" color="secondary" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Family sharing and collaboration
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip icon={<Business />} label="Business" color="success" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Professional teams and organizations
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip icon={<Star />} label="Community" color="warning" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Community and group projects
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Right Column - Support & Resources */}
        <Grid item xs={12} lg={4}>
          {/* Contact Support */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContactSupport color="primary" />
              Get Support
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Support" 
                  secondary="support@safemate.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Chat color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Live Chat" 
                  secondary="Available 24/7"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone Support" 
                  secondary="+1 (555) 123-4567"
                />
              </ListItem>
            </List>
            
            <Button variant="contained" fullWidth sx={{ mt: 2 }}>
              Contact Support
            </Button>
          </Paper>

          {/* Quick Links */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              Quick Links
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
                         <List>
               <ListItem>
                 <ListItemIcon><Settings /></ListItemIcon>
                 <ListItemText primary="Account Settings" />
               </ListItem>
               <ListItem>
                 <ListItemIcon><Security /></ListItemIcon>
                 <ListItemText primary="Security Center" />
               </ListItem>
               <ListItem>
                 <ListItemIcon><BugReport /></ListItemIcon>
                 <ListItemText primary="Report a Bug" />
               </ListItem>
               <ListItem>
                 <ListItemIcon><Star /></ListItemIcon>
                 <ListItemText primary="Feature Requests" />
               </ListItem>
             </List>
          </Paper>

          {/* System Status */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser color="success" />
              System Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip label="All Systems Operational" color="success" size="small" />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpPage;
