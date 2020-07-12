const socket = io();
const current_user = nickname();
const current_id = userid();
const current_firstname = firstname();

socket.emit('assign_nickname', current_id);

function view(elem) {
    var parent = elem.previousElementSibling.value;
    socket.emit('new_view', { parent, current_firstname });
}

function like(elem) {
    var parent = elem.previousElementSibling.value;
    socket.emit('new_like', { parent, current_firstname });
}

function match(elem) {
    var parent = elem.previousElementSibling.value;
    socket.emit('new_match', { parent, current_firstname });
}

function nomatch(elem) {
    var parent = elem.previousElementSibling.value;
    socket.emit('unmatch', { parent, current_firstname });
}

socket.on('new_view', function(data) {
    newview(data.nick)
})

socket.on('new_like', function(data) {
    newlike(data.nick)
})

socket.on('new_match', function(data) {
    newmatch(data.nick)
})

socket.on('unmatch', function(data) {
    unmatch(data.nick)
})

socket.on('new_msg', function(data) {
    newmsg(data.nick)
})

function newview(nick) {
    var navbell = document.querySelector('.notif-list');
    var notif_icon = document.querySelector('.notification-alert')
    $(notif_icon).show();
    $(navbell).append('<div class="p-2 bell-notif"><span>' + nick + ' saw your profile.</span></div>');
}

function newlike(nick) {
    var navbell = document.querySelector('.notif-list');
    var notif_icon = document.querySelector('.notification-alert')
    $(notif_icon).show();
    $(navbell).append('<div class="p-2 bell-notif"><span>' + nick + ' liked you.</span></div>');
}

function newmatch(nick) {
    var navbell = document.querySelector('.notif-list');
    var notif_icon = document.querySelector('.notification-alert')
    $(notif_icon).show();
    $(navbell).append('<div class="p-2 bell-notif"><span>' + nick + ' matched with you.</span></div>');
}

function unmatch(nick) {
    var navbell = document.querySelector('.notif-list');
    var notif_icon = document.querySelector('.notification-alert')
    $(notif_icon).show();
    $(navbell).append('<div class="p-2 bell-notif"><span>' + nick + ' does not match with you anymore.</span></div>');
}

function newmsg(nick) {
    var navbell = document.querySelector('.notif-list');
    var notif_icon = document.querySelector('.notification-alert')
    $(notif_icon).show();
    $(navbell).append('<div class="p-2 bell-notif"><span>' + nick + ' sent you a message.</span></div>');
}