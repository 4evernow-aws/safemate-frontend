import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Mail as MailIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { GroupService, type GroupInvitation } from '../services/groupService';

interface UserInvitationsProps {
  className?: string;
}

export default function UserInvitations({ className = '' }: UserInvitationsProps) {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<GroupInvitation | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInvitations = await GroupService.getUserInvitations();
      setInvitations(userInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      setError('Failed to load invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInvitation = async (
    invitationId: string, 
    response: 'accept' | 'decline'
  ) => {
    try {
      setResponding(invitationId);
      setError(null);

      const result = await GroupService.respondToInvitation(invitationId, { response });
      
      if (result.success) {
        await loadInvitations();
        setConfirmDialogOpen(false);
        setSelectedInvitation(null);
        setPendingResponse(null);
        
        // Show success notification
        if ((window as any).addNotification) {
          (window as any).addNotification({
            title: `Invitation ${response}ed!`,
            description: response === 'accept' 
              ? `You've joined the group ${selectedInvitation?.groupName}` 
              : `You've declined the invitation to ${selectedInvitation?.groupName}`,
            icon: response === 'accept' ? <CheckIcon fontSize="small" /> : <ClearIcon fontSize="small" />,
            bgColor: response === 'accept' ? 'success.main' : 'info.main'
          });
        }
      } else {
        setError(result.error || `Failed to ${response} invitation`);
      }
    } catch (error) {
      console.error(`Error ${response}ing invitation:`, error);
      setError(`Failed to ${response} invitation. Please try again.`);
    } finally {
      setResponding(null);
    }
  };

  const openConfirmDialog = (invitation: GroupInvitation, response: 'accept' | 'decline') => {
    setSelectedInvitation(invitation);
    setPendingResponse(response);
    setConfirmDialogOpen(true);
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

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const respondedInvitations = invitations.filter(inv => inv.status !== 'pending');

  if (loading) {
    return (
      <Card className={className} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MailIcon color="primary" />
            <Typography variant="h6">
              Group Invitations
            </Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading your invitations...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MailIcon color="primary" />
            <Typography variant="h6">
              Group Invitations
            </Typography>
            {pendingInvitations.length > 0 && (
              <Chip
                size="small"
                label={`${pendingInvitations.length} pending`}
                color="warning"
                variant="filled"
              />
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {invitations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MailIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No invitations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll see group invitations here when you receive them
              </Typography>
            </Box>
          ) : (
            <>
              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Pending Invitations ({pendingInvitations.length})
                  </Typography>
                  <List>
                    {pendingInvitations.map((invitation, index) => (
                      <React.Fragment key={invitation.invitationId}>
                        <ListItem 
                          sx={{ 
                            px: 0,
                            border: 1,
                            borderColor: 'warning.light',
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: 'warning.50',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <GroupIcon fontSize="small" color="primary" />
                                <Typography variant="body1" fontWeight={500}>
                                  {invitation.groupName || 'Group Invitation'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={invitation.role}
                                  variant="outlined"
                                  color="primary"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {invitation.inviterEmail || 'Someone'} invited you to join their group
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Sent: {formatDate(invitation.createdAt)} • 
                                  Expires: {formatDate(invitation.expiresAt)}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={() => openConfirmDialog(invitation, 'accept')}
                                disabled={responding === invitation.invitationId}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<ClearIcon />}
                                onClick={() => openConfirmDialog(invitation, 'decline')}
                                disabled={responding === invitation.invitationId}
                              >
                                Decline
                              </Button>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              {/* Previous Invitations */}
              {respondedInvitations.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Previous Invitations ({respondedInvitations.length})
                  </Typography>
                  <List>
                    {respondedInvitations.map((invitation, index) => (
                      <React.Fragment key={invitation.invitationId}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <GroupIcon fontSize="small" color="disabled" />
                                <Typography variant="body1">
                                  {invitation.groupName || 'Group Invitation'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={invitation.role}
                                  variant="outlined"
                                  color="default"
                                />
                                <Chip
                                  size="small"
                                  icon={getStatusIcon(invitation.status)}
                                  label={invitation.status}
                                  color={getStatusColor(invitation.status) as any}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {invitation.inviterEmail || 'Someone'} invited you to join their group
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {invitation.respondedAt 
                                    ? `Responded: ${formatDate(invitation.respondedAt)}`
                                    : `Sent: ${formatDate(invitation.createdAt)}`
                                  }
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < respondedInvitations.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6">
              {pendingResponse === 'accept' ? 'Accept' : 'Decline'} Invitation
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {pendingResponse === 'accept' 
              ? `Are you sure you want to accept the invitation to join "${selectedInvitation?.groupName}"?`
              : `Are you sure you want to decline the invitation to join "${selectedInvitation?.groupName}"?`
            }
          </Typography>
          
          {selectedInvitation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Group
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedInvitation.groupName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedInvitation.role}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Invited by
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedInvitation.inviterEmail || 'Unknown'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {pendingResponse === 'accept' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              By accepting this invitation, you'll be able to collaborate with the group members and access shared files.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedInvitation && pendingResponse && handleRespondToInvitation(selectedInvitation.invitationId, pendingResponse)}
            variant="contained"
            color={pendingResponse === 'accept' ? 'success' : 'error'}
            disabled={responding === selectedInvitation?.invitationId}
            sx={{ borderRadius: 2 }}
          >
            {responding === selectedInvitation?.invitationId 
              ? `${pendingResponse === 'accept' ? 'Accepting' : 'Declining'}...`
              : `${pendingResponse === 'accept' ? 'Accept' : 'Decline'} Invitation`
            }
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 