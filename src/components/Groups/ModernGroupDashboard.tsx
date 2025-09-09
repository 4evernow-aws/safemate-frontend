import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  ListItemButton,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
  Share as ShareIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  FilePresent as FileIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ModeratorIcon,
  Visibility as ViewerIcon,
} from '@mui/icons-material';
import { GroupService, type Group, type GroupMember, type SharedWallet } from '../../services/groupService';
import { WalletService } from '../../services/walletService';
import type { HederaWallet } from '../../types/wallet';
import ModernStatsCard from '../ModernStatsCard';
import ModernActionCard from '../ModernActionCard';
import InvitationModal from '../modals/InvitationModal';
import { config } from '../../config/environment';

interface ModernGroupDashboardProps {
  className?: string;
}

export default function ModernGroupDashboard({ className = '' }: ModernGroupDashboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sharedWallets, setSharedWallets] = useState<SharedWallet[]>([]);
  const [userWallet, setUserWallet] = useState<HederaWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [shareFilesDialogOpen, setShareFilesDialogOpen] = useState(false);
  const [manageGroupDialogOpen, setManageGroupDialogOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const theme = useTheme();

  // Only use real data - no mock data in production
  const sharedFiles: any[] = [];
  const activity: any[] = [];

  useEffect(() => {
    loadGroups();
    loadUserWallet();
  }, []);

  useEffect(() => {
    if (selectedGroup?.groupId) {
      loadGroupDetails(selectedGroup.groupId);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      console.log('🔍 Groups Debug: Loading groups...');
      const userGroups = await GroupService.getUserGroups();
      console.log('🔍 Groups Debug: Received groups:', userGroups);
      
      setGroups(userGroups);
      
      // Auto-select first group if none selected and groups exist
      if (userGroups.length > 0) {
        // Keep current selection if it's still valid, otherwise select first group
        const currentSelection = selectedGroup;
        const isCurrentSelectionValid = currentSelection && userGroups.find(g => g.groupId === currentSelection.groupId);
        
        if (!isCurrentSelectionValid) {
          console.log('🔍 Groups Debug: Auto-selecting first group:', userGroups[0]);
          setSelectedGroup(userGroups[0]);
        }
      } else {
        console.log('🔍 Groups Debug: No groups found, clearing selection');
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadUserWallet = async () => {
    try {
      const wallet = await WalletService.getWallet();
      setUserWallet(wallet);
    } catch (error) {
      console.error('Error loading user wallet:', error);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    try {
      const groupMembers = await GroupService.getGroupMembers(groupId);
      setMembers(groupMembers);
      
      // Only try to load shared wallets if the endpoint is available
      try {
        const groupSharedWallets = await GroupService.getSharedWallets(groupId);
        setSharedWallets(groupSharedWallets);
      } catch (walletError) {
        console.log('Shared wallets not available yet:', walletError);
        setSharedWallets([]);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
      setError('Failed to load group details');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      const newGroup = await GroupService.createGroup({
        groupName: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      await loadGroups();
      setSelectedGroup(newGroup);
      setCreateGroupDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      // Add success notification
      if ((window as any).addNotification) {
        (window as any).addNotification({
          title: 'Group created successfully!',
          description: `${newGroupName.trim()} is ready for collaboration`,
          icon: <GroupIcon fontSize="small" />,
          bgColor: 'success.main'
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    }
  };

  const handleInvitationSent = async () => {
    if (selectedGroup?.groupId) {
      await loadGroupDetails(selectedGroup.groupId);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: GroupMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleShareFiles = () => {
    setShareFilesDialogOpen(true);
    handleMenuClose();
  };

  const handleManageGroup = () => {
    if (selectedGroup) {
      setEditGroupName(selectedGroup.groupName);
      setEditGroupDescription(selectedGroup.description || '');
      setManageGroupDialogOpen(true);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !editGroupName.trim()) return;
    
    try {
      const result = await GroupService.updateGroup(selectedGroup.groupId, {
        groupName: editGroupName.trim(),
        description: editGroupDescription.trim()
      });
      
      await loadGroups();
      setManageGroupDialogOpen(false);
      
      // Add success notification
      if ((window as any).addNotification) {
        (window as any).addNotification({
          title: 'Group updated successfully!',
          description: `${editGroupName.trim()} has been updated`,
          icon: <GroupIcon fontSize="small" />,
          bgColor: 'success.main'
        });
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'editor':
        return <ModeratorIcon fontSize="small" />;
      case 'viewer':
        return <ViewerIcon fontSize="small" />;
      default:
        return <ViewerIcon fontSize="small" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'warning';
      case 'viewer':
        return 'info';
      default:
        return 'default';
    }
  };

  const loadRealGroupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always load fresh data
      await loadGroups();
      
      if (selectedGroup) {
        await loadGroupDetails(selectedGroup.groupId);
      }
    } catch (error) {
      console.error('Error loading real group data:', error);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can perform actions
  const currentUserRole = selectedGroup?.userRole || 'viewer';
  const canInviteMembers = GroupService.canUserPerformAction(currentUserRole, 'invite_members');
  const canManageGroup = GroupService.canUserPerformAction(currentUserRole, 'manage_group');
  const canShareFiles = GroupService.canUserPerformAction(currentUserRole, 'share_files');
  const canRemoveMembers = GroupService.canUserPerformAction(currentUserRole, 'remove_members');

  if (loading) {
    return (
      <Container maxWidth="xl" className={className} sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className={className} sx={{ py: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadRealGroupData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" className={className} sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Team Groups
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Collaborate securely with your team members
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateGroupDialogOpen(true)}
            sx={{ borderRadius: 3 }}
          >
            Create Group
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Box sx={{ height: '100%' }}>
              <ModernStatsCard
                title="Total Groups"
                value={groups.length}
                subtitle="Active groups"
                icon={<GroupIcon />}
                color="primary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Box sx={{ height: '100%' }}>
              <ModernStatsCard
                title="Team Members"
                value={members.length}
                subtitle="Current group"
                icon={<PeopleIcon />}
                color="success"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Box sx={{ height: '100%' }}>
              <ModernStatsCard
                title="Shared Files"
                value={sharedFiles.length}
                subtitle="Files shared"
                icon={<FileIcon />}
                color="warning"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Box sx={{ height: '100%' }}>
              <ModernStatsCard
                title="Activity"
                value={activity.length}
                subtitle="Recent actions"
                icon={<TrendingUpIcon />}
                color="info"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Group List */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3, height: 'fit-content', minHeight: { lg: 400 } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  My Groups ({groups.length})
                </Typography>
                {groups.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No groups yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first group to start collaborating
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {groups.map((group) => (
                      <ListItem key={group.groupId} disablePadding>
                        <ListItemButton
                          selected={selectedGroup?.groupId === group.groupId}
                          onClick={() => setSelectedGroup(group)}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <GroupIcon />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={group.groupName}
                            secondary={`${group.memberCount} members • ${group.userRole}`}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Group Details */}
          <Grid item xs={12} lg={8}>
            {selectedGroup ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Group Info */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
                        gap: 2,
                        mb: 2 
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" fontWeight={600} gutterBottom>
                            {selectedGroup.groupName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {selectedGroup.description || 'No description'}
                          </Typography>
                          <Chip
                            label={`Your Role: ${selectedGroup.userRole || 'viewer'}`}
                            icon={getRoleIcon(selectedGroup.userRole || 'viewer')}
                            color={getRoleColor(selectedGroup.userRole || 'viewer') as any}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'row', sm: 'row' },
                          gap: 1,
                          flexWrap: 'wrap'
                        }}>
                          {canInviteMembers && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PersonAddIcon />}
                              onClick={() => setInvitationModalOpen(true)}
                              sx={{ borderRadius: 2 }}
                            >
                              Invite
                            </Button>
                          )}
                          {canManageGroup && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={handleManageGroup}
                              sx={{ borderRadius: 2 }}
                            >
                              Manage
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Members */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Members ({members.length})
                      </Typography>
                      <List>
                        {members.map((member) => {
                          // Enhanced member display with better fallbacks
                          const getDisplayName = () => {
                            if (member.email) {
                              // Clean email display
                              const emailParts = member.email.split('@');
                              if (emailParts[0] && !member.email.includes('placeholder-')) {
                                return member.email;
                              }
                            }
                            if (member.hederaAccountId) {
                              return member.hederaAccountId;
                            }
                            return `User ${member.userId.substring(0, 8)}...`;
                          };

                          const getDisplayInitial = () => {
                            if (member.email && !member.email.includes('placeholder-')) {
                              return member.email.charAt(0).toUpperCase();
                            }
                            if (member.hederaAccountId) {
                              return 'H'; // H for Hedera
                            }
                            return 'U';
                          };

                          const getSecondaryInfo = () => {
                            const parts = [];
                            if (member.email && member.hederaAccountId && !member.email.includes('placeholder-')) {
                              parts.push(`Hedera: ${member.hederaAccountId}`);
                            }
                            return parts.join(' • ');
                          };

                          return (
                            <ListItem key={member.userId} divider>
                              <ListItemIcon>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {getDisplayInitial()}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={getDisplayName()}
                                secondary={
                                  <Stack direction="column" spacing={0.5}>
                                    {getSecondaryInfo() && (
                                      <Typography variant="caption" color="text.secondary">
                                        {getSecondaryInfo()}
                                      </Typography>
                                    )}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Chip
                                        label={member.role}
                                        icon={getRoleIcon(member.role)}
                                        color={getRoleColor(member.role) as any}
                                        size="small"
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                }
                              />
                              {canRemoveMembers && member.role !== 'owner' && (
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={(e) => handleMenuOpen(e, member)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Card sx={{ borderRadius: 3, minHeight: { xs: 200, sm: 300, lg: 400 } }}>
                <CardContent sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  minHeight: { xs: 200, sm: 300, lg: 400 }
                }}>
                  <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                    <GroupIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Select a group to view details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a group from the list to see members and manage settings
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Create Group Dialog */}
        <Dialog
          open={createGroupDialogOpen}
          onClose={() => setCreateGroupDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              variant="outlined"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Manage Group Dialog */}
        <Dialog
          open={manageGroupDialogOpen}
          onClose={() => setManageGroupDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Manage Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              variant="outlined"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={editGroupDescription}
              onChange={(e) => setEditGroupDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateGroup} variant="contained">Update</Button>
          </DialogActions>
        </Dialog>

        {/* Member Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleShareFiles}>
            <ShareIcon sx={{ mr: 1 }} />
            Share Files
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <DeleteIcon sx={{ mr: 1 }} />
            Remove from Group
          </MenuItem>
        </Menu>
      </Container>

      {/* Invitation Modal */}
      {selectedGroup && (
        <InvitationModal
          open={invitationModalOpen}
          onClose={() => setInvitationModalOpen(false)}
          groupId={selectedGroup.groupId}
          groupName={selectedGroup.groupName}
          userRole={selectedGroup.userRole || 'viewer'}
          onInvitationSent={handleInvitationSent}
        />
      )}
    </>
  );
} 