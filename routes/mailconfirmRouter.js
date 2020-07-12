const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
var status = "";

const connection = require('../config/database.js');



router.get('/', function(req, res) {
    if (req.session.username) // deja authentifie : on va a l'index
    {
        res.redirect('/');
    }
	else
    {
        if (req.query.token)
        {
            connection.query('SELECT id FROM users WHERE token = ?', req.query.token, function(err,records){
                if (err) {
                    status = "An error as occured, please try again."
                    res.render('mailconfirm', { activation: status });
                }
                else if(records.length > 0) {
                    connection.query('UPDATE users SET valid=1,token=NULL WHERE token = ?', req.query.token, function(err,tokupdate){
                        if(tokupdate.affectedRows)
                        {
                            connection.query('INSERT INTO tags SET user_id = ?', records[0].id, function(err,settags){
                                if(err) {
                                    status = "An error as occured, please try again."
                                    res.render('mailconfirm', { activation: status });
                                }
                                else {
                                    status = "Your mail has been activated."
                                    res.render('mailconfirm', { activation: status });
                                }
                            });
                        }
				         else {
				        	status = "An error as occured, please try again."
				        	res.render('mailconfirm', { activation: status });
				        }
                    });
                }
                else {
                    status = "An error as occured, please try again."
                    res.render('mailconfirm', { activation: status });
                }
			});
        }
		else
		{
            res.redirect('/');
        }
    }
});


module.exports = router;