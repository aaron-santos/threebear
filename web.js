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


pg.connect(process.env.DATABASE_URL, function(err, client) {
    var query = client.query('SELECT * FROM your_table');
    query.on('row', function(row) {
          console.log(JSON.stringify(row));
    });
});

