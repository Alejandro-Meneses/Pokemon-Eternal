// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'user',  // Establecer el rol predeterminado como "user"
    enum: ['user', 'admin', 'moderator']  // Puedes definir los roles permitidos
  }
});


module.exports = mongoose.model('User', userSchema);
