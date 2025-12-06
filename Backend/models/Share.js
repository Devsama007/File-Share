const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareType: {
    type: String,
    enum: ['user', 'link'],
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  linkId: {
    type: String,
    unique: true,
    sparse: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if share is valid (not expired)
shareSchema.methods.isValid = function() {
  if (!this.expiryDate) return true;
  return new Date(this.expiryDate) > new Date();
};

module.exports = mongoose.model('Share', shareSchema);