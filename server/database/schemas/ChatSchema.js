const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        chatName: {
            type: String, trim: true
        },
        createdByUser: {
            type: Schema.Types.ObjectId, ref: 'User',
            require: true
        },
        isGroupChat: {
            // 如果只是傳給一個人的話就不是groupChat
            type: Boolean, default: false
        },
        usersInChat: [
            {
                type: Schema.Types.ObjectId, ref: 'User',
                require: true
            }],
        notificationForAllUsersWasCreated: {
            type: Boolean,
            default: false
        },
        latestMessage: {
            type: Schema.Types.ObjectId, ref: 'Message'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);