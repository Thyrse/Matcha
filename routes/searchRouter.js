const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const connection = require('../config/database.js');
var data = {};

const select = 'SELECT c.distance, u.id, u.username, u.first_name, u.popularity, u.birthday, t.* , i.image_name '
const from = 'FROM users u JOIN compatibility c ON u.id = c.target_id JOIN tags t ON u.id = t.user_id JOIN image i ON u.username = i.user_id '
const conditions = 'WHERE u.complete = 1 AND u.complete_image = 1 AND c.user_id = ? AND c.attraction = 1 AND c.viewable = 1 AND i.main_image = 1 '
const search = 'AND u.birthday BETWEEN ? AND ? AND u.popularity BETWEEN ? AND ? AND c.distance <= ? AND t.vegan >= ? AND t.fitness >= ? AND t.netflix >= ? AND t.party >= ? AND t.nature >= ?'

router.get('/', function(req, res) {
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
        data.record = req.session.record
	    connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            if(err)
                throw(err)
            else {
                data.notifications = notifs;
                res.render('search', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
            }
        });
    }
});


router.get('/sort', function(req, res) {
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
        if(!req.query || !req.query.key || !req.query.ord || !data.record)
            res.redirect('/')
        else if(req.query.key == 'age' && req.query.ord == 'up')
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
            res.redirect('/')
        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            if(err)
                throw(err)
            else {
                data.notifications = notifs;
                res.render('results', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
            }
        });
    }
});

router.get('/filter', function(req,res) {
    if (!req.session.username)
    {
        res.render('welcome');
    }
    else if (req.session.complete == 0 || req.session.image == 0)
    {
        res.redirect('/settings');
    }
    else if (!req.session.search)
    {
        res.redirect('/search');
    }
    else {
        status = "";
        data = {
            record: [],
            notifications: []
        };
        const ageMin = req.query.age_min >= req.session.search.ageMin ? req.query.age_min : req.session.search.ageMin
        const ageMax = req.query.age_max <= req.session.search.ageMax ? req.query.age_max : req.session.search.ageMax 
        const popMin = req.query.pop_min >= req.session.search.popMin ? req.query.pop_min : req.session.search.popMin
        const popMax = req.query.pop_max <= req.session.search.popMax ? req.query.pop_max : req.session.search.popMax
        const dist = req.query.dist <= req.session.search.dist ? req.query.dist : req.session.search.dist
        const veg = req.query.vegan ? 1 : req.session.search.veg
        const fit = req.query.fitness ? 1 : req.session.search.fit
        const net = req.query.netflix ? 1 : req.session.search.net
        const par = req.query.party ? 1 : req.session.search.par
        const nat = req.query.nature ? 1 : req.session.search.nat
        
        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
            if(err)
                throw(err)
            else {
                connection.query(select + from + conditions + search,[req.session.userid, ageMin, ageMax, popMin, popMax, dist, veg, fit, net, par, nat],function(err, records){
                    if(err) {
                        data.notifications = notifs;
                        res.render('search', { data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid }); 
                        return;
                    }
                    else {
                        data.record = records;
                        data.search = req.session.search;
                        data.notifications = notifs;
                        res.render('results', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
                    }
                })
            }
        });
    }
});

router.post('/', urlencodedParser, function(req, res) {
	status = "";
    data = {
        record: [],
        notifications: []
	};
	const ageMin = req.body.age_min ? req.body.age_min : 18
    const ageMax = req.body.age_max ? req.body.age_max : 80
    const popMin = req.body.pop_min ? req.body.pop_min : 0
    const popMax = req.body.pop_max ? req.body.pop_max : 100
    const dist = req.body.dist ? req.body.dist : 500
    const veg = req.body.vegan ? 1 : 0
    const fit = req.body.fitness ? 1 : 0
    const net = req.body.netflix ? 1 : 0
    const par = req.body.party ? 1 : 0
	const nat = req.body.nature ? 1 : 0
	
	

	connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
        if(err)
            throw(err)
        else {
		    connection.query(select + from + conditions + search,[req.session.userid, ageMin, ageMax, popMin, popMax, dist, veg, fit, net, par, nat],function(err, records){
		    	if(err) {
		    	    data.notifications = notifs;
                    res.render('search', { data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid }); 
                    return;
		        }
		        else {
                    data.record = records;
                    req.session.search = {
                        ageMin : ageMin,
                        ageMax : ageMax,
                        popMin : popMin,
                        popMax : popMax,
                        dist : dist,
                        veg : veg,
                        fit : fit,
                        net : net,
                        par : par,
                        nat : nat
                    }
                    data.search = req.session.search;
                    data.notifications = notifs;
		        	res.render('results', { data: data, nickname: req.session.username, longitude: req.session.longitude, firstname: req.session.firstname, userid: req.session.userid });
                }
            })
        }
	});
});

module.exports = router;