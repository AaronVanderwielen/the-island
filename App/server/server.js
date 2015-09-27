var Server = (function () {
    function Server() {
        var obj = this;
        this.Https = require('https'),
            this.Http = require('http'),
            this.Path = require('path'),
            this.Express = require('express'),
            this.Socket = require("socket.io"),
            //this.Cons = require('consolidate'),
            this.Session = require('express-session'),
            this.MongoStore = require('connect-mongo')(this.Session),
            this.Mongoose = require('mongoose'),
            this.MongoServer = require('mongodb').Server,
            this.ObjectID = require('mongodb').ObjectID,
            this.u = require("underscore"),
            this.app = this.Express(),
            this.server,
            this.io,
            this.db,
            this.sessionMiddleware,
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
        this.sessionMiddleware = this.Session({
            secret: "4lkknfpoj4509yvojn3q4-9udfvklzm",
            store: new this.MongoStore({
                db: 'island',
                host: 'localhost',
                port: 27017,
                collection: 'sessions'
            })
        });
        // server and socket io
        this.server = this.Http.Server(this.app);
        this.io = this.Socket(this.server);
        // initialize session storage in mongo and usable in socketio
        this.io.use(function (socket, next) {
            obj.sessionMiddleware(socket.request, socket.request.res, next);
        });
        this.app.use(this.sessionMiddleware);
        // socket.io connection
        this.io.on("connection", function (socket) {
            console.log("socket connection " + socket.id);
            var session = socket.request.session;
            socket.on("fromclient", function (data) {
                console.log(data);
            });
        });
        this.io.on('disconnect', function () {
            console.log("socket disconnect");
        });
        // initialize static file directory
        this.app.use(this.Express.static(this.Path.join(__dirname, '/static')));
        // initialize viewengine
        //this.app.engine('html', this.Cons.swig);
        this.app.set('view engine', 'html');
        this.app.set('views', __dirname + "/views");
        this.app.get('*', function (req, res) {
            //res.status(404).send("404 Not Found");
            res.render('default');
        });
        // start server
        this.server.listen(1337);
        console.log("Express listening on 1337");
    };
    return Server;
})();
var server = new Server();
//# sourceMappingURL=server.js.map