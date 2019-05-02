let RestAdaptor = require('./rest.adaptor');
let ClientAdaptor = require('./client.adaptor');
let express = require('express');
let bodyParser = require("body-parser");
let morgan = require('morgan');

function Server() {
    this.restAdaptor = new RestAdaptor();
    this.clientAdaptor = new ClientAdaptor();
    this.app = express();
    this.headers = [
        { name:'Access-Control-Allow-Origin', value:'*' },
        { name:'Access-Control-Allow-Headers', value:'smgov_userguid,smgov_userdisplayname,Content-Type, Authorization, Content-Length, X-Requested-With' },
        { name:'Access-Control-Allow-Methods', value:'GET, PUT, POST, OPTIONS' },
    ];
    this.requestheaders = [];
}

Server.prototype.start = function (port, ip, done) {
    this.app.use((request, response, next)=>{
        for (let i=0; i<this.requestheaders.length; i++) {
            let header = this.requestheaders[i];
            request.headers[header.name] = header.value;
        }
        for (let i=0; i<this.headers.length; i++) {
            let header = this.headers[i];
            response.setHeader(header.name, header.value);
        }
        next();
    });
    this.app.use((request, response, next)=>{
        if (request.method !== 'OPTIONS' && request.headers['smgov_userguid'] === undefined) {
            response.statusCode = 401;
            response.end(JSON.stringify({ message:'unauthorized' }));
        } else {
            next();
        }
    });
    this.app.use(morgan(':method :url :req[smgov_userguid]', { immediate:true }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.clientAdaptor.route(this.app);
    this.restAdaptor.route(this.app);
    this.server = this.app.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    this.server.close();
    done();
};

Server.prototype.useService = function(hub) {
    this.restAdaptor.useHub(hub);
};

Server.prototype.useDatabase = function(database) {
    this.restAdaptor.useDatabase(database);
};


module.exports = Server;
