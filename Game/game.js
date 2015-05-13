var Game = (function () {
    function Game(canvas, resX, resY, fps) {
        this.canvas = canvas;
        this.canvas.width = resX;
        this.canvas.height = resY;
        this.ctx = canvas.getContext('2d');
        this.resX = resX;
        this.resY = resY;
        this.fps = fps;
        this.objects = new Array();
    }
    Game.prototype.init = function () {
        this.world = new World(100, 100, 100, 5);
        this.sound = new Sound();
        this.userControls = new Controls(this.fps);
        this.userControlled = new Sprite('/img/char.png');
        this.addMapObject(this.userControlled);
        this.onGameReady(function () {
            this.userControls.start();
            this.start();
        });
    };
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
        this.moveViewCenter(this.userControlled);
        this.moveUserControlled();
        this.drawMapObjects();
    };
    Game.prototype.moveUserControlled = function () {
        this.userControlled.move(this.userControls.x, this.userControls.y, this.userControls.strength, this.world);
    };
    Game.prototype.drawMapObjects = function () {
        for (var o in this.objects) {
            this.objects[o].draw(this.ctx, this.view);
        }
    };
    Game.prototype.addMapObject = function (obj) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 2000;
        obj.y = 2000;
        this.objects.push(obj);
    };
    Game.prototype.renderView = function () {
        var ctx = this.canvas.getContext("2d");
        var info = document.getElementById('view');
        info.innerHTML = "";
        info.innerHTML += 'startX: ' + this.view.startX + '<br />';
        info.innerHTML += 'endX: ' + this.view.endX + '<br />';
        info.innerHTML += 'startY: ' + this.view.startY + '<br />';
        info.innerHTML += 'endY: ' + this.view.endY;
        ctx.drawImage(this.world.cached, this.view.startX, this.view.startY, this.resX, this.resY, 0, 0, this.resX, this.resY);
    };
    Game.prototype.moveViewCenter = function (userSprite) {
        var newStartX = userSprite.x - (this.resX / 2), newEndX = newStartX + this.resX, newStartY = userSprite.y - (this.resY / 2), newEndY = newStartY + this.resY;
        //if (newStartX <= 0) {
        //    newStartX = 0;
        //    newEndX = this.game.resX;
        //    center = false;
        //}
        //else if (newEndX >= this.numX * this.tileSize) {
        //    newStartX = (this.numX * this.tileSize) - this.game.resX;
        //    newEndX = this.numX * this.tileSize;
        //    center = false;
        //}
        //else if (newStartY <= 0) {
        //    newStartY = 0;
        //    newEndY = this.game.resY;
        //    center = false;
        //}
        //else if (newEndY >= this.numY * this.tileSize) {
        //    newStartY = (this.numY * this.tileSize) - this.game.resY;
        //    newEndY = this.numY * this.tileSize;
        //    center = false;
        //}
        this.view = {
            startX: newStartX,
            endX: newEndX,
            startY: newStartY,
            endY: newEndY
        };
        this.renderView();
    };
    return Game;
})();
$(function () {
    if ("getGamepads" in navigator) {
        var canvas = $('canvas')[0], game = new Game(canvas, 1280, 800, 60);
        game.init();
    }
});
//# sourceMappingURL=game.js.map