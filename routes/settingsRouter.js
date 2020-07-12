const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
const connection = require('../config/database.js');
const compatibility = require('../models/compatibility.js')


var status = "";
var data = {};


router.get('/', function(req, res) { 
  if (!req.session.username)
  {
    res.redirect('/');
  }

	else {
      status = "";
		data = {
			record: [],
			genders : [],
			orientations : [],
			tags: [],
			notifications: []
		  };
		connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
			if(err)
				throw(err)
			connection.query('SELECT email, first_name, last_name, gender_id, orientation_id, bio, birthday FROM users WHERE username = ?', [req.session.username],
				function(err, records){
 					if(err) { // cas d'erreur 
 						status = "Error while accessing database.";
        	 			res.render('settings', { data: data }); 
 					}
					else if (records.length == 0) { // cas ou le select n'a rien renvoye
						status = 'No user match these informations.';
        	 			res.render('settings', { data: data }); 
					}
 					else {
	  					connection.query('SELECT id, description FROM gender', function (err, genders) {
        	    			if (err)
        	    			  throw err;
							connection.query('SELECT * FROM tags WHERE user_id= ?', [req.session.userid], function (err, tags) {
								if (err)
							  		throw err;
	  							connection.query('SELECT id, description FROM orientation', function (err, orientations) {
        	    					if (err)
										throw err;
        	    					data.record = records[0];
									data.genders = genders;
									data.tags = tags;
									data.orientations = orientations;
									data.notifications = notifs;
									res.render('settings', { data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid });
								});
							});
						});
					}
			});
		});
    }
});

router.post('/modify', urlencodedParser, function(req, res) { // TODO : verifier si next est necessaire ici
	status = "";
	if (typeof(req.body) == 'undefined')
	{
		return res.sendStatus(400);
	}
	if (!req.session.username) // pas authentifie : on va a l'index
		return res.redirect('/');
	else 
	{
		var record = {};
		var tagsupdate = {};

		if (req.body.vegan)
			tagsupdate['vegan'] = 1;
		else
			tagsupdate['vegan'] = 0;

		if (req.body.fitness)
			tagsupdate['fitness'] = 1;
		else
			tagsupdate['fitness'] = 0;

		if (req.body.netflix)
			tagsupdate['netflix'] = 1;
		else
			tagsupdate['netflix'] = 0;

		if (req.body.party)
			tagsupdate['party'] = 1;
		else
			tagsupdate['party'] = 0;

		if (req.body.nature)
			tagsupdate['nature'] = 1;
		else
			tagsupdate['nature'] = 0;

        // verifier le format de l'email
        if (req.body.email) {
			if (!req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            status="Mail format incorrect.";
            return res.redirect('/settings/profile');
			}
			else {
				record['email'] = ent.encode(req.body.email);
			}
		}

		if (req.body.first_name) {
			if (!req.body.first_name.match(/^[a-zA-Z0-9\-_\.]{2,255}$/)) {
				status = "Firstname schema incorrect.";
				return res.redirect('/settings/profile');
			}
			else
				record['first_name'] = ent.encode(req.body.first_name);
		}
		if (req.body.last_name) {
			if (!req.body.last_name.match(/^[a-zA-Z0-9\-_\.]{2,255}$/)) {
				status = "Lastname schema incorrect.";
				return res.redirect('/settings/profile');
			}
			else
				record['last_name'] = ent.encode(req.body.last_name);
		}
		if (req.body.birthday) {
			if (!req.body.birthday.match(/^(1[89]|[2-9][0-9])$/)) {
				status = "Age schema incorrect.";
				return res.redirect('/settings/profile');
			}
			else
			{
				record['birthday'] = ent.encode(req.body.birthday);
			}
		}
		if (req.body.bio) {
			if (!req.body.bio.match(/^[a-zA-Z0-9\-_\.\?\!\, ]{1,499}$/)) {
				status="Bio must contain only aphanumérique caractères.";
				return res.redirect('/settings/profile');
			}
			else
				record['bio'] = ent.encode(req.body.bio);
		}
		if (req.body.gender_id)
			record['gender_id'] = req.body.gender_id;
		if (req.body.orientation_id)
			record['orientation_id'] = req.body.orientation_id;
					// verifier le format du message 
		record['complete'] = 1;
		connection.query('UPDATE users SET ? WHERE ?', [record, {username: req.session.username}], function(err,result){
			if(err) {
 				status = 'Problem while accessing database. Please try again.';
				res.redirect('/settings/profile');
 			}
 			else {
				connection.query('INSERT INTO tags (user_id,vegan,fitness,netflix,party,nature) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ?', [req.session.userid, tagsupdate['vegan'],tagsupdate['fitness'],tagsupdate['netflix'],tagsupdate['party'],tagsupdate['nature'], tagsupdate], function(err,tagres){
					if(err)	{
						status = 'Problem while accessing database. Please try again.';
					   	res.redirect('/settings/profile');
					}
					else {
						compatibility.updateCompatibilities(req.session.userid)
						status = 'Your profile has been updated. Please wait while we are updating your preferences.';
						req.session.complete = 1;
						res.redirect('/settings/profile');
					}
				});
			}
		});
	}
});

