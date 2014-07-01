var express = require('express');
var logfmt = require('logfmt');
var pg = require('pg');
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});

console.log('Connecting to database with DATABASE_URL ['
    + process.env.DATABASE_URL + ']');

pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err != null) {
      console.log(err);
      return;
    }
    var query = client.query('SELECT * FROM invitations');
    query.on('row', function(row) {
          console.log(JSON.stringify(row));
    });
});
