import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { 
  Email as EmailIcon,
  Group as GroupIcon,
  Check as AcceptIcon,
  Close as DeclineIcon,
  PersonAdd as InviteIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import type { WidgetProps } from '../../dashboard/core/DashboardProvider';
import BaseWidget from '../shared/BaseWidget';
import { createWidget, WidgetRegistry } from '../../dashboard/core/WidgetRegistry';

interface GroupInvitation {
  id: string;
  groupName: string;
  inviterName: string;
  inviterEmail: string;
  invitedAt: string;
  groupType: 'family' | 'business' | 'community' | 'sporting' | 'cultural';
  memberCount: number;
}

const GroupInvitationsWidget: React.FC<WidgetProps> = ({ widgetId, accountType, onAction }) => {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate loading invitations
    const mockInvitations: GroupInvitation[] = [
      // Empty for now to match the "No invitations found" state
    ];
    setInvitations(mockInvitations);
  }, []);

  const handleAcceptInvitation = (invitation: GroupInvitation) => {
    onAction?.('accept-invitation', { widgetId, invitationId: invitation.id });
    console.log(`Action: Accept invitation to ${invitation.groupName} for ${accountType} account`);
    
    // Remove from list after accepting
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
  };

  const handleDeclineInvitation = (invitation: GroupInvitation) => {
    onAction?.('decline-invitation', { widgetId, invitationId: invitation.id });
    console.log(`Action: Decline invitation to ${invitation.groupName} for ${accountType} account`);
    
    // Remove from list after declining
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    onAction?.('refresh-invitations', { widgetId });
    console.log(`Action: Refresh Group Invitations for ${accountType} account`);
    
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getGroupTypeColor = (type: string) => {
    const colors = {
      family: '#4CAF50',
      business: '#2196F3',
      community: '#FF9800',
      sporting: '#E91E63',
      cultural: '#9C27B0'
    };
    return colors[type as keyof typeof colors] || '#757575';
  };

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ 
        width: 64, 
        height: 64, 
        mx: 'auto', 
        mb: 2,
        bgcolor: 'grey.100',
        color: 'grey.400'
      }}>
        <EmailIcon sx={{ fontSize: 32 }} />
      </Avatar>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No invitations found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You'll see group invitations here when you receive them
      </Typography>
      <Button 
        variant="outlined" 
        startIcon={<InviteIcon />}
        size="small"
        onClick={() => onAction?.('create-group', { widgetId })}
      >
        Create Group
      </Button>
    </Box>
  );

  const renderInvitations = () => (
    <List sx={{ width: '100%' }}>
      {invitations.map((invitation, index) => (
        <React.Fragment key={invitation.id}>
          <ListItem 
            sx={{ 
              px: 0,
              py: 2,
              alignItems: 'flex-start'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ 
                bgcolor: getGroupTypeColor(invitation.groupType),
                color: 'white'
              }}>
                <GroupIcon />
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {invitation.groupName}
                  </Typography>
                  <Chip 
                    label={invitation.groupType}
                    size="small"
                    sx={{ 
                      bgcolor: getGroupTypeColor(invitation.groupType),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Invited by {invitation.inviterName} ({invitation.inviterEmail})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invitation.memberCount} members • {invitation.invitedAt}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AcceptIcon />}
                      onClick={() => handleAcceptInvitation(invitation)}
                      sx={{ minWidth: 80 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeclineIcon />}
                      onClick={() => handleDeclineInvitation(invitation)}
                      sx={{ minWidth: 80 }}
                    >
                      Decline
                    </Button>
                  </Box>
                </Box>
              }
            />
          </ListItem>
          {index < invitations.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <BaseWidget
      widgetId={widgetId}
      accountType={accountType}
      title="Group Invitations"
      subtitle="Manage your group memberships"
      loading={isLoading}
      onRefresh={handleRefresh}
      actions={[
        { label: 'View All', action: 'view-all' },
        { label: 'Accept All', action: 'accept-all' }
      ]}
    >
      <Box sx={{ width: '100%', minHeight: 200 }}>
        {invitations.length === 0 ? renderEmptyState() : renderInvitations()}
      </Box>
    </BaseWidget>
  );
};

export const GroupInvitationsWidgetDefinition = createWidget({
  id: 'group-invitations',
  name: 'Group Invitations',
  component: GroupInvitationsWidget,
  category: 'groups',
  permissions: ['personal', 'family', 'business', 'community', 'sporting', 'cultural'],
  gridSize: { cols: 6, rows: 8 },
  priority: 12,
});

WidgetRegistry.register(GroupInvitationsWidgetDefinition);

export default GroupInvitationsWidget;
