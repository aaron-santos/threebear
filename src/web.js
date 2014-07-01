var https = require('https');
var express = require('express');
var logfmt = require('logfmt');
var pg = require('pg');
var _ = require('underscore');

var Db = require('./db');


var app = express();

app.use(logfmt.requestLogger());

console.log('Connecting to database with DATABASE_URL ['
    + process.env.DATABASE_URL + ']');

//app.get('/arena', function(req, res) {
//    console.log('Got request for /arena');
//    res.send('Hello World!');
//});

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
                    "friends": {"href": "/arena/friends"}
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

    // Inivitations collection
    app.get('/arena/invitations', function(req, res) {
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
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});


