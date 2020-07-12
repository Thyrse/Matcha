const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const ent = require('ent');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var status = "";
var reset = ""

const connection = require('../config/database.js');



router.get('/', function(req, res) {
    if (req.session.username) // deja authentifie : on va a l'index
    {
        res.redirect('/');
    }
	else
    {
        if (req.query.reset)
        {
            reset = req.query.reset;
            res.render('resetpwd');
        }
		else
		{
            res.redirect('/');
        }
    }
});

router.post('/', urlencodedParser, function(req, res) {
    if (!req.body.password || !req.body.passwordbis)
    {
        // afficher une erreur et attendre une nouvelle saisie
        status = 'Error! Each field must be fueled.';
        res.render('resetpwd', { reset: status});
        return;
    }
    // verifier que les deux mdp saisis sont identiques
    if (req.body.password !== req.body.passwordbis)
    {
        // afficher une erreur et attendre une nouvelle saisie
        status = 'Error! Passwords must match.';
        res.render('resetpwd', { reset: status});
        return; // TBD : comment sortir en erreur proprement ?
    }
    if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
        status="Password must contain at least 4 char including 1 number, caps and low key";
        res.render('resetpwd', { reset: status});
        return;
    }
    var hashed = bcrypt.hashSync(req.body.password, saltRounds);
    connection.query('UPDATE users SET reset="",password= ? WHERE reset= ?', [hashed, req.query.reset], function(err,records){
        if(records.affectedRows == 1)
        {
            status = "Your password has been updated."
            res.render('resetpwd', { reset: status });
        }
         else {
            status = "An error as occured, please try again."
            res.render('resetpwd', { reset: status });
        }
    });
});

module.exports = router;