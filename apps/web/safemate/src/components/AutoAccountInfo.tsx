import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  styled
} from '@mui/material';
import {
  CheckCircle,
  Info,
  Wallet,
  Zap,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';

interface AutoAccountInfoProps {
  accountAlias: string;
  autoAccountInfo?: {
    type: 'auto_created';
    activation_method: 'first_transfer';
    benefits: string[];
  };
  onCopyAlias?: (alias: string) => void;
}

const InfoCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const BenefitItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: theme.palette.success.main
  }
}));

const AliasDisplay = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  wordBreak: 'break-all',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1)
}));

export default function AutoAccountInfo({ 
  accountAlias, 
  autoAccountInfo, 
  onCopyAlias 
}: AutoAccountInfoProps) {
  const handleCopyAlias = () => {
    navigator.clipboard.writeText(accountAlias);
    onCopyAlias?.(accountAlias);
  };

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://testnet.hashscan.io/account/${accountAlias}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Box>
      <InfoCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Wallet size={24} color="#3b82f6" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
              Hedera Auto Account
            </Typography>
            <Chip 
              label="Auto Created" 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Your account alias has been created!</strong> The actual Hedera account will be 
              automatically created when you receive your first HBAR transaction.
            </Typography>
          </Alert>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Account Alias:
          </Typography>
          
          <AliasDisplay>
            <Typography variant="body2" component="span">
              {accountAlias}
            </Typography>
            <Button
              size="small"
              startIcon={<Copy size={16} />}
              onClick={handleCopyAlias}
              variant="outlined"
            >
              Copy
            </Button>
          </AliasDisplay>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ExternalLink size={16} />}
              onClick={handleViewOnExplorer}
              variant="outlined"
            >
              View on Explorer
            </Button>
          </Box>
        </CardContent>
      </InfoCard>

      <InfoCard>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Auto Account Benefits
          </Typography>
          
          <List dense>
            {autoAccountInfo?.benefits.map((benefit, index) => (
              <BenefitItem key={index}>
                <ListItemIcon>
                  <CheckCircle size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary={benefit}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </BenefitItem>
            ))}
          </List>
        </CardContent>
      </InfoCard>

      <InfoCard>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            How to Activate Your Account
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Zap size={20} color="#f59e0b" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Send HBAR to your account alias to activate it on the Hedera network
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can get test HBAR from the{' '}
            <a 
              href="https://portal.hedera.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              Hedera Portal
            </a>
            {' '}or ask someone to send you some HBAR.
          </Typography>

          <Alert severity="success" icon={<Shield size={20} />}>
            <Typography variant="body2">
              <strong>Security Note:</strong> Your private key is securely stored and encrypted. 
              The account will only be accessible through SafeMate.
            </Typography>
          </Alert>
        </CardContent>
      </InfoCard>
    </Box>
  );
} 