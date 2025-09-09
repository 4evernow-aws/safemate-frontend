import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  AccountCircle as AccountIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { GroupService, type GroupInvitation, type InviteMemberRequest } from '../../services/groupService';

interface InvitationModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  userRole: string;
  onInvitationSent: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invitation-tabpanel-${index}`}
      aria-labelledby={`invitation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function InvitationModal({
  open,
  onClose,
  groupId,
  groupName,
  userRole,
  onInvitationSent,
}: InvitationModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user can invite members
  const canInviteMembers = GroupService.canUserPerformAction(userRole, 'invite_members');
  
  // Available roles based on user's role
  const getAvailableRoles = () => {
    const allRoles = [
      { value: 'viewer', label: 'Viewer', description: 'Can view shared files' },
      { value: 'editor', label: 'Editor', description: 'Can view and share files' },
      { value: 'admin', label: 'Admin', description: 'Can manage group and members' },
    ];

    // Users can only assign roles equal to or lower than their own
    if (userRole === 'owner') return allRoles;
    if (userRole === 'admin') return allRoles.filter(r => r.value !== 'owner');
    if (userRole === 'editor') return allRoles.filter(r => !['owner', 'admin'].includes(r.value));
    return allRoles.filter(r => r.value === 'viewer');
  };

  useEffect(() => {
    if (open && canInviteMembers) {
      loadInvitations();
    }
  }, [open, canInviteMembers]);

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const groupInvitations = await GroupService.getGroupInvitations(groupId);
      setInvitations(groupInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!identifier.trim()) {
      setError('Please enter an email address or Hedera account ID');
      return;
    }

    if (!canInviteMembers) {
      setError('You do not have permission to invite members to this group');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const request: InviteMemberRequest = {
        identifier: identifier.trim(),
        role,
      };

      const invitation = await GroupService.inviteMember(groupId, request);
      
      setSuccessMessage(
        `Invitation sent successfully! ${invitation.inviteeEmail || invitation.inviteeAccountId} has been invited to join as ${role}.`
      );
      
      setIdentifier('');
      setRole('viewer');
      await loadInvitations();
      onInvitationSent();
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const validateIdentifier = (value: string) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return { type: 'email', valid: true };
    }
    
    // Check if it's a Hedera account ID (format: 0.0.xxxxxx)
    const hederaRegex = /^0\.0\.\d+$/;
    if (hederaRegex.test(value)) {
      return { type: 'hedera', valid: true };
    }
    
    return { type: 'unknown', valid: false };
  };

  const identifierValidation = validateIdentifier(identifier);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'declined': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ScheduleIcon fontSize="small" />;
      case 'accepted': return <CheckIcon fontSize="small" />;
      case 'declined': return <ClearIcon fontSize="small" />;
      case 'expired': return <ClearIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Manage Invitations - {groupName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Invite new members and manage existing invitations
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Send Invitation" />
          <Tab label={`Pending Invitations (${invitations.filter(i => i.status === 'pending').length})`} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Send Invitation Tab */}
        <TabPanel value={tabValue} index={0}>
          {!canInviteMembers ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              You do not have permission to invite members to this group. Only group owners, admins, and editors can send invitations.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {successMessage}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email Address or Hedera Account ID"
                  placeholder="user@example.com or 0.0.123456"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  error={identifier.length > 0 && !identifierValidation.valid}
                  helperText={
                    identifier.length > 0 
                      ? identifierValidation.valid 
                        ? `Valid ${identifierValidation.type === 'email' ? 'email address' : 'Hedera account ID'}`
                        : 'Please enter a valid email address (user@example.com) or Hedera account ID (0.0.123456)'
                      : 'Enter the email address or Hedera account ID of the person you want to invite'
                  }
                  InputProps={{
                    startAdornment: identifierValidation.type === 'email' ? 
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> :
                      identifierValidation.type === 'hedera' ?
                      <AccountIcon sx={{ mr: 1, color: 'text.secondary' }} /> : null
                  }}
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={role}
                    label="Role"
                    onChange={(e) => setRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                  >
                    {getAvailableRoles().map((roleOption) => (
                      <MenuItem key={roleOption.value} value={roleOption.value}>
                        <Box>
                          <Typography variant="body1">{roleOption.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {roleOption.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSendInvitation}
                  disabled={loading || !identifierValidation.valid || !canInviteMembers}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  {loading ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </Box>
            </>
          )}
        </TabPanel>

        {/* Pending Invitations Tab */}
        <TabPanel value={tabValue} index={1}>
          {loadingInvitations ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Loading invitations...
              </Typography>
            </Box>
          ) : invitations.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No invitations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send your first invitation using the "Send Invitation" tab
              </Typography>
            </Box>
          ) : (
            <List>
              {invitations.map((invitation, index) => (
                <React.Fragment key={invitation.invitationId}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {invitation.inviteeEmail || invitation.inviteeAccountId}
                          </Typography>
                          <Chip
                            size="small"
                            label={invitation.role}
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            size="small"
                            icon={getStatusIcon(invitation.status)}
                            label={invitation.status}
                            color={getStatusColor(invitation.status) as any}
                            variant={invitation.status === 'pending' ? 'filled' : 'outlined'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Invited by {invitation.inviterEmail || 'Unknown'} • {formatDate(invitation.createdAt)}
                          </Typography>
                          {invitation.status === 'pending' && (
                            <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                              Expires: {formatDate(invitation.expiresAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < invitations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}