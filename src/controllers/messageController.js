const messageService = require('../services/messageService');

async function sendMessage(req, res, next) {
  try {
    const message = await messageService.sendMessage(req.params.id, req.user, req.body.content);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

async function listMessages(req, res, next) {
  try {
    const messages = await messageService.listMessages(req.params.id, req.user);
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, listMessages };
