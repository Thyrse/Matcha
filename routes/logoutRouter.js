const express = require('express');
const router = express.Router();

router.get('/', function(req, res) { 
		req.session = null;
		if (req.session == null)
			console.log("You have been disconnected.");
		res.render('login');
});

module.exports = router;