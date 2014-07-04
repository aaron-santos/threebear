var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var pg = require('pg');
var _ = require('underscore');
var googleapis = require('googleapis');
var async = require('async');

var Db = require('./db');


var app = express();
var OAuth2Client = googleapis.OAuth2Client;

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

function handleErrorFn(res) {
    return function(err, data, callback /*(err, data)*/) {
        if (err) {
          console.error(err);
          res.send({ status: 'error', message: err.message });
        }
        else if (callback != null) {
          callback(null, data);
        }
    };
}

function getCurrentUserId(accessToken, callback /*(err, id)*/) {
    https.get('https://www.googleapis.com/plus/v1/people/me/?fields=id&access_token=' + accessToken, function(gRes){
        var body = '';
        gRes.on('data', function(chunk) {
            body += chunk;
        });
        gRes.on('end', function() {
            var jsonBody = JSON.parse(body);
            console.log('got me results: ' + body);
            
            if (jsonBody.error != null) {
                callback(jsonBody.error, null);
            } else {
                callback(null, jsonBody.id);
            }
        });
        gRes.on('error', function(err) {
            callback(err, null);
        });
    });
}

function getFriends(accessToken, userId, callback /*(err, friends)*/) {
    googleapis
    .discover('plus', 'v1')
    .execute(function(err, client) {
        var oauth2Client = new OAuth2Client(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                process.env.REDIRECT_URL);
        oauth2Client.setCredentials({access_token: accessToken});
        //getAccessToken(oauth2Client, function() {
            console.log('Getting friends accessToken:' + accessToken + ' userId:' + userId);
            client.plus.people.list({
                userId: userId,
                collection: 'visible'
            })
            .withAuthClient(oauth2Client)
            .execute(callback);
        //});
    });
}

function getDb(callback /*(err, db)*/) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err != null) {
          console.log(err);
          callback(err, null);
        }
        console.log('Connected to database');
        var db = new Db(client);
        callback(null, db);
    });
}



// Serve static content from the ./public directory
app.use(express.static('public'));

app.get('/clientid', function(req, res) {
    res.send(process.env.CLIENT_ID);
});

// API entry point
app.get('/arena', function(req, res) {
    console.log('Got request for /arena');
    res.send(
        {
            "_links": {
                "self": {"href": "/arena"},
                "games": {"href": "/arena/games"},
                "invitations": {"href": "/arena/invitations"},
                "friends": {"href": "/arena/friends"},
                "me": {"href": "/arena/me"}
            }
        }
    );
});

app.get('/arena/me', function(req, res) {
    var accessToken = req.query.accessToken;
    https.get('https://www.googleapis.com/plus/v1/people/me/?fields=displayName%2Cid%2Cimage&access_token=' + accessToken, function(gRes){
        var body = '';
        gRes.on('data', function(chunk) {
            body += chunk;
        });
        gRes.on('end', function() {
            var jsonBody = JSON.parse(body);
            console.log('got me results: ' + body);
            
            res.send({
                "name": jsonBody.displayName,
                "imageUrl": jsonBody.image.url
            });
        });
    });
});

app.get('/arena/friends', function(req, res) {
    var accessToken = req.query.accessToken;
    getCurrentUserId(accessToken, function(err, userId) {
        getFriends(accessToken, userId, function(err, friends) {
            console.log('Got friends ' + JSON.stringify(friends));
            res.send({
                "users": _.map(friends.items, function(user) {
                    return {
                        "@id": user.id,
                        "name": user.displayName,
                        "imageUrl": user.image.url
                    };
                })
            });
        });
    });
});


// Inivitations collection
app.get('/arena/invitations', function(req, res) {
    var accessToken = req.query.accessToken;
    async.waterfall([
        // Get a db client and the current user id
        function(callback) {
            async.parallel([
                getDb,
                _.partial(getCurrentUserId, accessToken)],
                callback);
        },
        // Get the invitations for this user from the db
        function(results, callback) {
            var db = results[0];
            var userId = results[1];
            console.log('Getting invitations for user [' + userId + ']');
            db.getInvitations(userId, callback);
        }],
     
        // Make a response with invitations and send it
        function(err, results) {
            handleErrorFn(res)(err, results, function() {
                res.send({
                    "invitations": _.map(results, function(invitation) {
                        return {
                            "@id": invitation.id,
                            "startDate": invitation.startdate,
                            "endDate": invitation.enddate,
                            "numPlayers": invitation.numplayers,
                            "accepted": invitation.accepted
                        };
                    })
                });
            });
        }
    );
});

// Accept new invitations
app.post('/arena/invitations/create', function(req, res) {
    var accessToken = req.query.accessToken;
    async.waterfall([
        // Get a db client and the current user id
        function(callback) {
            async.parallel([
                getDb,
                _.partial(getCurrentUserId, accessToken)],
                callback);
        },
        // Get the invitations for this user from the db
        function(results, callback) {
            var db = results[0];
            var userId = results[1];
            // The current user created the invitation, add them as the creator
            req.body.createdBy = userId;
            // The current user is implicitly invited, add them to the user id's list
            req.body.userIds.push(userId);
            db.createInvitation(req.body, callback);
        }],
        function(err, results) {
            handleErrorFn(res)(err, results, function() {
                res.send(201, '');
            });
        }
    );
});

// Accept invitation
app.post('/arena/invitations/:id/accept', function(req, res) {
    var accessToken = req.query.accessToken;
    var invitationId = req.params.id;
    async.waterfall([
        // Get a db client and the current user id
        function(callback) {
            async.parallel([
                getDb,
                _.partial(getCurrentUserId, accessToken)],
                callback);
        },
        // Get the invitations for this user from the db
        function(results, callback) {
            var db = results[0];
            var userId = results[1];
            db.acceptInvitation(invitationId, userId, callback);
        }],
        function(err, results) {
            handleErrorFn(res)(err, results, function() {
                res.send(204, '');
            });
        }
    );
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});


