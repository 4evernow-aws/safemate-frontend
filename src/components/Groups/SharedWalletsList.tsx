import { useState } from 'react';
import type { SharedWallet, PermissionLevel } from '../../types/group';
import type { HederaWallet } from '../../types/wallet';

interface SharedWalletsListProps {
  groupId: string;
  sharedWallets: SharedWallet[];
  userWallet: HederaWallet | null;
  userRole: PermissionLevel;
  onShareWallet: (groupId: string, walletId: string) => Promise<void>;
  onUnshareWallet: (groupId: string, walletId: string) => Promise<void>;
}

export const SharedWalletsList = ({ 
  groupId, 
  sharedWallets, 
  userWallet, 
  userRole, 
  onShareWallet, 
  onUnshareWallet 
}: SharedWalletsListProps) => {
  const [showShareForm, setShowShareForm] = useState(false);

  const handleShareWallet = async () => {
    if (!userWallet) return;
    
    try {
      await onShareWallet(groupId, userWallet.walletId);
      setShowShareForm(false);
    } catch (error) {
      console.error('Error sharing wallet:', error);
    }
  };

  const canShareWallets = userRole === 'owner' || userRole === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Shared Wallets ({sharedWallets.length})</h3>
        {canShareWallets && userWallet && (
          <button
            onClick={() => setShowShareForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Share My Wallet
          </button>
        )}
      </div>

      {showShareForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Share your wallet with this group</div>
              <div className="text-sm text-gray-500">Account: {userWallet?.accountId}</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShareWallet}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sharedWallets.map((sharedWallet) => (
          <div key={sharedWallet.walletId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Wallet {sharedWallet.walletId}</div>
              <div className="text-sm text-gray-500">
                Shared by {sharedWallet.sharedBy} • {new Date(sharedWallet.sharedAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Permissions: 
                {sharedWallet.permissions.view_balance && ' View Balance'}
                {sharedWallet.permissions.view_transactions && ' View Transactions'}
                {sharedWallet.permissions.initiate_transactions && ' Initiate Transactions'}
              </div>
            </div>
            {canShareWallets && (
              <button
                onClick={() => onUnshareWallet(groupId, sharedWallet.walletId)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Unshare
              </button>
            )}
          </div>
        ))}
      </div>

      {sharedWallets.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💰</div>
          <p className="text-sm text-gray-500">No shared wallets yet</p>
        </div>
      )}
    </div>
  );
};