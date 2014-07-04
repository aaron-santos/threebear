function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');
    // Set accessToken globally
    window.accessToken = authResult['access_token'];
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
        window.me = me;
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
    $.getJSON('/arena/invitations?accessToken=' + accessToken, function(invitations) {
        var $invitationList = $('#invitationList');
        _.each(invitations.invitations, function(invitation) {
            $('<div>')
                .text(
                    'Created: '
                    + (new Date(invitation.startDate).toLocaleDateString())
                    + ' Ending: '
                    + (new Date(invitation.endDate).toLocaleDateString())
                    + ' Players: '
                    + invitation.numPlayers
                    + ' Accepted: '
                    + invitation.accepted)
                .appendTo($invitationList);
        });
    });
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

    // Wire up buttons
    $('#newInvitationBtn').click(function() {
        var $invitationUsers = $('#invitationUsers');
        $.getJSON('/arena/friends?accessToken=' + accessToken, function(users) {
             _.map(users.users, function(user) {
                 $('<li>')
                    .data('userId', user['@id'])
                    .append('<img src="' + user.imageUrl + '" />')
                    .append($('<div>').text(user.name))
                    .appendTo($invitationUsers);
             });
            $invitationUsers
                .bind('mousedown', function(e) {
                    e.metaKey = true;
                })
                .selectable();
            $('#numPlayers').selectmenu();
            $('#inviteAndPlay').hide();
            $('#newInvitation').show();
        });
    });

    $('#sendInvitationBtn').click(function() {
        var userIds = _.map($('#invitationUsers').children('.ui-selected'), function(li) {
            return $(li).data('userId');
        });
        console.log('selected user ids [' + userIds + ']');
        $.ajax({
            type: 'POST',
            url: '/arena/invitations/create?accessToken=' + accessToken,
            data: JSON.stringify ({
              "numPlayers": parseInt($('#numPlayers').val()),
              "userIds": userIds
            }),
            success: function(data) { alert('data: ' + data); },
            contentType: "application/json",
            dataType: 'json'
        });
    });
});
