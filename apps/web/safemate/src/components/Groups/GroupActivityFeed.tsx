import React, { useState, useEffect } from 'react';
import { GroupService, type GroupActivity } from '../../services/groupService';

interface GroupActivityFeedProps {
  groupId: string;
}

export const GroupActivityFeed = ({ groupId }: GroupActivityFeedProps) => {
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [groupId]);

  const loadActivities = async () => {
    try {
      const groupActivities = await GroupService.getGroupActivities(groupId);
      setActivities(groupActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'group_created': return '🏗️';
      case 'member_added': return '👤';
      case 'member_removed': return '👋';
      case 'wallet_shared': return '💰';
      case 'wallet_unshared': return '🔒';
      case 'permission_changed': return '⚙️';
      case 'role_changed': return '🔄';
      default: return '📝';
    }
  };

  const getActivityDescription = (activity: GroupActivity) => {
    switch (activity.activityType) {
      case 'group_created':
        return 'Group was created';
      case 'member_added':
        return `Member ${activity.details?.user_id || 'unknown'} was added with role ${activity.details?.role || 'unknown'}`;
      case 'member_removed':
        return `Member ${activity.details?.user_id || 'unknown'} was removed`;
      case 'wallet_shared':
        return `Wallet ${activity.details?.wallet_id || 'unknown'} was shared`;
      case 'wallet_unshared':
        return `Wallet ${activity.details?.wallet_id || 'unknown'} was unshared`;
      case 'permission_changed':
        return 'Permissions were updated';
      case 'role_changed':
        return `Role was changed for ${activity.details?.user_id || 'unknown'}`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.activityId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">{getActivityIcon(activity.activityType)}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {getActivityDescription(activity)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📝</div>
          <p className="text-sm text-gray-500">No activities yet</p>
        </div>
      )}
    </div>
  );
};