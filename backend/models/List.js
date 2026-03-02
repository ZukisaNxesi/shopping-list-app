const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String
  },
  purchased: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [itemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total price before saving
listSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('List', listSchema);