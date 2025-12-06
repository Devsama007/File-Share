import React, { useState, useEffect } from 'react';
import { Users, Link, Clock, X } from 'lucide-react';
import { shareAPI, authAPI } from '../services/api';

const ShareModal = ({ file, onClose, onShare }) => {
  const [shareType, setShareType] = useState('users');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      if (shareType === 'users' && selectedUsers.length > 0) {
        await shareAPI.shareWithUsers({
          fileId: file._id,
          userIds: selectedUsers,
          expiryDate: expiryDate || null
        });
        onShare();
        onClose();
      } else if (shareType === 'link') {
        const response = await shareAPI.generateLink({
          fileId: file._id,
          expiryDate: expiryDate || null
        });
        setShareLink(response.data.shareLink);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Share failed: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share: {file.originalName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShareType('users')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                shareType === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Share with Users
            </button>
            <button
              onClick={() => setShareType('link')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                shareType === 'link' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              Share Link
            </button>
          </div>

          {shareType === 'users' && (
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users:
              </label>
              {availableUsers.map(user => (
                <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUser(user._id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {shareLink && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-medium text-green-800 mb-2">Share Link Generated:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              Expiry Date (Optional):
            </label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {!shareLink && (
            <button
              onClick={handleShare}
              disabled={loading || (shareType === 'users' && selectedUsers.length === 0)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (shareType === 'users' ? 'Share with Selected Users' : 'Generate Share Link')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;