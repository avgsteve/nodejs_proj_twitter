
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const chalk = require('chalk')
const UserDocument = require('../database/schemas/UserSchema');
const dataAsObj = require('../database/statisticData');
const db = require('./fetchStatsData');
const currentTime = new Date().toISOString();

// https://phoenixnap.com/kb/set-up-cron-job-linux

// 1) five asterisk keys
// *        *      *     *       *
// (Minute) (Hour) (Day) (Month) (Day of the Week)

// 2) six asterisk keys
// *        *        *      *     *       *
// (Second) (Minute) (Hour) (Day) (Month) (Day of the Week)



exports.logOnEvery30Second = () => {

  try {
    let i = 0;
    while (++i < 10) {
      cron.schedule(`${i * 6} * * * * *`, // every 10 second in every minute
        () => {
          console.log(`hi from cron job. Current time: `, new Date().toISOString());
          console.log('data: ', statsData);

        });
    }
  } catch (error) {
    console.log('error:', error);
  };

};

exports.getStatisticFromDB = () => {
  let i = 0;
  while (++i < 12) {
    cron.schedule(`${i * 5} * * * *`, // every second 5 minute (5, 10, 15) in every hour
      async () => {
        let statsData = await db.fetchStatsData();
        db.writeJsonDataToFile(statsData);
        console.log(
          chalk.yellow(`[Cron Job: getStatisticFromDB@${currentTime}]`),
          `\n updated statistic dataObj: \n`,
          dataAsObj);
      }
    );
  }

};

