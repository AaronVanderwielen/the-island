var Game = (function () {
    function Game(element, fps) {
        this.canvas = element;
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        this.ctx = element.getContext('2d');
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMapObjects();
    };
    Game.prototype.drawMapObjects = function () {
        for (var o in this.objects) {
            this.objects[o].draw(this.ctx);
        }
    };
    Game.prototype.addMapObject = function (obj) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 0;
        obj.y = 0;
        this.objects.push(obj);
    };
    return Game;
})();
function canGame() {
    return "getGamepads" in navigator;
}
$(function () {
    if (canGame()) {
        var canvas = $('canvas')[0], game = new Game(canvas, 60), world = new World(1000, 1000, 50, 5), sprite = new Sprite('/img/char.png'), controls = new Controls(game.fps);
        world.build();
        world.render(canvas);
        game.userControlled = sprite;
        game.addMapObject(sprite);
        game.onGameReady(function () {
            return false;
            game.start();
            controls.start(sprite);
        });
    }
});
//# sourceMappingURL=game.js.map