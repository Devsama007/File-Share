import React, { useState, useEffect } from 'react';
import { Download, Clock, User, AlertCircle, FileText, Image, File } from 'lucide-react';
import { shareAPI } from '../services/api';

const FileIcon = ({ type }) => {
  if (type?.startsWith('image/')) return <Image className="w-8 h-8" />;
  if (type === 'application/pdf') return <FileText className="w-8 h-8" />;
  return <File className="w-8 h-8" />;
};

const SharedFileView = ({ linkId, onBack }) => {
  const [file, setFile] = useState(null);
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedFile();
  }, [linkId]);

  const loadSharedFile = async () => {
    try {
      const response = await shareAPI.viewSharedFile(linkId);
      setFile(response.data.file);
      setShare(response.data.share);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load shared file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await shareAPI.downloadSharedFile(linkId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Download failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading shared file...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Shared File</h1>
            <p className="text-blue-100">Someone shared this file with you via link</p>
          </div>

          {/* File Info */}
          <div className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <FileIcon type={file.type} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {file.originalName}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Type: {file.type || 'Unknown'}
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Size: {formatSize(file.size)}
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Shared by: {file.owner?.name} ({file.owner?.email})
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Uploaded: {formatDate(file.uploadDate)}
                  </p>
                  {share.expiryDate && (
                    <p className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-4 h-4" />
                      Expires: {formatDate(share.expiryDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 <strong>Secure Access:</strong> This file is shared via a private link. 
                You must be logged in to access it. The link may expire based on the owner's settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedFileView;