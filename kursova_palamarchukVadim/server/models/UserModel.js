const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 👇 Ось це нове поле для Адміна
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    rank: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;