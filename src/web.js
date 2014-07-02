var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var logfmt = require('logfmt');
var pg = require('pg');
var _ = require('underscore');

var Db = require('./db');


var app = express();

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

console.log('Connecting to database with DATABASE_URL ['
    + process.env.DATABASE_URL + ']');

function getCurrentUserId(accessToken, callback /*(err, id)*/) {
    https.get('https://www.googleapis.com/plus/v1/people/me/?fields=id&access_token=' + accessToken, function(gRes){
        var body = '';
        gRes.on('data', function(chunk) {
            body += chunk;
        });
        gRes.on('end', function() {
            var jsonBody = JSON.parse(body);
            console.log('got me results: ' + body);
            
            callback(null, jsonBody.id);
        });
        gRes.on('error', function(err) {
            callback(err, null);
        });
    });
}

pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err != null) {
      console.log(err);
      return;
    }
    console.log('Connected to database');
    var db = new Db(client);

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
        https.get('https://www.googleapis.com/plus/v1/people/me/people/visible/?access_token=' + accessToken, function(gRes){
            var body = '';
            gRes.on('data', function(chunk) {
                body += chunk;
            });
            gRes.on('end', function() {
                var jsonBody = JSON.parse(body);
                console.log('got me results: ' + body);
                
                res.send({
                    "users": _.map(jsonBody.items, function(user) {
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
        db.getInvitations('113479285279093781959', function(err, results) {
            if (err != null) {
                console.log(err);
                res.send(500, err);
                return;
            }
            res.send(
                {
                    "invitations": results
                }
            );
        });
    });

    // Accept new invitations
    app.post('/arena/invitations/create', function(req, res) {
        var accessToken = req.query.accessToken;
        getCurrentUserId(accessToken, function(err, id) {
            console.log('Got request body ' + JSON.stringify(req.body));
            db.createInvitation(req.body, function(err) {
                if (err != null) {
                    console.log(err);
                    res.send(500, err);
                } else {
                    res.send(201, '');
                }
            });
        });
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});


