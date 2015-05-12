var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["ocean"] = 0] = "ocean";
    TerrainType[TerrainType["beach"] = 1] = "beach";
    TerrainType[TerrainType["grass"] = 2] = "grass";
    TerrainType[TerrainType["dirt"] = 3] = "dirt";
    TerrainType[TerrainType["rock"] = 4] = "rock";
    TerrainType[TerrainType["mountain"] = 5] = "mountain";
})(TerrainType || (TerrainType = {}));
var World = (function () {
    function World(game, x, y, tileSize, gradientSize) {
        this.game = game;
        this.numX = x;
        this.numY = y;
        this.tileSize = tileSize;
        this.gradientSize = gradientSize;
        // init grid
        this.cached = document.createElement('canvas');
        this.cached.width = x * tileSize;
        this.cached.height = y * tileSize;
        this.initGrid();
        this.build();
        this.render();
    }
    World.prototype.initGrid = function () {
        this.grid = [];
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = {
                    x: x,
                    y: y
                };
                if (x === 0) {
                    this.grid[y] = [];
                }
                this.grid[y][x] = block;
            }
        }
        for (var j in this.grid) {
            var row = this.grid[j];
            for (var k in row) {
                var b = row[k];
                this.setNearbyPointers(b);
            }
        }
    };
    World.prototype.build = function () {
        this.createOcean();
        this.createBeach();
        this.createMountain();
        for (var y = this.gradientSize * 3; y < this.numY - (this.gradientSize * 3); y++) {
            for (var x = this.gradientSize * 3; x < this.numX - (this.gradientSize * 3); x++) {
                this.setTerrainType(this.grid[y][x]);
            }
        }
    };
    World.prototype.createOcean = function () {
        this.layerEmptyTop(0, this.numX, 0, 0 /* ocean */, 1 /* beach */, true);
        this.layerEmptyRight(this.numX - 1, 0, this.numY, 0 /* ocean */, 1 /* beach */, true);
        this.layerEmptyBelow(0, this.numX, this.numY - 1, 0 /* ocean */, 1 /* beach */, true);
        this.layerEmptyLeft(0, 0, this.numY, 0 /* ocean */, 1 /* beach */, true);
    };
    World.prototype.createBeach = function () {
        this.layerEmptyTop(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.gradientSize * 2, 1 /* beach */, 3 /* dirt */, true);
        this.layerEmptyRight(this.numX - 1 - (this.gradientSize * 2), this.gradientSize * 2, this.numY - (this.gradientSize * 2), 1 /* beach */, 3 /* dirt */, true);
        this.layerEmptyBelow(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.numY - 1 - (this.gradientSize * 2), 1 /* beach */, 3 /* dirt */, true);
        this.layerEmptyLeft(this.gradientSize * 2, this.gradientSize * 2, this.numY - (this.gradientSize * 2) + 1, 1 /* beach */, 3 /* dirt */, true);
    };
    World.prototype.createMountain = function () {
        var startX = Math.round((this.numX / 2) - this.gradientSize), endX = Math.round((this.numX / 2) + this.gradientSize), startY = Math.round((this.numY / 2) - this.gradientSize), endY = Math.round((this.numY / 2) + this.gradientSize);
        for (var y = startY; y < endY; y++) {
            for (var x = startX; x < endX; x++) {
                this.setType(this.grid[y][x], 5 /* mountain */);
            }
        }
    };
    World.prototype.layerEmptyTop = function (startX, endX, startY, type, fillType, overwrite) {
        var prevPush = this.gradientSize;
        for (var x = startX; x < endX; x++) {
            var random = Math.random(), push = Math.round(this.gradientSize * random), middle = Math.round((push + prevPush) / 2);
            for (var y = startY; y < startY + (this.gradientSize * 2); y++) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (y < startY + this.gradientSize + middle) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }
            prevPush = push;
        }
    };
    World.prototype.layerEmptyRight = function (startX, startY, endY, type, fillType, overwrite) {
        var prevPush = this.gradientSize;
        for (var y = startY; y < endY; y++) {
            var random = Math.random(), push = Math.round(this.gradientSize * random), middle = Math.round((push + prevPush) / 2);
            for (var x = startX; x > startX - (this.gradientSize * 2); x--) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (x > startX - (this.gradientSize + middle)) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }
            prevPush = push;
        }
    };
    World.prototype.layerEmptyBelow = function (startX, endX, startY, type, fillType, overwrite) {
        var prevPush = this.gradientSize;
        for (var x = startX; x < endX; x++) {
            var random = Math.random(), push = Math.round(this.gradientSize * random), middle = Math.round((push + prevPush) / 2);
            for (var y = startY; y > startY - (this.gradientSize * 2); y--) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (y > startY - (this.gradientSize + middle)) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }
            prevPush = push;
        }
    };
    World.prototype.layerEmptyLeft = function (startX, startY, endY, type, fillType, overwrite) {
        var prevPush = this.gradientSize;
        for (var y = startY; y < endY; y++) {
            // generate values for random edges
            var random = Math.random(), push = Math.round((this.gradientSize * random)), middle = Math.round((push + prevPush) / 2); // keeps close rows similar 
            for (var x = startX; x < startX + (this.gradientSize * 2); x++) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (x < startX + this.gradientSize + middle) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }
            prevPush = push;
        }
    };
    World.prototype.renderView = function () {
        var ctx = this.game.canvas.getContext("2d");
        var info = document.getElementById('view');
        info.innerHTML = "";
        info.innerHTML += 'startX: ' + this.view.startX + '<br />';
        info.innerHTML += 'endX: ' + this.view.endX + '<br />';
        info.innerHTML += 'startY: ' + this.view.startY + '<br />';
        info.innerHTML += 'endY: ' + this.view.endY;
        ctx.drawImage(this.cached, this.view.startX, this.view.startY, this.game.resX, this.game.resY, 0, 0, this.game.resX, this.game.resY);
    };
    World.prototype.render = function () {
        var ctx = this.cached.getContext("2d");
        for (var y = 0; y < this.numY; y++) {
            var row = this.grid[y];
            for (var x = 0; x < this.numX; x++) {
                var block = row[x];
                this.renderBlock(block, ctx);
            }
        }
    };
    World.prototype.renderBlock = function (block, ctx) {
        //define the colour of the square
        ctx.fillStyle = block.bg;
        // Draw a square using the fillRect() method and fill it with the colour specified by the fillStyle attribute
        ctx.fillRect(block.x * this.tileSize, block.y * this.tileSize, this.tileSize, this.tileSize);
    };
    World.prototype.moveViewCenter = function (userSprite) {
        var newStartX = userSprite.x - (this.game.resX / 2), newEndX = newStartX + this.game.resX, newStartY = userSprite.y - (this.game.resY / 2), newEndY = newStartY + this.game.resY;
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
    World.prototype.getBlock = function (x, y) {
        return this.grid[Math.round(y / this.tileSize)][Math.round(x / this.tileSize)];
    };
    World.prototype.setNearbyPointers = function (block) {
        block.above = block.y > 0 ? this.grid[block.y - 1][block.x] : null;
        block.below = block.y < this.numY - 2 ? this.grid[block.y + 1][block.x] : null;
        block.left = block.x > 0 ? this.grid[block.y][block.x - 1] : null;
        block.right = block.x < this.numX - 2 ? this.grid[block.y][block.x + 1] : null;
    };
    World.prototype.setTerrainType = function (block) {
        if (block.type !== undefined && block.type !== null) {
            return;
        }
        else if (this.bordersDirt(block)) {
            var chances = {};
            if (((block.x < (this.numX / 2)) && block.x < this.gradientSize * 5) || ((block.x > (this.numX / 2)) && block.x > this.numX - (this.gradientSize * 5)) || ((block.y < (this.numY / 2)) && block.y < this.gradientSize * 5) || ((block.y > (this.numY / 2)) && block.y > this.numY - (this.gradientSize * 5))) {
                chances[3 /* dirt */] = .8;
                chances[2 /* grass */] = .2;
            }
            else {
                chances[3 /* dirt */] = .6;
                chances[2 /* grass */] = .4;
            }
            this.chanceType(block, chances);
        }
        else if (this.bordersGrass(block)) {
            var chances = {};
            chances[2 /* grass */] = .8;
            chances[3 /* dirt */] = .1;
            chances[4 /* rock */] = .1;
            this.chanceType(block, chances);
        }
        else {
            var chances = {};
            chances[4 /* rock */] = 1;
            this.chanceType(block, chances);
        }
    };
    World.prototype.typeIsSet = function (block) {
        return block.type !== undefined && block.type !== null;
    };
    World.prototype.setType = function (block, type) {
        if (type == 0 /* ocean */) {
            block.bg = "#0af";
            block.type = 0 /* ocean */;
        }
        else if (type == 1 /* beach */) {
            block.bg = "#eda";
            block.type = 1 /* beach */;
        }
        else if (type == 2 /* grass */) {
            block.bg = "#4a0";
            block.type = 2 /* grass */;
        }
        else if (type == 3 /* dirt */) {
            block.bg = "#cb8";
            block.type = 3 /* dirt */;
        }
        else if (type == 4 /* rock */) {
            block.bg = "#aaa";
            block.type = 4 /* rock */;
        }
        else if (type == 5 /* mountain */) {
            block.bg = "#444";
            block.type = 5 /* mountain */;
        }
    };
    World.prototype.chanceType = function (block, chance) {
        var start = 0, random = Math.random();
        for (var c in chance) {
            if (random >= start && random <= (chance[c] + start)) {
                return this.setType(block, c);
            }
            start += chance[c];
        }
    };
    World.prototype.bordersDirt = function (block) {
        return block.above.type === 3 /* dirt */ || block.left.type === 3 /* dirt */;
    };
    World.prototype.bordersGrass = function (block) {
        return block.above.type === 2 /* grass */ || block.left.type === 2 /* grass */;
    };
    return World;
})();
//# sourceMappingURL=world.js.map