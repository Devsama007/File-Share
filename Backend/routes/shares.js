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

// Get file info via share link (requires auth but not ownership)
router.get('/view/:linkId', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ linkId: req.params.linkId })
      .populate({
        path: 'file',
        populate: { path: 'owner', select: 'name email' }
      });

    if (!share) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    if (!share.isValid()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Return file info (user is authenticated, so they can access it)
    res.json({
      file: share.file,
      share: {
        expiryDate: share.expiryDate,
        createdAt: share.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Access failed' });
  }
});

// Download file via share link (requires auth)
router.get('/download/:linkId', auth, async (req, res) => {
  try {
    const share = await Share.findOne({ linkId: req.params.linkId })
      .populate('file');

    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    const file = share.file;
    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
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