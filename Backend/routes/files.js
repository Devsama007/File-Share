const express = require('express');
const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const Share = require('../models/Share');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload file(s)
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = await Promise.all(
      req.files.map(async (file) => {
        const fileDoc = new File({
          filename: file.filename,
          originalName: file.originalname,
          type: file.mimetype,
          size: file.size,
          path: file.path,
          owner: req.userId
        });
        await fileDoc.save();
        return fileDoc;
      })
    );

    res.status(201).json({ files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get user's files
router.get('/my-files', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.userId })
      .sort({ uploadDate: -1 })
      .populate('owner', 'name email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get files shared with user
router.get('/shared', auth, async (req, res) => {
  try {
    const shares = await Share.find({
      $or: [
        { sharedWith: req.userId },
        { shareType: 'link' }
      ]
    }).populate({
      path: 'file',
      populate: { path: 'owner', select: 'name email' }
    });

    // Filter valid shares
    const validFiles = shares
      .filter(share => share.isValid())
      .map(share => share.file)
      .filter(file => file !== null);

    res.json(validFiles);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download file
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check authorization
    const isOwner = file.owner.toString() === req.userId.toString();
    
    if (!isOwner) {
      const share = await Share.findOne({
        file: file._id,
        $or: [
          { sharedWith: req.userId },
          { shareType: 'link' }
        ]
      });

      if (!share || !share.isValid()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Send file
    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check ownership
    if (file.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file document and related shares
    await File.findByIdAndDelete(req.params.fileId);
    await Share.deleteMany({ file: req.params.fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;