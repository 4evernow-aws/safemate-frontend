import { useState } from 'react';
import type { GroupMember, PermissionLevel } from '../../types/group';

interface GroupMembersListProps {
  groupId: string;
  members: GroupMember[];
  userRole: PermissionLevel;
  onAddMember: (groupId: string, userId: string, role: PermissionLevel) => Promise<void>;
  onRemoveMember: (groupId: string, userId: string) => Promise<void>;
}

export const GroupMembersList = ({ 
  groupId, 
  members, 
  userRole, 
  onAddMember, 
  onRemoveMember 
}: GroupMembersListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<PermissionLevel>('viewer');

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      await onAddMember(groupId, newMemberEmail, newMemberRole);
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Members ({members.length})</h3>
        {canManageMembers && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Add Member
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="Member email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as PermissionLevel)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleAddMember}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">{member.userId}</div>
              <div className="text-sm text-gray-500">
                {member.role} • Joined {new Date(member.joinedAt).toLocaleDateString()}
              </div>
            </div>
            {canManageMembers && member.role !== 'owner' && (
              <button
                onClick={() => onRemoveMember(groupId, member.userId)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">👥</div>
          <p className="text-sm text-gray-500">No members yet</p>
        </div>
      )}
    </div>
  );
};