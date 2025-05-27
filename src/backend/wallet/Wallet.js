const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  pokedollars: {
    type: Number,
    default: 1000
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true
      },
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
      },
      reason: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('wallet', WalletSchema);