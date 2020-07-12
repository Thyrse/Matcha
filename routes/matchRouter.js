const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { connected } = require('../public/js/users');

const connection = require('../config/database.js');


function deg2rad (deg) {
    return deg * (Math.PI/180)
}

function getDistance(lat1, lon1, lat2, lon2) {
    var radius = 6371;

    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = radius * c;
    return Math.ceil(d)
}

router.get('/', function(req, res) {
    if (!req.session.username)
        res.redirect('/');
    else if (req.session.complete == 0 || req.session.image == 0)
    {
        res.redirect('/settings');
    }
    else
    {
        data = {
            record: [],
            pictures: [],
            notifications: [],
            distance: null
         };
        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            if(err)
                throw(err)
            data.notifications = notifs;
            connection.query('SELECT m.id_match,m.user_1,m.user_2,u.id,u.username,u.first_name,u.birthday,u.longitude,u.latitude,u.last_login,u.bio,i.image_name FROM matchs m INNER JOIN users u ON m.user_1 = u.id AND u.id != ? OR m.user_2 = u.id AND u.id != ? INNER JOIN image i ON u.username = i.user_id WHERE (user_1=? OR user_2=?) AND i.main_image = 1', [req.session.userid, req.session.userid, req.session.userid, req.session.userid], async function(err,records){
                if(err)
                    throw(err)
                if(records.length > 0)
                {
                    data.record = records;
                    data.notifications = notifs;
                    let con_status = await connected(records[0].id)
                    data.distance = getDistance(req.session.latitude, req.session.longitude, records[0].latitude, records[0].longitude)
                    res.render('match.ejs', {data: data, nickname: req.session.username, firstname: req.session.firstname, connected: con_status, userid: req.session.userid});
                }
                else {
                    res.render('match.ejs', {nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid, data: data});
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
        if (!req.body.match_id)
        {
            res.redirect('/matchs');
        }
        var type = req.session.firstname +  " does not match with you anymore."
        connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
            connection.query('DELETE FROM matchs WHERE id_match=? AND user_1=? OR user_2=?', [req.body.match_id, req.session.userid, req.session.userid], function(err,records){
                if(err)
                    throw(err)
                else
                {
                    res.redirect('back');
                }
            });
        });
	}
});

module.exports = router;