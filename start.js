var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;

var FakeBceIDServer = require('./app/server/fake.bceid.server');
var fakeBceIDServer = new FakeBceIDServer({token:'monday'});

var Server = require('./app/server/server');
var server = new Server();
server.useBceidServer(fakeBceIDServer);

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

var pg = require('pg');
var client = new pg.Client();

client.connect(function(err) {
    console.log('connection status: ' + JSON.stringify(err));
    var sql = 'select content from messages';
    client.query(sql, function(err, result) {
        client.end();
        console.log('RESULT: ' + JSON.stringify(result));
    });
});

module.exports = server;
module.exports.port = port;
