 function change_profile(elem) {
	if(elem) 
	{
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/settings/profile/modify', true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			// recuperer le ou les champs input a transmettre faisant partie du même formulaire
			var params = "";
			var profileupdate = document.getElementById("profile_update")
			var elems = profileupdate.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], input[type="checkbox"], select, textarea');
			for ( var i = 0, c = elems.length ; i < c; i++) {
				if (params.length > 0)
					params += '&';
				params += elems[i].name + '=' + elems[i].value;
			}
			xhr.send(params);
	}
}


function change_password(elem) {
	if(elem) 
	{
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/settings/profile/chgpwd', true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			// recuperer le ou les champs input a transmettre faisant partie du même formulaire
			var params = "";
			var pwdupdate = document.getElementById("password_update")
			var elems = pwdupdate.querySelectorAll('input[type="password"]');
			for ( var i = 0, c = elems.length ; i < c; i++) {
				if (params.length > 0)
					params += '&';
				params += elems[i].name + '=' + elems[i].value;
			}
			xhr.send(params);
	}
}
