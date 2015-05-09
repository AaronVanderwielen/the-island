var Game = (function () {
    function Game(bgCanvas, oCanvas, fps) {
        this.bgCanvas = bgCanvas;
        this.bgCanvas.width = 1920;
        this.bgCanvas.height = 1080;
        this.bgCtx = bgCanvas.getContext('2d');
        this.oCanvas = oCanvas;
        this.oCanvas.width = 1920;
        this.oCanvas.height = 1080;
        this.oCtx = oCanvas.getContext('2d');
        this.fps = fps;
        this.objects = new Array();
    }
    Game.prototype.onGameReady = function (callback) {
        var game = this, i;
        i = window.setInterval(function () {
            var ready = true;
            for (var o in game.objects) {
                if (!game.objects[0].set)
                    ready = false; // check map objects rendered
            }
            if (ready) {
                window.clearInterval(i);
                callback();
            }
        }, 100);
    };
    Game.prototype.start = function () {
        var obj = this;
        window.setInterval(function () {
            obj.refresh();
        }, 1000 / obj.fps);
    };
    Game.prototype.refresh = function () {
        this.oCtx.clearRect(0, 0, this.oCanvas.width, this.oCanvas.height);
        this.drawMapObjects();
    };
    Game.prototype.drawMapObjects = function () {
        for (var o in this.objects) {
            this.objects[o].draw(this.oCtx);
        }
    };
    Game.prototype.addMapObject = function (obj) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 600;
        obj.y = 600;
        this.objects.push(obj);
    };
    return Game;
})();
function canGame() {
    return "getGamepads" in navigator;
}
$(function () {
    if (canGame()) {
        var bgCanvas = $('canvas#bg')[0], oCanvas = $('canvas#objects')[0], game = new Game(bgCanvas, oCanvas, 60), world = new World(1000, 1000, 100, 50, 5), sprite = new Sprite('/img/char.png', world), controls = new Controls(game.fps);
        world.build();
        world.render(bgCanvas);
        game.userControlled = sprite;
        game.addMapObject(sprite);
        game.onGameReady(function () {
            game.start();
            controls.start(sprite);
        });
    }
});
//# sourceMappingURL=game.js.map