define(["require", "exports", "controls", 'render'], function (require, exports, Controls, Render) {
    var Start = (function () {
        function Start() {
        }
        Start.prototype.setLoadMsg = function (step) {
            if (step) {
                $('.load-step').text(step);
            }
            else {
                $('#load-screen').remove();
                $('#canvas').show();
            }
        };
        Start.prototype.mainMenu = function () {
            var obj = this, menuControls = new Controls.MenuControls(), menuInterval;
            menuControls.onConnect = function () {
                $('#main-menu .waiting').hide();
                $('#main-menu .menu-options').show();
                menuInterval = window.setInterval(function () {
                    if (!menuControls)
                        return;
                    menuControls.report();
                    for (var a in menuControls.actions) {
                        var action = menuControls.actions[a];
                        if (!action.recorded) {
                            // new action to process
                            switch (action.button) {
                                case 0:
                                    window.clearInterval(menuInterval);
                                    menuControls.clear();
                                    menuControls = null;
                                    $('#main-menu').remove();
                                    $('#load-screen').show();
                                    obj.initGame();
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }, 25);
            };
            menuControls.onDisconnect = function () {
                $('#main-menu .menu-options').hide();
                $('#main-menu .waiting').show();
                window.clearInterval(menuInterval);
            };
            menuControls.start();
        };
        Start.prototype.initGame = function () {
            var obj = this, canvas = $('#canvas')[0];
            obj.gameRender = new Render.GameRender(canvas, window.innerWidth, window.innerHeight);
            obj.socket = io.connect('http://localhost:1337');
            obj.socket.on('gameReady', function (gameData) {
                obj.loadAssets(gameData, function () {
                    obj.bindControls(gameData);
                    obj.startGame();
                });
            });
        };
        Start.prototype.loadAssets = function (gameData, callback) {
            var obj = this;
            obj.gameRender.loadAssets(function () {
                // load files, render and cache map objects/sprites
                obj.gameRender.mapRender = new Render.MapRender(gameData.map);
                obj.gameRender.initialMapRender();
                callback();
            });
        };
        Start.prototype.bindControls = function (gameData) {
            var obj = this, gameControls = new Controls.GameControls(), interval;
            gameControls.onConnect = function () {
                interval = setInterval(function () {
                    gameControls.report();
                    obj.socket.emit('updatePlayerControls', gameControls);
                }, 25);
            };
            gameControls.onDisconnect = function () {
                clearInterval(interval);
            };
            gameControls.start();
        };
        Start.prototype.startGame = function () {
            var obj = this, lastGameUpdate = new Date();
            $('#load-screen').hide();
            $(obj.gameRender.canvas).show();
            obj.socket.on('gameUpdate', function (gameData) {
                var now = new Date(), duration = now.getTime() - lastGameUpdate.getTime();
                lastGameUpdate = now;
                $('#fps').html(duration.toString());
                var player = gameData.players[0], ms = obj.gameRender.refresh(gameData, player.sprite.x, player.sprite.y);
                $('#refresh-duration').html(ms);
                obj.socket.emit('updateMe');
            });
            obj.socket.emit('subscribeToGame');
            obj.socket.on('subscribed', function () {
                obj.socket.emit('updateMe');
            });
        };
        return Start;
    })();
    exports.Start = Start;
});
//# sourceMappingURL=start.js.map