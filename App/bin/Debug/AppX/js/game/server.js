var _;
var Server = (function () {
    function Server() {
        _ = require("underscore");
        var obj = this, requirejs = require('requirejs');
        requirejs.config({
            //Pass the top-level main.js/index.js require
            //function to requirejs so that node modules
            //are loaded relative to the top-level JS file.
            nodeRequire: require
        });
        this.GameServer = requirejs('gameServer');
        this.Https = requirejs('https');
        this.Http = requirejs('http');
        this.Express = requirejs('express');
        this.Socket = requirejs("socket.io");
        this.Session = requirejs('express-session');
        this.MongoStore = requirejs('connect-mongo')(this.Session);
        this.Mongoose = requirejs('mongoose');
        this.MongoServer = requirejs('mongodb').Server;
        this.ObjectID = requirejs('mongodb').ObjectID;
        this.app = this.Express();
        this.server;
        this.io;
        this.db;
        this.sessionMiddleware;
        this.logJson = function (json) {
            console.log(JSON.stringify(json, null, 2));
        };
        // execute
        this.Mongoose.connect('mongodb://localhost/server');
        this.db = this.Mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', function (callback) {
            console.log("connected");
            obj.init();
        });
        this.init = this.init.bind(this);
    }
    Server.prototype.init = function () {
        var obj = this;
        // initialize Mongoose schema
        // initialize session middleware
        obj.sessionMiddleware = obj.Session({
            secret: "4lkknfpoj4509yvojn3q4-9udfvklzm",
            store: new obj.MongoStore({
                db: 'island',
                host: 'localhost',
                port: 27017,
                collection: 'sessions'
            })
        });
        // server and socket io
        obj.server = obj.Http.Server(obj.app);
        obj.io = obj.Socket(obj.server);
        // initialize session storage in mongo and usable in socketio
        obj.io.use(function (socket, next) {
            obj.sessionMiddleware(socket.request, socket.request.res, next);
        });
        obj.app.use(obj.sessionMiddleware);
        //// include client js files
        //this.app.use(this.Express.static('.../js'));
        obj.game = new obj.GameServer.GameServer();
        obj.io.on("connection", function (socket) {
            console.log("socket connection " + socket.id);
            // find or start session
            obj.game.connection(socket);
        });
        obj.io.on('disconnect', function () {
            console.log("socket disconnect");
        });
        // start server
        obj.server.listen(1337);
        console.log("Express listening on 1337");
    };
    return Server;
})();
var server = new Server();
//# sourceMappingURL=server.js.map