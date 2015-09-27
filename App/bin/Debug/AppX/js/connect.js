var Connect = (function () {
    function Connect(onConnect) {
        var obj = this;
        obj.socket = io.connect('http://localhost:1337');
        obj.socket.on('fromserver', function (msg) {
            console.log('fromserver: ' + msg);
        });
        obj.socket.emit('connected', { id: obj.socket.id });
        onConnect(obj.socket);
    }
    return Connect;
})();
//# sourceMappingURL=connect.js.map