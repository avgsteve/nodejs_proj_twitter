const CustomError = require('../../errorHandlers/customError');
const Notification = require('../../../database/schemas/NotificationSchema');
const populateUserOption = "_id userName firstName lastName profilePic";

// path: GET@host/api/notifications/
exports.getNotifications = async (req, res, next) => {

  let optionsToFind = {
    userTo: res.locals.user._id,
    notificationType: {
      $ne: "newMessage" // search all notifications except for "newMessage"
    }
  };

  if (
    req.query.unreadOnly !== undefined &&
    req.query.unreadOnly === "true") {
    // show only unread notifications
    optionsToFind.opened = false;
  }

  Notification.find(optionsToFind)
    .populate("userTo", populateUserOption)
    .populate("userFrom", populateUserOption)
    .sort({ createdAt: -1 }) // show latest first
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });

};

// path: GET@host/api/notifications/unread
exports.getUnreadNotifications = (req, res, next) => {
  let userId = res.locals.user._id;

  if (req.query.getOnlyCounts === 'true') {
    return Notification.countDocuments({
      userTo: userId,
      opened: false,
      notificationType: {
        $ne: "newMessage"
      }
    }).then(result => {
      // console.log('unread counts:', result);
      res.status(200).send(result.toString());
    }).catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
  }


  let populateOption = '_id userName firstName lastName profilePic';

  Notification.find({
    userTo: userId,
    opened: false,
    notificationType: {
      $ne: "newMessage",
      opened: false
    }
  })
    .populate("userTo", populateOption)
    .populate("userFrom", populateOption)
    .sort({ createdAt: -1 }) // show latest first
    .then(result => res.status(200).send(result))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });

};

// path: GET@host/api/notifications/latest
// function: fetched by front-end to display popup notification
exports.getLatestNotification = async (req, res, next) => {

  Notification.findOne(
    {
      userTo: res.locals.user._id,
    }
  )
    .sort({ createdAt: -1 })
    .limit(1) // show one as only need to latest
    .populate("userTo", populateUserOption)
    .populate("userFrom", populateUserOption)
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });

};

// path: PUT@host/api/notifications//markAllAsOpened
exports.markAllAsOpened = async (req, res, next) => {

  // console.log('使用者進入 PUT@host/api/notifications//markAllAsOpened');

  Notification.updateMany(
    { userTo: res.locals.user._id },
    { opened: true }
  )
    .then(() => res.sendStatus(204))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });

};


// path: PUT@host/api/notifications/:id/markAsRead
exports.markNotificationAsRead = async (req, res, next) => {


  Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userTo: res.locals.user._id,
    }, {
    opened: true
  }
  )
    .then(
      (result) => {
        res.sendStatus(204);
      })
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });

};
