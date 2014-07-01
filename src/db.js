var Db = function (client) {
  this.client = client;
};

// Retrieve a list of invitations for the given user.
Db.prototype.getInvitations = function(googleId, callback) {
    var query = this.client.query(
        "SELECT DISTINCT invitations.* FROM invitations"
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

module.exports = Db;
