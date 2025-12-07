const express = require('express');
const File = require('../models/File');
const Share = require('../models/Share');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Upload file(s)
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto"
        });

        // Save in MongoDB
        const fileDoc = new File({
          filename: file.filename,
          originalName: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: result.secure_url,   // Cloud URL
          owner: req.userId
        });

        await fileDoc.save();
        return fileDoc;
      })
    );

    res.status(201).json({ files: uploadedFiles });
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

// Get shared files
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

    const validFiles = shares
      .filter(s => s.isValid())
      .map(s => s.file)
      .filter(f => f !== null);

    res.json(validFiles);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download file (Cloudinary URL redirect)
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

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

    // STREAM FROM CLOUDINARY
    const https = require('https');

    https.get(file.url, (cloudinaryStream) => {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName || "download"}"`
      );

      cloudinaryStream.pipe(res);
    }).on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Download failed" });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});


// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Extract Cloudinary public_id
    const publicId = file.url.split('/').slice(-1)[0].split('.')[0];

    // delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });

    await File.findByIdAndDelete(req.params.fileId);
    await Share.deleteMany({ file: req.params.fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
