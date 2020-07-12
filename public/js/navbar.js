var arrowStatus = true;
var bellStatus = true;
function sidemenu(elem) {
	if(elem) 
	{
        var navbar = document.querySelector('.navbar-selection');
        var navbell = document.querySelector('.navbar-bell');
        var navbellhead = document.querySelector('.bell-select-head');
        if (arrowStatus == true)
        {
            elem.id="arrow-cross";
            navbellhead.id="bell-column";
            navbar.id="navbar-display";
            navbell.id="navbar-hide";
            arrowStatus = false;
            bellStatus = true;
        }
        else if (arrowStatus == false)
        {
            elem.id="arrow-column";
            navbar.id="navbar-hide";
            arrowStatus = true;
        }
	}
}

function sidenotif(elem) {
	if(elem) 
	{
        var navbell = document.querySelector('.navbar-bell');
        var navbar = document.querySelector('.navbar-selection');
        var navbarhead = document.querySelector('.navbar-select-head');
        if (bellStatus == true)
        {
            elem.id="bell-show";
            navbarhead.id="arrow-column";
            navbell.id="navbar-display";
            navbar.id="navbar-hide";
            bellStatus = false;
            arrowStatus = true;
        }
        else if (bellStatus == false)
        {
            elem.id="bell-column";
            navbell.id="navbar-hide";
            bellStatus = true;
        }
	}
}