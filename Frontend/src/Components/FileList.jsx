import React from 'react';
import { Share2, Download, Trash2, FileText, Image, File } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileIcon = ({ type }) => {
  if (type?.startsWith('image/')) return <Image className="w-5 h-5" />;
  if (type === 'application/pdf') return <FileText className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
};

const FileList = ({ files, title, onShare, onDelete, showOwner = false }) => {
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (file) => {
    try {
      const response = await fileAPI.download(file._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No files {title.toLowerCase()}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {files.map(file => (
          <div key={file._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileIcon type={file.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.originalName}</h4>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{file.type || 'Unknown type'} • {formatSize(file.size)}</p>
                    <p>Uploaded: {formatDate(file.uploadDate)}</p>
                    {showOwner && file.owner && (
                      <p className="text-blue-600">
                        Owner: {file.owner.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {!showOwner && (
                  <>
                    <button
                      onClick={() => onShare(file)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(file._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;