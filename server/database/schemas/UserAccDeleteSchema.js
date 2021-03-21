const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserAccDeleteSchema = new Schema({
  userIdToDelete: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  isCanceled: {
    type: Boolean,
    default: false
  },
  cancelRequestTime: {
    type: Date
  }
},
  {
    timestamps: true,
  });


// https://stackoverflow.com/questions/46589715/how-to-check-modified-fields-in-pre-post-update-hook-in-mongoose-js

UserAccDeleteSchema.pre('save', async function (next) {

  let fieldsUpdate = this.modifiedPaths();
  // Conditionally do stuff by check fieldsUpdate
  console.log('fieldsUpdate in UserAccDelete: \n', fieldsUpdate);
  this.cancelRequestTime = Date.now();

  console.log('Updated cancelRequestTime: \n', this.cancelRequestTime);

  await this.save();

  next();
});

let UserAccDelete = mongoose.model('UserAccDelete', UserAccDeleteSchema);

module.exports = UserAccDelete;