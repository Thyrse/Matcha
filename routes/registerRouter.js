const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mailjet = require ('node-mailjet')
.connect('e86f2deeadfaf763c9fd03475854feae', '97f9c68789a9288225b998b13d25140d')
const { v1: uuidv1 } = require('uuid');
const axios = require('axios');
const connection = require('../config/database.js');



router.get('/', function(req, res) {
	if (req.session.username) // deja authentifie : on va a l'index
		res.redirect('/');
	else
		res.render('register')
});

// router.post('/', function(req, res) { 
// 	res.render('login')
// });

router.post('/', urlencodedParser, async function(req, res) { // TODO : verifier si next est necessaire ici
	session = req.session;
	if (typeof(req.body) == 'undefined')
	{
		return res.sendStatus(400);
	}
	else 
	{
		if (!req.body.username || !req.body.email || !req.body.first_name || !req.body.last_name || !req.body.password || 
			!req.body.passwordbis)
		{
			// afficher une erreur et attendre une nouvelle saisie
			status = 'Error! Each field must be fueled!';
			res.render('register', { registration: status});
			return;
		}
        // verifier le format du login 
        if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,15}$/)) {
			status="Username must contain between 3 and 8 alphanuméric characters";
			res.render('register', { registration: status});
			return;
        }
        
        // verifier le format de l'email
        if (!req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            status="Email template incorrect";
			res.render('register', { registration: status});
			return;
        }
        
        // verifier le format du mot de passe 
        if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
            status="Password must contain at least 4 char including 1 number, caps and low key";
			res.render('register', { registration: status});
			return;
        }

        // verifier le format du prénom 
        if (!req.body.first_name.match(/^[a-zA-Z0-9\-_\.]{2,255}$/)) {
            status="Firstname must contain at least 2 alphanuméric characters)";
			res.render('register', { registration: status});
			return;
        }
		
	    // verifier le format du nom 
        if (!req.body.last_name.match(/^[a-zA-Z0-9\-_\.]{2,255}$/)) {
            status="Firstname must contain at least 2 alphanuméric characters)";
			res.render('register', { registration: status});
			return;
        }	
        
		// verifier que les deux mdp saisis sont identiques
		if (req.body.password !== req.body.passwordbis)
		{
			// afficher une erreur et attendre une nouvelle saisie
			status = "Error! Passwords are supposed to match.";
			res.render('register', { registration: status});
			return;
		}

		let locationapi = await axios.get('https://ipapi.co/json')
		var hashed = bcrypt.hashSync(req.body.password, saltRounds);
		var token_hash = uuidv1();
		const record = {
			username: ent.encode(req.body.username).toLowerCase(),
			first_name: ent.encode(req.body.first_name),
			last_name: ent.encode(req.body.last_name),
			email: ent.encode(req.body.email),
			orientation_id: 3,
			password: hashed,
			token: token_hash,
			latitude: locationapi.data.latitude,
			longitude: locationapi.data.longitude
		};
		connection.query('SELECT username,email FROM users WHERE username= ? OR email= ?', [record.username, record.email], function(err,exist){
			if(exist.length > 0) {
				status = "Unable to create new user. Please try with another credentials."
				res.render('register', { registration: status });
			}
			else {
				connection.query('INSERT INTO users SET ?', record, function(err,result){
 					if(err) {
 						status = "Unable to create user.";
 						console.log(err);
 					}
 					else {
						const request = mailjet
						.post("send", {'version': 'v3.1'})
						.request({
						  "Messages":[
							{
							  "From": {
								"Email": "tefourge@student.42.fr",
								"Name": "Thyrse & Guena"
							  },
							  "To": [
								{
								  "Email": req.body.email,
								  "Name": req.body.username
								}
							  ],
							  "Subject": "Activate your account",
							  "TextPart": "Account activation.",
							  "HTMLPart": "<h3>Hello, welcome to matcha! Please click the link below to confirm you registration.</h3><br />" + "<a href=\"http://localhost:3000/mailconfirm?token=" + token_hash + "\">Account activation</a>",
							  "CustomID": "AppGettingStartedTest"
							}
						  ]
						})
						request
						  .then((result) => {
							console.log(result.body)
						  })
						  .catch((err) => {
							console.log(err.statusCode)
						  })
						  status = "You must validate your account. Please check your inbox."
						  res.render('register', { registration: status });
					}
				})
			}
		});
	}
});


module.exports = router;