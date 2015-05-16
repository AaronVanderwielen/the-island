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
        this.assets = [
            { id: 'char', src: '/img/char.png' },
            { id: 'terrain', src: "/img/terrain.png" }
        ];
    }
    Game.prototype.init = function () {
        this.loadAssets(function () {
            var tileset = this.getAssetById('terrain').value;
            this.world = new World(100, 100, 100, 5, tileset);
            this.sound = new Sound();
            this.userControls = new Controls(this.fps);
            this.userControlled = new Sprite(this.getAssetById('char'));
            this.addMapObject(this.userControlled);
            this.onGameReady(function () {
                this.userControls.start();
                this.start();
            });
        });
    };
    Game.prototype.getAssetById = function (id) {
        var asset = _.find(this.assets, function (a) {
            return a.id === id;
        });
        return asset;
    };
    Game.prototype.loadAssets = function (callback) {
        var queue = new createjs.LoadQueue();
        queue.on("fileload", handleAssetLoaded, this);
        queue.on("complete", handleComplete, this);
        for (var a in this.assets) {
            queue.loadFile({ id: this.assets[a].id, src: this.assets[a].src });
        }
        function handleAssetLoaded(event) {
            var asset = this.getAssetById(event.item.id);
            asset.value = event.result;
        }
        function handleComplete() {
            callback.call(this);
        }
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
                callback.call(game);
            }
        }, 100);
    };
    Game.prototype.start = function () {
        var obj = this;
        window.setInterval(function () {
            obj.stateUpdate();
        }, 15);
        window.setInterval(function () {
            obj.refresh();
        }, 1000 / obj.fps);
    };
    Game.prototype.stateUpdate = function () {
        this.moveUserControlled();
    };
    Game.prototype.refresh = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.moveViewCenter(this.userControlled);
        this.drawMapObjects();
    };
    Game.prototype.moveUserControlled = function () {
        this.userControlled.move(this.userControls.x, this.userControls.y, this.userControls.strength, this.world, this.sound);
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
        var ctx = this.canvas.getContext("2d"), byps = this.world.numY / this.world.sectionsY, bxps = this.world.numX / this.world.sectionsX, pyps = byps * this.world.tileSize, pxps = bxps * this.world.tileSize, ySection = Math.floor(this.view.startY / pyps), xSection = Math.floor(this.view.startX / pxps), ySectionEnd = Math.floor(this.view.endY / pyps), xSectionEnd = Math.floor(this.view.endX / pxps), sectionStartY = this.view.startY - (ySection * pyps), sectionStartX = this.view.startX - (xSection * pxps);
        var info = document.getElementById('view');
        info.innerHTML = "";
        info.innerHTML += 'xSection: ' + xSection + '<br />';
        info.innerHTML += 'ySection: ' + ySection + '<br />';
        if (ySection === ySectionEnd && xSection === xSectionEnd) {
            // all the needed pixels are in this section
            var section = this.world.cached[ySection][xSection];
            ctx.drawImage(section, sectionStartX, sectionStartY, this.resX, this.resY, 0, 0, this.resX, this.resY);
        }
        else {
            if (ySection !== ySectionEnd) {
                // need to load in some pixels from ySectionEnd
                var sectionStart = this.world.cached[ySection][xSection], sectionEnd = this.world.cached[ySectionEnd][xSection], yOffset = sectionStartY + this.resY - pyps;
                ctx.drawImage(sectionStart, sectionStartX, sectionStartY, this.resX, this.resY - yOffset, 0, 0, this.resX, this.resY - yOffset);
                ctx.drawImage(sectionEnd, sectionStartX, 0, this.resX, yOffset, 0, this.resY - yOffset, this.resX, yOffset);
            }
            if (xSection !== xSectionEnd) {
            }
        }
    };
    Game.prototype.moveViewCenter = function (userSprite) {
        var newStartX = userSprite.x - (this.resX / 2), newEndX = newStartX + this.resX, newStartY = userSprite.y - (this.resY / 2), newEndY = newStartY + this.resY;
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