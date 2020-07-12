const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');


const connection = require('../config/database.js');

var data = {};
var status = "";

/* Display chat page */
router.get('/', function(req, res) {
    if (!req.session.username)
		res.redirect('/');
	else if (req.session.complete == 0 || req.session.image == 0)
	{
		res.redirect('/settings');
	}
    else
    {
        if (req.query.room)
        {
			data = {
				record: [],
				firstnames: [],
				notifications: []
			 };
			connection.query('SELECT * FROM matchs WHERE id_match= ?', req.query.room, function(err,owners){
				if(!owners[0] || (owners[0].user_1 !== req.session.userid && owners[0].user_2 !== req.session.userid))
				{
					res.redirect('/');
				}
				else
				{
					connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
						if(err)
							throw(err)
						connection.query('SELECT id,first_name,username FROM users WHERE id=? OR id=?', [owners[0].user_1, owners[0].user_2], function(err,firstname){
							if(err)
								throw(err)
							connection.query('SELECT message, user_id FROM chat_msg WHERE id_room = ?', req.query.room, function(err,records){
								if(err)
								{
									console.log(err)
								}
								 else {
									data.record = records;
									data.firstnames = firstname;
									data.notifications = notifs;
									res.render('chat.ejs', { nickname: req.session.username, userid: req.session.userid, room: req.query.room, firstname: req.session.firstname, data: data });
								}
							});
						});
					});
				}
			});
        }
		else
		{
			res.redirect('/');
		}
	}
});

router.post('/newmessage', urlencodedParser, function(req, res) { // TODO : verifier si next est necessaire ici
	if (typeof(req.body) == 'undefined')
		return res.sendStatus(400);
	if (!req.session.username) // you are no one, go to index and authenticate
		return res.redirect('/');
	else 
	{
		if (!req.body.message)
		{
			console.log('Error! Message cannot be empty!');
			return;
		}
		// verifier le format du message 
		if (!req.body.message.match(/^[a-zA-Z0-9\-_\.\?\!\, ]{1,499}$/)) {
			status="Message must contain only aphanumérique caractères.";
			return;
		}
        const record = {
            id_room: req.body.roomie,
			message: ent.encode(req.body.message).trim(),
			user_id: req.session.userid
		};
		connection.query('SELECT * FROM matchs WHERE id_match= ?', req.body.roomie, function(err,owners){
			if(!owners[0] || (owners[0].user_1 !== req.session.userid && owners[0].user_2 !== req.session.userid))
			{
				return res.redirect('/matchs');
			}
			else {
				var type = req.session.firstname +  " sent you a message."
				connection.query('INSERT INTO notifications SET type=?,user_id=?', [type, req.body.profile_id], function(err,notification){
					connection.query('INSERT INTO chat_msg SET ?', record, function(err,result){
						if(err)
							throw(err)
 						else {
							status = 'Ok';
							return res.send(status); 
						}
					});
				});
			}
		});
	}
});


module.exports = router;
