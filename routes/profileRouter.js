const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
// var action = require('../models/compatibility.js');
const { connected } = require('../public/js/users');

const connection = require('../config/database.js');
const comp = require('../models/compatibility.js');


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
        if (req.query.user)
        {
            if(req.query.user.toLowerCase() == req.session.username.toLowerCase())
            {
                res.redirect('/settings');
            }
            else {
			    data = {
                    record: [],
                    picture: [],
                    likes: [],
                    unlikes: [],
                    matches: [],
                    notifications: [],
                    tags: [],
                    distance: null
			     };
			    connection.query('SELECT id,username,first_name,last_name,gender_id,orientation_id,last_login,popularity,bio,birthday,latitude,longitude,complete,complete_image FROM users WHERE username= ?', req.query.user, function(err,records){
			    	if(err)
                        throw(err)
                    else if (records.length > 0)
                    {
                        if (records[0].complete == 0 || records[0].complete_image == 0)
                        {
                            res.redirect('/');
                            return;
                        }
                    }
                    else
                    {
                        res.redirect('/');
                        return;
                    }
                    connection.query('SELECT * FROM tags WHERE user_id= ?', records[0].id, function(err,tags){
                        if(err)
                            throw(err)
                        connection.query('SELECT image_name FROM image WHERE user_id= ?', req.query.user, function(err,pictures){
                            if(err)
                                throw(err)
                            connection.query('SELECT user_liked FROM likes WHERE user_liked= ? AND user_emit= ?', [req.session.userid, records[0].id], function(err,liked){
                                if(err)
                                    throw(err)
                                connection.query('SELECT user_liked FROM likes WHERE user_liked= ? AND user_emit= ?', [records[0].id, req.session.userid], function(err,unlike){
                                    if(err)
                                        throw(err)
                                    connection.query('SELECT * FROM matchs WHERE user_1= ? AND user_2= ? OR user_1= ? AND user_2= ?', [records[0].id, req.session.userid, req.session.userid, records[0].id], function(err,matched){
                                        if(err)
                                            throw(err)
                                        connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, async function(err,notifs){
                                            if(err)
                                                throw(err)
                                            else {
                                                data.record = records;
                                                data.tags = tags;
                                                data.picture = pictures;
                                                data.likes = liked;
                                                data.unlikes = unlike;
                                                data.matches = matched;
                                                data.notifications = notifs;
                                                let con_status = await connected(records[0].id)
                                                data.distance = getDistance(req.session.latitude, req.session.longitude, records[0].latitude, records[0].longitude)
                                                res.render('profile.ejs', { nickname: req.session.username, userid: req.session.userid, firstname: req.session.firstname, latitude: req.session.latitude, longitude: req.session.longitude, connected: con_status, data: data });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }
		else
		{
			res.redirect('/');
		}
	}
});



router.post('/', urlencodedParser, function(req, res) {
    if (!req.session.username)
        res.redirect('/');
    else
    {
        if(req.query.action == "like")
        {
            const record = {
                user_liked: req.body.profile_id,
                user_emit: req.session.userid
            };
            const popularity = (parseInt(req.body.popularity) < 100) ? (parseInt(req.body.popularity) + 1) : 100;
            var type = req.session.firstname +  " liked you."
            connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
                connection.query('INSERT INTO likes SET ?', record, function(err,result){
                    connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                        if(err)
                            throw(err)
                            else {
                            res.redirect('back')
                        }
                    })
                })
            })   
        }
        else if(req.query.action == "pass")
        {
            const record = {
                user_noped: req.body.profile_id,
                user_emit: req.session.userid
            };
            connection.query('INSERT INTO nopes SET ?', record, function(err,result){
                connection.query('UPDATE compatibility SET viewable = 0 where user_id = ? AND target_id = ?',[req.session.userid, req.body.profile_id], function(err) {
                    if(err)
                        throw(err)
                    else {
                        res.redirect('back')
                    }
                })
            })
        }
        else if(req.query.action == "match")
        {
            const record = {
                user_1: req.body.profile_id,
                user_2: req.session.userid
            };
            var type = req.session.firstname +  " matched with you."
            const popularity = (parseInt(req.body.popularity) < 100) ? (parseInt(req.body.popularity) + 1) : 100;
            connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
                connection.query('INSERT INTO matchs SET ?', record, function(err,result){
                    connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                        if(err)
                            throw(err)
                            else {
                            res.redirect('back')
                        }
                    })
                })
            })
        }
        else if(req.query.action == "block")
        {
            const record = {
                user_blocked: req.body.profile_id,
                user_emit: req.session.userid
            };
            const popularity = (req.body.popularity > 10) ? (req.body.popularity - 10) : 0;
            connection.query('SELECT * FROM block WHERE user_blocked = ? AND user_emit = ?', [record['user_blocked'], record['user_emit']], function(err,alreadyblocked){
                if(err)
                    return res.redirect('/settings')
                else if(alreadyblocked.length > 0) {
                    res.redirect('back')
                }
                else {
                    connection.query('INSERT INTO block SET ?', record, function(err,result){
                        connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                            connection.query('UPDATE compatibility SET viewable = 0 where user_id = ? AND target_id = ?',[req.session.userid,req.body.profile_id,], function(err) {
                                if(err)
                                    return res.redirect('/settings')
                                else {
                                    res.redirect('back')
                                }
                            })
                        })
                    })
                }
            })
        }
        else if(req.query.action == "report")
        {
            const record = {
                user_reported: req.body.profile_id,
                user_emit: req.session.userid
            };
            const popularity = (req.body.popularity > 10) ? (req.body.popularity - 10) : 0;
            connection.query('INSERT INTO reported SET ?', record, function(err,result){
                connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                    connection.query('UPDATE compatibility SET viewable = 0 where user_id = ? AND target_id = ?',[req.session.userid,req.body.profile_id,], function(err) {
                        if(err)
                            throw(err)
                        else {
                            res.redirect('back')
                        }
                    })
                })
            })
        }
        else if(req.query.action == "unlike")
        {
            const popularity = (req.body.popularity > 0) ? (req.body.popularity - 1) : 0;
            connection.query('DELETE FROM likes WHERE user_emit= ? AND user_liked= ?', [req.session.userid, req.body.profile_id], function(err,result){
                connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                    connection.query('UPDATE compatibility SET show = 0 where user_id = ? AND target_id = ?',[req.session.userid, req.body.profile_id], function(err) {
                        connection.query('UPDATE compatibility SET viewable = 0 where user_id = ? AND target_id = ?',[req.session.userid, req.body.profile_id], function(err) {
                            if(err)
                                throw(err)
                            else {
                                res.redirect('back')
                            }
                        })
                    })
                })
            })
        }
        else if(req.query.action == "unmatch")
        {
            var type = req.session.firstname +  " does not match with you anymore."
            const popularity = (req.body.popularity > 0) ? (req.body.popularity - 1) : 0;
            connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
                connection.query('DELETE FROM matchs WHERE id_match= ? AND user_1= ? OR id_match= ? AND user_2= ?', [req.body.match_id, req.session.userid, req.body.match_id, req.session.userid], function(err,result){
                    connection.query('UPDATE users SET popularity = ? WHERE id = ?', [popularity, req.body.profile_id], function(err) {
                        connection.query('UPDATE compatibility SET viewable = 0 where user_id = ? AND target_id = ?',[req.session.userid, req.body.profile_id], function(err) {
                            if(err)
                                throw(err)
                            else {
                                res.redirect('back')
                            }
                        })
                    })
                })
            })
        }
	}
});

module.exports = router;