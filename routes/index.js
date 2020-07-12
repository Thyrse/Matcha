const express = require('express');
const router = express.Router();
// const db = require('../config/database.js');

const indexRouter = require('./indexRouter');
const loginRouter = require('./loginRouter');
const registerRouter = require('./registerRouter');
const logoutRouter = require('./logoutRouter');
const homesettingsRouter = require('./homesettingsRouter');
const settingsRouter = require('./settingsRouter');
const picturesRouter = require('./picturesRouter');
const chatRouter = require('./chatRouter');
const matchRouter = require('./matchRouter');
const profileRouter = require('./profileRouter');
const mailconfirmRouter = require('./mailconfirmRouter');
const resetpwdRouter = require('./resetpwdRouter');
const resetRouter = require('./resetRouter');
const searchRouter = require('./searchRouter');
const notificationsRouter = require('./notificationsRouter');

router.use('/', indexRouter);
router.use('/login', loginRouter);
router.use('/register', registerRouter);
router.use('/logout', logoutRouter);
router.use('/settings', homesettingsRouter);
router.use('/settings/profile', settingsRouter);
router.use('/settings/pictures', picturesRouter);
router.use('/chat', chatRouter);
router.use('/matchs', matchRouter);
router.use('/profile', profileRouter);
router.use('/mailconfirm', mailconfirmRouter);
router.use('/resetpwd', resetpwdRouter);
router.use('/reset', resetRouter);
router.use('/search', searchRouter);
router.use('/notifications', notificationsRouter);




module.exports = router;