const express = require('express');
const crypto = require('crypto');
const File = require('../models/File');
const Share = require('../models/Share');
const auth = require('../middleware/auth');

const router = express.Router();

// Share file with users
router.post('/user', auth, async (req, res) => {
  try {
    const { fileId, userIds, expiryDate } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check ownership
    if (file.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const share = new Share({
      file: fileId,
      owner: req.userId,
      shareType: 'user',
      sharedWith: userIds,
      expiryDate: expiryDate || null
    });

    await share.save();
    res.status(201).json({ share, message: 'File shared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Share failed' });
  }
});

// Generate share link
router.post('/link', auth, async (req, res) => {
  try {
    const { fileId, expiryDate } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check ownership
    if (file.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate unique link ID
    const linkId = crypto.randomBytes(16).toString('hex');

    const share = new Share({
      file: fileId,
      owner: req.userId,
      shareType: 'link',
      linkId: linkId,
      expiryDate: expiryDate || null
    });

    await share.save();

    const shareLink = `${req.protocol}://${req.get('host')}/api/shares/link/${linkId}`;
    res.status(201).json({ shareLink, share });
  } catch (error) {
    res.status(500).json({ error: 'Link generation failed' });
  }
});

// Access file via share link
router.get('/link/:linkId', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ linkId: req.params.linkId })
      .populate('file');

    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    res.json({ file: share.file });
  } catch (error) {
    res.status(500).json({ error: 'Access failed' });
  }
});

// Get shares for a file
router.get('/file/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check ownership
    if (file.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shares = await Share.find({ file: req.params.fileId })
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });

    res.json(shares);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete share
router.delete('/:shareId', auth, async (req, res) => {
  try {
    const share = await Share.findById(req.params.shareId);
    
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check ownership
    if (share.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Share.findByIdAndDelete(req.params.shareId);
    res.json({ message: 'Share deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;