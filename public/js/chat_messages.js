function add_message(elem) {
	if(elem) 
	{
			var parent = elem.previousElementSibling.value;
			socket.emit('new_msg', { parent, current_firstname });
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/chat/newmessage', true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			// recuperer le ou les champs input a transmettre faisant partie du même formulaire
			var params = "";
			var myform = document.getElementById("formulaire_chat")
			var elems = myform.querySelectorAll('input[type="text"], input[type="hidden"]');
			for ( var i = 0, c = elems.length ; i < c; i++) {
				if (params.length > 0)
					params += '&';
				params += elems[i].name + '=' + elems[i].value;
			}
			xhr.send(params);
	}
}
