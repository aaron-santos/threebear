function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');
    // Set accessToken globally
    accessToken = authResult['access_token'];
    showUserNameAndAvatar();
    showMainPage();
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}

function showUserNameAndAvatar() {
    var $loginInfo = $('#loginInfo');
    $.getJSON('/arena/me?accessToken=' + accessToken, function(me) {
        $('<span>')
            .attr('id', 'userDisplayName')
            .addClass('text-muted')
            .text(me.name)
            .appendTo($loginInfo);
        $('<img>')
            .attr('src', me.imageUrl)
            .css('max-width', '34px')
            .css('max-height', '34px')
            .css('padding-left', '1em')
            .appendTo($loginInfo);
    });
}

function showMainPage() {
    
}

$(function() {
    // Create Google+ Signin button
    $.get('/clientid', function(clientId) {
      console.log('got clientId [' + clientId + ']');
      $('<span>')
          .addClass('g-signin')
          .attr('data-callback', 'signinCallback')
          .attr('data-clientid', clientId)
          .attr('data-cookiepolicy', 'single_host_origin')
          .attr('data-requestvisibleactions', 'http://schema.org/AddAction')
          .attr('data-scope', 'https://www.googleapis.com/auth/plus.login')
      .appendTo('#signinButton');
  
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    });
});
