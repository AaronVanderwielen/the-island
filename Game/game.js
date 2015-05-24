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
            { id: 'terrain', src: "/img/terrain.png" },
            { id: 'items', src: "/img/tileSetA.png" }
        ];
    }
    Game.prototype.init = function () {
        this.loadAssets(function () {
            var tileset = this.getAssetById('terrain').value, itemset = this.getAssetById('items').value;
            this.world = new World(200, 200, 100, 5, tileset, itemset, this.objects);
            this.sound = new Sound();
            this.userControls = new Controls(this.fps);
            this.userControlled = new Sprite(this.getAssetById('char'));
            this.userControlled.x = 2000;
            this.userControlled.y = 2000;
            this.userControlled.sectionId = this.world.getSectionId(2000, 2000, 'p');
            this.objects.push(this.userControlled);
            this.userControls.start();
            this.start();
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
        this.objects = _.sortBy(this.objects, function (o) {
            return o.z;
        });
        for (var o in this.objects) {
            this.objects[o].draw(this.ctx, this.view);
        }
    };
    Game.prototype.renderView = function () {
        var ctx = this.canvas.getContext("2d"), ySection = Math.floor(this.userControlled.y / this.world.pyps), xSection = Math.floor(this.userControlled.x / this.world.pxps), cachedId = ySection + "," + xSection, cachedStartY = this.view.startY - ((ySection - 1) * this.world.pyps), cachedStartX = this.view.startX - ((xSection - 1) * this.world.pxps);
        // logging
        var info = document.getElementById('view');
        info.innerHTML = "";
        info.innerHTML += 'xSection: ' + xSection + '<br />';
        info.innerHTML += 'ySection: ' + ySection + '<br />';
        if (cachedId !== this.world.cachedId) {
            // need to render a new 3x3 cached canvas
            console.log('refreshing cached canvas');
            this.world.refreshCached(ySection, xSection);
        }
        ctx.drawImage(this.world.cached, cachedStartX, cachedStartY, this.resX, this.resY, 0, 0, this.resX, this.resY);
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
        var canvas = $('canvas')[0], game = new Game(canvas, window.innerWidth, window.innerHeight, 60);
        game.init();
    }
});
//# sourceMappingURL=game.js.map