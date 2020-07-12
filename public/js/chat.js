var client = "Unknown";
var client = nickname();
var autoscroll = document.querySelector('.msg-body')
socket.emit('new_client', client);

// Get room from URL
const { room } = Qs.parse(location.search, { 
    ignoreQueryPrefix: true
});

socket.emit('joinRoom', { room });

// Insert message on page on reception
socket.on('newMessage', function(data) {
    outputMessage(data.pseudo, data.message)
})

// Send message and display on page on form submit
$('#formulaire_chat').submit(function (event) {
    event.preventDefault();
    var message = $('#message').val();
    socket.emit('newMessage', message);
    $('#message').val('').focus();
    return false;
});

function horodate() {
    var date = new Date();
    var str = date.getHours();
    str += ':'+(date.getMinutes()<10?'0':'')+date.getMinutes();
    str += ':'+(date.getSeconds()<10?'0':'')+date.getSeconds();
    return str;
}

function outputMessage(pseudo, message) {
    if(pseudo == client)
        $('#zone_chat').append('<div class="row msg-right"> <div class="col-md-5 offset-md-7 msg-content-right"> <p class="speech-bubble speech-bubble-right">' + message + '</p></div></div>');
    else
        $('#zone_chat').append('<div class="row msg-left"> <div class="col-md-5 msg-content-left"> <p class="speech-bubble speech-bubble-left">' + message + '</p></div></div>');
    autoscroll.scrollTop = autoscroll.scrollHeight;
}