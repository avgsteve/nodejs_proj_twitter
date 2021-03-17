const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: {
        type: String, trim: true
    },
    contentBeforeDeleted: {
        type: String,
    },
    postedBy: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    pinned: Boolean,
    likes: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    retweetUsers: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    isRetweetToPost: {
        type: Schema.Types.ObjectId, ref: 'Post'
    },
    isReplyToPost: {
        type: Schema.Types.ObjectId, ref: 'Post'
    },
    pinned: { type: Boolean, default: true },
    isDeleted: Boolean,
},
    {
        timestamps: true
    }
);

let Post = mongoose.model('Post', PostSchema);
module.exports = Post;