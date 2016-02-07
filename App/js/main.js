/// <reference path="util/socket.io-1.3.5.js" />
require.config({
    baseUrl: '/js/game',
    shim: {
        jquery: {
            exports: '$'
        },
        underscore:{
            exports: '_'
        },
        socketio:{
            //deps    : ['jquery', 'underscore'],
            exports : 'io'
        },
        createjs: {
            exports : 'createjs'
        }
    },
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: '../util/jquery.min',
        underscore: '../util/underscore-min',
        socketio: '../util/socket.io-1.3.5',
        createjs: '../util/createjs-2015.05.21.min'
    }
});