router.post('/chgpwd', urlencodedParser, function(req, res) { // TODO : verifier si next est necessaire ici
	status = "";
	if (typeof(req.body) == 'undefined')
		return res.sendStatus(400);
	if (!req.session.username) // pas authentifie : on va a l'index
		return res.redirect('/');
	else 
	{
		if (!req.body.password || !req.body.passwordbis)
		{
			// afficher une erreur et attendre une nouvelle saisie
			status = 'Error! Each field must be fueled!';
			return res.redirect('back');
		}
		// verifier que les deux mdp saisis sont identiques
		if (req.body.password !== req.body.passwordbis)
		{
			// afficher une erreur et attendre une nouvelle saisie
			status = 'Erreur ! Mots de passe differents';
			return res.redirect('back'); // TBD : comment sortir en erreur proprement ?
		}
		// verifier le format du mot de passe 
		if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
			status="Password must contain at least 4 char including 1 number, caps and low key";
			return res.redirect('back');
		}
		var hashed = bcrypt.hashSync(req.body.password, saltRounds);
		connection.query('UPDATE users SET password= ? WHERE username = ?', [hashed, req.session.username], function(err,result){
			if(err)
				throw(err)
 			else {
				res.redirect('/settings/profile');
			}
		});
	}
});

router.post('/update_tags', urlencodedParser, function(req, res) {
	status = "";
	if (typeof(req.body) == 'undefined')
	{
		return res.sendStatus(400);
	}
	if (!req.session.username)
		return res.redirect('/');
	else 
	{
		var record = {};
		if (req.body.vegan)
			record['vegan'] = 1;
		else
			record['vegan'] = 0;

		if (req.body.fitness)
			record['fitness'] = 1;
		else
			record['fitness'] = 0;

		if (req.body.netflix)
			record['netflix'] = 1;
		else
			record['netflix'] = 0;

		if (req.body.party)
			record['party'] = 1;
		else
			record['party'] = 0;

		if (req.body.nature)
			record['nature'] = 1;
		else
			record['nature'] = 0;

		connection.query('INSERT INTO tags (user_id,vegan,fitness,netflix,party,nature) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ?', [req.session.userid, record['vegan'],record['fitness'],record['netflix'],record['party'],record['nature'], record], function(err,result){
			if(err) {
				status = 'An error as occured, please try again.';
				res.redirect('/settings/profile');
			}
			else {
				compatibility.updateCompatibilities(req.session.userid)
				status = 'Tags updates.';
				res.redirect('/settings/profile');
			}
		});
	}
});

module.exports = router;