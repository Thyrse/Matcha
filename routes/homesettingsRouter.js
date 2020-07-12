const express = require('express');
const router = express.Router();
const axios = require('axios');
const connection = require('../config/database.js');
const compatibility = require('../models/compatibility.js')



router.get('/', function(req, res) { 
  if (!req.session.username)
  {
    res.redirect('/');
  }
  else {
    data = {
      notifications: []
    }
      connection.query('SELECT * FROM notifications WHERE user_id= ? AND watched=0', req.session.userid, function(err,notifs){
        if(err)
          throw(err)
        else
        {
          data.notifications = notifs;
          res.render('homesettings', {complete: req.session.complete, image: req.session.image, nickname: req.session.username, userid: req.session.userid, firstname: req.session.firstname, data: data});
        }
      });
  }
});

router.post('/', async function(req, res) { 
	if (!req.session.username)
    return res.redirect('/');
    
    let locationapi = await axios.get('https://ipapi.co/json')
    req.session.latitude = locationapi.data.latitude;
    req.session.longitude = locationapi.data.longitude;
		const record = {
			latitude: locationapi.data.latitude,
			longitude: locationapi.data.longitude
		};
		connection.query('UPDATE users SET ? WHERE id=?', [record, req.session.userid], function(err,result){
      if(err) {
        status = "Unable to update user.";
        console.log(err);
      }
      else {
        compatibility.updateCompatibilities(req.session.userid)
        res.redirect('back')
     }
   });
});

module.exports = router;