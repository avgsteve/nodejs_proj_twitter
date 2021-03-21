const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserAccDeleteSchema = new Schema({
  userIdToDelete: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  userName: {
    type: String // just for record
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
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }

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


UserAccDeleteSchema;

UserAccDeleteSchema.statics = {

  createNewDoc: async function (userId, userName) {

    try {

      let existingDoc = await UserAccDelete.findOne({
        userIdToDelete: userId,
      });

      console.log('check existing user activation data: ', existingDoc);

      if (existingDoc) {
        existingDoc.isCanceled = false;
        await existingDoc.save();
        return existingDoc;
      };

      let newDeleteDoc = await UserAccDelete.create({
        userIdToDelete: userId,
        userName: userName
      });
      return newDeleteDoc;

    } catch (error) {
      console.log('error: ', error);
    }

  },
};

let UserAccDelete = mongoose.model('UserAccDelete', UserAccDeleteSchema);

module.exports = UserAccDelete;