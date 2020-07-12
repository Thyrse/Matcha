const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');

const connection = require('../config/database.js');
const compatibility = require('../models/compatibility.js')

var data = {};


router.get('/', async function(req, res) {
    if (!req.session.username)
    {
        res.render('welcome');
    }
    else if (req.session.complete == 0 || req.session.image == 0)
    {
        res.redirect('/settings');
    }
    else {
        status = "";
          data = {
              record: [],
              notifications: []
            };
        compatibility.updateCompatibilities(req.session.userid)
        await new Promise(resolve => setTimeout(resolve, 500))
        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            if(err)
                throw(err)
            connection.query('SELECT c.distance, c.interests, u.id, u.username, u.first_name, u.popularity, u.birthday, t.* , i.image_name FROM users u JOIN compatibility c ON u.id = c.target_id JOIN tags t ON u.id = t.user_id JOIN image i ON u.username = i.user_id WHERE u.complete = 1 AND u.complete_image = 1 AND c.user_id = ? AND c.attraction = 1 AND c.viewable = 1 AND i.main_image = 1 ORDER BY c.distance ASC, c.interests DESC, u.popularity DESC LIMIT 10', req.session.userid,
            async function(err, records){
                    if(err) { // cas d'erreur 
                        status = "Error while accessing database.";
                        data.notifications = notifs;
                        await res.render('index', { data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid }); 
                    }
                    else {
                        data.record = records;
                        data.notifications = notifs;
                        req.session.record = data.record;
                        await res.render('index', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
                }
            });
        });
    }
})


router.get('/sort', function(req, res) {
    status = "";
    data = {
        record: [],
        notifications: []
    };
    data.record = req.session.record;
    if(req.query.key == 'age' && req.query.ord == 'up')
        data.record.sort(function(a,b) { return a.birthday - b.birthday})
    else if(req.query.key == 'age' && req.query.ord == 'down')
        data.record.sort(function(a,b) { return b.birthday - a.birthday })
    else if(req.query.key == 'dist' && req.query.ord == 'up')
        data.record.sort(function(a,b) { return a.distance - b.distance })
    else if(req.query.key == 'dist' && req.query.ord == 'down')
        data.record.sort(function(a,b) { return b.distance - a.distance })
    else if(req.query.key == 'pop' && req.query.ord == 'up')
        data.record.sort(function(a,b) { return a.popularity - b.popularity })
    else if(req.query.key == 'pop' && req.query.ord == 'down')
        data.record.sort(function(a,b) { return b.popularity - a.popularity })
    else if(req.query.key == 'int' && req.query.ord == 'up')
        data.record.sort(function(a,b) { return a.interests - b.interests })
    else if(req.query.key == 'int' && req.query.ord == 'down')
        data.record.sort(function(a,b) { return b.interests - a.interests })
    else
    {
        res.redirect('/')
        return;
    }
    connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
        if(err)
            throw(err)
        else {
            data.notifications = notifs;
            res.render('index', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
        }
    });
})

router.get('/filter', function(req,res) {
    status = "";
    data = {
        record: [],
        notifications: []
    };
    const ageMin = req.query.age_min ? req.query.age_min : 18
    const ageMax = req.query.age_max ? req.query.age_max : 80
    const popMin = req.query.pop_min ? req.query.pop_min : 0
    const popMax = req.query.pop_max ? req.query.pop_max : 100
    const dist = req.query.dist ? req.query.dist : 500
    const veg = req.query.vegan ? 1 : 0
    const fit = req.query.fitness ? 1 : 0
    const net = req.query.netflix ? 1 : 0
    const par = req.query.party ? 1 : 0
    const nat = req.query.nature ? 1 : 0
    
    data.record = req.session.record
                    .filter(function (e) {return e.birthday >= ageMin;})
                    .filter(function (e) {return e.birthday <= ageMax;})
                    .filter(function (e) {return e.popularity >= popMin;})
                    .filter(function (e) {return e.popularity <= popMax;})
                    .filter(function (e) {return e.distance <= dist;})
                    .filter(function (e) {return e.vegan >= veg;})
                    .filter(function (e) {return e.fitness >= fit;})
                    .filter(function (e) {return e.netflix >= net;})
                    .filter(function (e) {return e.party >= par;})
                    .filter(function (e) {return e.nature >= nat;});
    connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
        if(err)
            throw(err)
        else {
            data.notifications = notifs;
            res.render('index', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
        }
    });


})
router.post('/profile_user', urlencodedParser, function(req, res) {
    if (!req.session.username)
        res.redirect('/');
    if (!req.body.profile_link || !req.body.profile_id)
    {
        res.redirect('/');
    }
    else {
        var link = req.body.profile_link
        var type = req.session.firstname + " saw your profile.";
        connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
            if(err)
                throw(err)
            else {
                res.redirect(link)
            }
        });

    }
});


module.exports = router;