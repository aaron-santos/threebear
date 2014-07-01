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


