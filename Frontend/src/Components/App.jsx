import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Login from './Login';
import FileUpload from './FileUpload';
import FileList from './FileList';
import ShareModal from './ShareModal';
import { fileAPI } from '../services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [shareModalFile, setShareModalFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      loadFiles();
    } else {
      setLoading(false);
    }
  }, []);

  const loadFiles = async () => {
    try {
      const [myFilesRes, sharedFilesRes] = await Promise.all([
        fileAPI.getMyFiles(),
        fileAPI.getSharedFiles()
      ]);
      setMyFiles(myFilesRes.data);
      setSharedFiles(sharedFilesRes.data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMyFiles([]);
    setSharedFiles([]);
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileAPI.delete(fileId);
      loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (!user) {
    return <Login onLoginSuccess={(userData) => {
      setUser(userData);
      loadFiles();
    }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 bg-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">FileShare</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">Upload, share, and manage your files securely</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <FileUpload onUploadComplete={loadFiles} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FileList
            files={myFiles}
            title="My Files"
            onShare={setShareModalFile}
            onDelete={handleDelete}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <FileList
            files={sharedFiles}
            title="Shared with Me"
            onShare={() => {}}
            onDelete={() => {}}
            showOwner={true}
          />
        </div>
      </div>

      {shareModalFile && (
        <ShareModal
          file={shareModalFile}
          onClose={() => setShareModalFile(null)}
          onShare={loadFiles}
        />
      )}
    </div>
  );
};

export default App;