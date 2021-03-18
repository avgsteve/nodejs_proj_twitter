const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const UserActivationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  activatedAt: {
    type: Date, // If this field is not given a value, means it's manually activated. See model method "makeActivate"
  },
  activationCodeCreatedAt: {
    type: Date,
    default: null,
  },
  activationCodeExpiresAt: {
    type: Date
  },
  activationCodeSent_count: {
    type: Number,
    default: 1,
  },
  activationCode: {
    type: String,
  }

},
  {
    timestamps: true,

  });


UserActivationSchema.statics = {

  createNewDoc: async (userId, userName) => {


    try {


      let existingDoc = await UserActivation.find({
        userName: userName
      });

      console.log('existingDoc: ', existingDoc);

      if (existingDoc.length !== 0) {
        existingDoc[0].generateActivationCode();
        return existingDoc;
      };

      let created = await UserActivation.create({
        userId: userId,
        userName: userName
      });

      await created.generateActivationCode();

      return created;


    } catch (error) {
      console.log('error: ', error);
    }

  },
};


UserActivationSchema.methods = {

  generateActivationCode: function () {

    console.log('generateActivationCode is called');

    const activeCode = crypto.randomBytes(32).toString('hex');
    // ref for crypto.randomBytes :
    // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    this.activationCode = activeCode;
    this.activationCodeCreatedAt = Date.now();
    this.activationCodeExpiresAt = Date.now() + 1000 * 60 * 10;
    this.save();
    return activeCode;
  },
  codeIsValid: () => {
    if (
      this.activationCodeExpiresAt < Date.now() &&
      this.isActivated === false
    ) return true;
    return false;
  },
  makeActivate() {
    this.isActivated = true;
    this.activatedAt = new Date().toISOString();
  }

};



// UserActivationSchema.methods.generateActivationCode = function () {

//   console.log('generateActivationCode is called');

//   const activeCode = crypto.randomBytes(32).toString('hex');
//   // ref for crypto.randomBytes :
//   // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
//   this.activationCode = activeCode;
//   this.activationCodeCreatedAt = Date.now();
//   this.activationCodeExpiresAt = Date.now() + 1000 * 60 * 10;
//   this.save();
//   return activeCode;
// }


let UserActivation = mongoose.model('UserActivation', UserActivationSchema);



module.exports = UserActivation;