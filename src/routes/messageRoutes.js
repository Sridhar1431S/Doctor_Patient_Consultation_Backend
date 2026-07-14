const express = require('express');
// mergeParams: true so req.params.id (the consultation id) is available
// even though this router is mounted separately in app.js.
const router = express.Router({ mergeParams: true });
const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, messageController.sendMessage);
router.get('/', authenticate, messageController.listMessages);

module.exports = router;
