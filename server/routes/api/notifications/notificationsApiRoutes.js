const express = require('express');
const router = express.Router();
const controller = require('./notificationsApiControllers');

// URI Path: host/api/notifications

router.get("/", controller.getNotifications);

// URI Path: host/api/notifications/unread
router.get("/unread", controller.getUnreadNotifications);

router.get("/latest", controller.getLatestNotification);

router.put("/markAllAsOpened", controller.markAllAsOpened);

router.put("/:id/markAsRead", controller.markNotificationAsRead);

module.exports = router;