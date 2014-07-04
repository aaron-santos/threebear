var async = require('async');

var Db = function (client) {
  this.client = client;
};

// Retrieve a list of invitations for the given user.
Db.prototype.getInvitations = function(googleId, callback) {
    var query = this.client.query(
        "SELECT invitations.*, invitationusers.accepted FROM invitations"
       + " JOIN invitationusers ON invitations.id = invitationusers.invitationid"
       + " WHERE invitationusers.googleid = $1",
        [googleId]);
    var results = [];
    query.on('row', function(row) {
        results.push(row);
    });
    query.on('end', function() {
        callback(null, results);
    });
    query.on('error', function(err) {
        callback(err, null);
    });
};

// Create a new invitation.
Db.prototype.createInvitation = function(newInvitation, callback) {
    // alias client because `this` won't be available in callbacks
    var client = this.client;
    var query = this.client.query(
        "INSERT INTO invitations (startdate, enddate, numplayers, createdBy)"
        + " VALUES (NOW(), NOW() + INTERVAL '30 day', $1, $2) RETURNING id",
        [newInvitation.numPlayers, newInvitation.createdBy],
        function(err, result) {
            if (err != null) {
                callback(err);
            }
            else if (result != null) {
                var invitationId = result.rows[0].id;
                console.log('Adding users to invitation [' + invitationId + '] ' + JSON.stringify(newInvitation.userIds));
                async.each(newInvitation.userIds, function(userId, callback) {
                    var accepted = userId === newInvitation.createdBy ? true : false;
                    var query = client.query(
                        "INSERT INTO invitationusers (invitationid, googleid, accepted)"
                        + " VALUES ($1, $2, $3)",
                        [invitationId, userId, accepted],
                        function (err, result) {
                            if (err != null) {
                                callback(err);
                            } else {
                                callback();
                            }
                        });
                }, function(err) {
                    if (err != null) {
                        callback(err);
                    } else {
                        //client.end();
                        callback(null);
                    }
                });
            }
    });
};

// Accept an invitation.
Db.prototype.acceptInvitation = function(invitationId, userId, callback) {
    var query = this.client.query(
        "UPDATE invitationUsers SET accepted = true"
        + " WHERE invitationId = $1 AND googleId = $2",
        [invitationId, userId],
        function(err, result) {
            if (err != null) {
                callback(err);
            }
            else {
                callback(null);
            }
    });
};

module.exports = Db;
