const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
var status = "";
const mailjet = require ('node-mailjet')
.connect('e86f2deeadfaf763c9fd03475854feae', '97f9c68789a9288225b998b13d25140d')
const { v1: uuidv1 } = require('uuid');

const connection = require('../config/database.js');



router.get('/', function(req, res) {
    if (req.session.username) // deja authentifie : on va a l'index
    {
        res.redirect('/');
    }
	else
    {
        res.render('reset');
    }
});

router.post('/', urlencodedParser, function(req, res) {
    if (req.body.email) {
        if (!req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            status="Mail format incorrect. Please check again.";
            res.render('reset', { resetmail: status});
            return;
        }
    }
    var token_hash = uuidv1();
    connection.query('UPDATE users SET reset= ? WHERE email= ?', [token_hash, req.body.email], function(err,records){
        if(records.affectedRows)
        {
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
                    "Name": "Matcha"
                  }
                ],
                "Subject": "Reset your password",
                "TextPart": "Account activation.",
                "HTMLPart": "<h3>Hello, welcome to matcha! Please click the link below to reset your password.</h3><br />" + "<a href=\"http://localhost:3000/resetpwd?reset=" + token_hash + "\">Password reset link</a>",
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
          status="You received a mail. Please check your inbox."
          res.render('reset', { resetmail: status });
        }
        else {
            status = "An error as occured, please try again."
            res.render('reset', { resetmail: status });
        }
    });
});

module.exports = router;