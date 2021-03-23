const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String, required: true, trim: true
    },
    lastName: {
        type: String, required: true, trim: true
    },
    userName: {
        type: String, required: true, trim: true, unique: true
    },
    email: {
        type: String, required: true, trim: true, unique: true
    },
    // password: {
    //     type: String,
    //     required: true,
    //     select: false,
    // },
    hashed_password: {
        type: String,
        // required: true,
    },
    passwordLastUpdated: {
        type: Date,
        // required: true,
        select: false,
    },
    salt: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'test_user', 'admin', 'test-admin', 'super-admin'],
        default: 'user'
    },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    coverPhoto: {
        type: String
    },
    likes: [
        {
            type: Schema.Types.ObjectId, ref: 'Post'
        }],
    retweets: [
        {
            type: Schema.Types.ObjectId, ref: 'Post'
        }],
    following: [
        {
            type: Schema.Types.ObjectId, ref: 'User'
        }],
    followers: [
        {
            type: Schema.Types.ObjectId, ref: 'User'
        }],
    isActivated: {
        type: Boolean, default: false
    },
    activation: {
        type: Schema.Types.ObjectId, ref: 'UserActivation'
    },
    toBeDeleted: {
        type: Boolean, default: false,
        // select: false
    },
    toBeDeletedAt: {
        type: Date,
        // select: false
    },
    isDeleted: {
        type: Boolean, default: false,
        select: false
    },

}, { timestamps: true });

UserSchema.virtual('password')
    .set(async function (password) {
        const saltRound = 10;
        this.hashed_password = await bcrypt.hash(password, saltRound);
        this.passwordLastUpdated = new Date();
        await this.save();
    })
    .get(function () {
        return this.hashed_password;
    });

// methods (for virtual schema: 'password' )
UserSchema.methods = {
    verifyPassword: function (password) {
        return bcrypt.compare(password, this.hashed_password);
    },
    updatePassword: function (password) {
        let document = this;
        console.log('document: ', document);
        return new Promise(async (res, rej) => {
            const saltRound = 10;
            try {
            document.hashed_password = await bcrypt.hash(password, saltRound);
            document.passwordLastUpdated = new Date();
            let updatedDocument = await document.save();
            res(updatedDocument);
            } catch (error) {
                console.trace('error: ', error);
                rej(undefined);
            }
        }
        );
    }
};


let User = mongoose.model('User', UserSchema);



module.exports = User;