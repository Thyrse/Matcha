const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/pictures');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.fieldname);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');
const fs = require('fs');
const connection = require('../config/database.js');
var status = "";


router.get('/', function(req, res) { 
    if (!req.session.username)
    {
      res.redirect('/');
    }
    else {
        status = "";
        var data = {
			  photos: [],
			  notifications: []
        };
        connection.query('SELECT * FROM image WHERE user_id = ?',[req.session.username], function (err, photos) {
			if (err)
                throw err;
			connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
              if (err)
                  throw err;
			  data.photos = photos;
			  data.notifications = notifs;
              res.render('pictures', { data: data, nickname: req.session.username, firstname: req.session.firstname, userid: req.session.userid });
			});
		});
    }
});

router.post('/delete', urlencodedParser, function(req, res) {
	status = "";
	if (!req.session.username)
		res.redirect('/');
	else 
	{
		var image_name = (req.body.main_image);
		var main_check = null;
		connection.query('SELECT main_image FROM image WHERE user_id = ? AND image_name = ?', [req.session.username, image_name], function(err,records){
			main_check = records[0].main_image;
			connection.query('DELETE FROM image WHERE user_id = ? AND image_name = ?', [req.session.username, image_name], function(err,result){
				if(err) {
 					console.log(err);
 				}
 				else {
					if (main_check == 1)
					{
						connection.query('UPDATE image SET main_image=1 WHERE user_id = ? LIMIT 1', [req.session.username], function(err,result){
							if(err)
								throw(err);
							else
							{
								fs.unlink('./public/pictures/' + image_name, (err) => {
									if (err)
										console.log('Error while deleting the file: ' + image_name);
								  });
								res.redirect('/settings/pictures')
							}
						});
					}
					else
					{
 						if (result.affectedRows == 0)
 							console.log('suppress_photo: The picture does not exist in database');
 						fs.unlink('./public/pictures/' + image_name, (err) => {
						  if (err)
						  	console.log('Error while deleting the file: ' + image_name);
						});
						res.redirect('/settings/pictures')
					}
				}
			});
		});
	}
});

router.post('/', urlencodedParser, function(req,res){
    upload(req,res,function(err) {
		if (err)
			console.log(err);
		if (!req.file) {
				status = "A picture must be provided.";
				res.redirect('/settings/pictures');
				return;
		}
		var record = {
			user_id: req.session.username,
			image_name: req.file.filename
		};
		var main_exists = null;
		connection.query('SELECT main_image FROM image WHERE user_id = ?', [req.session.username], function(err,used){
			main_exists = used[0];
			connection.query('INSERT INTO image SET ?', record, function(err,result){
 				if(err) {
 					status = 'Unable to create this picture on base.';
					res.redirect('/settings/pictures'); 
				 }
				if(!main_exists) {
					connection.query('UPDATE image,users SET image.main_image=1, users.complete_image=1 WHERE image.user_id=? AND users.username=?', [req.session.username,req.session.username], function(err,result) {
						if(err)
							throw(err);
					});
					req.session.image = 1;
					res.redirect('/settings/pictures'); // on va vers l'index
				}
 				else {
					status = 'Picture created on base.';
					req.session.image = 1;
					res.redirect('/settings/pictures'); // on va vers l'index
				}
			});
		});
	});
});

router.post('/star', urlencodedParser, function(req, res) {
	status = "";
	if (typeof(req.body) == 'undefined')
	{
		return res.sendStatus(400);
	}
	if (!req.session.username)
		return res.redirect('/');
	else 
	{
		var image_star = null;
		if (req.body.main_image) {
				image_star = ent.encode(req.body.main_image);
		}
		connection.query('UPDATE image SET main_image=0 WHERE user_id = ?', [req.session.username], function(err,result){
			if(err)
				throw(err)
			connection.query('UPDATE image SET main_image=1 WHERE image_name= ? AND user_id = ?', [image_star, req.session.username], function(err,result){
				if(err) {
 					status = 'settings: Problem while changing main image.';
					res.redirect('back');
 				}
 				else {
					res.redirect('back'); 
				}
			});
		});
	}
});

module.exports = router;