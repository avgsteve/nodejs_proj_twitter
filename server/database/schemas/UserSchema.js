const mongoose = require('mongoose');

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
    password: {
        type: String,
        required: true,
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

let User = mongoose.model('User', UserSchema);



module.exports = User;