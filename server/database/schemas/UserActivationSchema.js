const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserActivationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  activationCodeSentAt: {
    type: Date,
    default: null,
  },
  activationCodeSent_count: {
    type: Number,
    default: 1,
  },
  hashedActivationCode: {
    type: String,
  }

}, { timestamps: true });

let UserActivation = mongoose.model('UserActivation', UserActivationSchema);
module.exports = UserActivation;