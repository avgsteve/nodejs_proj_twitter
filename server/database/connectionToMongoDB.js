//The require(‘mongoose’) call above returns a Singleton object. 
//It means that the first time you call require(‘mongoose’), it 
//is creating an instance of the Mongoose class and returning it. 
//On subsequent calls, it will return the same instance that was 
//created and returned to you the first time because of how module 
//import/export works in ES6.
const mongoose = require("mongoose");
require('dotenv').config();
const username = process.env.MONGODB_USERNAME;
const pwd = process.env.MONGODB_PASSWORD;

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
class mongoDB {

    constructor() {
        this.connect();
    }

    connect() {
        showMaskedUserNameAndPassword();

        //`mongodb+srv://${username}:${pwd}@cluster0.sua6j.mongodb.net/twitter?retryWrites=true&w=majority`
        mongoose.connect(`mongodb+srv://${username}:${pwd}@cluster0.sua6j.mongodb.net/twitter?retryWrites=true&w=majority`)
            .then(() => {
                console.log(`=== database connection successful: ${new Date().toISOString()
                    } (UTC±00)  ==`);
            })
            .catch((err) => {
                console.log("database connection error " + err);
            });
    }
}

// 直接建立Class實例與資料庫建立連線

function showMaskedUserNameAndPassword() {

    const percentageToMaskString = 50;
    const log =
        `=== connecting to database ... ===
    username: ${maskedString(process.env.MONGODB_USERNAME, percentageToMaskString)}
    password: ${maskedString(process.env.MONGODB_PASSWORD, percentageToMaskString)}  `;
    console.log(log);

    function maskedString(str, maskByPercentage = 50) {
        const lengthMasked = Math.floor(str.length * (maskByPercentage / 100));
        const lengthToShow = Math.floor((str.length - lengthMasked) / 2);
        const maskedString =
            `${str.slice(0, lengthToShow) + "*".repeat(lengthMasked) + str.slice(lengthMasked + lengthToShow, str.length)}`;
        return maskedString;
    }

}

module.exports = new mongoDB();