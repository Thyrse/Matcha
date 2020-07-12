const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
// var db = require('../database.js');
var status = "";

const bcrypt = require('bcrypt');
const connection = require('../config/database.js');
const seed = require('../config/seed.js');

const axios = require('axios');

const compatibility = require('../models/compatibility.js')

router.get('/', function(req, res) {
	if (req.session.username)
		res.redirect('/');
	else
	{
		res.render('login')
	}

});


router.post('/', urlencodedParser, function(req, res) { 
	if (typeof(req.body) == 'undefined')
	{
		return res.sendStatus(400);
	}
	else 
	{
		if (!req.body.username || !req.body.password)
		{
			status = 'Error! Each field must be fueled!';
			res.render('login');
			return; 
		}
		
		connection.query('SELECT password FROM users WHERE username = ?', ent.encode(req.body.username).toLowerCase(), async function(err, records){
				if(records.length > 0 && bcrypt.compareSync(req.body.password, records[0].password)) 
				{
					await seed.generateRandomUsers();
					connection.query('SELECT * FROM users WHERE username = ?', ent.encode(req.body.username), async function(err, records){
 						if(err) {
 							status = "Error while accessing database";
							res.render('login', { status: status }); 
 						}
						else if (records.length == 0){
							status = 'No user is matching with the informations provided';
							res.render('login', { status: status }); 
						}
						else if (records[0].valid == 0)
						{
							status = 'You must validate your account to access site. Please check your mail.';
							res.render('login', { status: status });
							return;
						}
 						else {
							connection.query('UPDATE users SET last_login = current_timestamp() WHERE username= ?', ent.encode(req.body.username), async function(err, lastlog){
								if(err) {
									status = "Error while accessing database";
								   res.render('login', { status: status }); 
								}
								else {
									let locationapi = await axios.get('https://ipapi.co/json')
									req.session.latitude = locationapi.data.latitude;
									req.session.longitude = locationapi.data.longitude;
									req.session.username = ent.encode(req.body.username);
									req.session.userid = records[0].id
									req.session.complete = records[0].complete
									req.session.image = records[0].complete_image
									req.session.firstname = records[0].first_name
									await res.redirect('/'); // on va vers l'index
								}
							});
						}
					});
				}
				else
					res.render('login', { status: "No user is matching with the informations provided."});
		});
	}
});


module.exports = router;