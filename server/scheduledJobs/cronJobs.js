
const cronJobs = require('./cronSchedule');

const jobs = function () {
  // cronJobs.logOnEvery30Second();
  cronJobs.getStatisticFromDB();
};

module.exports = jobs;