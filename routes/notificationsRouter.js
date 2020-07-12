const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const connection = require('../config/database.js');


router.get('/', function(req, res) {
    if (!req.session.username)
        res.redirect('/');
    else if (req.session.complete == 0 || req.session.image == 0)
    {
        res.redirect('/settings');
    }
    else
    {
        var data = {
            notifications: [],
            notif: []
        }
        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            connection.query('SELECT * FROM notifications WHERE user_id= ?', req.session.userid, function(err,notification){
                if(err)
                    throw(err)
                else
                {
                    data.notifications = notifs;
                    data.notif = notification;
                    res.render('notifications.ejs', {data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid});
                }
            });
        });
	}
});

router.post('/', urlencodedParser, function(req, res) {
    if (!req.session.username)
        res.redirect('/');
    else
    {
        connection.query('UPDATE notifications SET watched=1 WHERE user_id=?', req.session.userid, function(err,records){
            if(err)
                throw(err)
            else
            {
                res.redirect('back');
            }
        });
	}
});

module.exports = router;