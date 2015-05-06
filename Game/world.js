var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["ocean"] = 0] = "ocean";
    TerrainType[TerrainType["beach"] = 1] = "beach";
    TerrainType[TerrainType["grass"] = 2] = "grass";
    TerrainType[TerrainType["dirt"] = 3] = "dirt";
    TerrainType[TerrainType["rock"] = 4] = "rock";
})(TerrainType || (TerrainType = {}));
var World = (function () {
    function World(x, y, tileSize, gradientSize) {
        this.numX = x;
        this.numY = y;
        this.tileSize = tileSize;
        this.gradientSize = gradientSize;
        // init grid
        this.initGrid();
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
    World.prototype.render = function (container) {
        for (var y in this.grid) {
            var row = this.grid[y];
            for (var x in row) {
                var block = row[x];
                this.renderBlock(block, container);
            }
        }
    };
    World.prototype.renderBlock = function (block, container) {
        var div = document.createElement("div");
        div.style.width = this.tileSize + "px";
        div.style.height = this.tileSize + "px";
        div.style.backgroundColor = block.bg;
        container.appendChild(div);
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
        else if (this.bordersBeach(block)) {
            var chances = {};
            chances[1 /* beach */] = .6;
            //chances[terrainType.grass] = .3;
            chances[3 /* dirt */] = .4;
            this.chanceType(block, chances);
        }
        else {
            var chances = {};
            chances[2 /* grass */] = .4;
            chances[3 /* dirt */] = .4;
            chances[4 /* rock */] = .2;
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
            block.bg = "#ac5";
            block.type = 2 /* grass */;
        }
        else if (type == 3 /* dirt */) {
            block.bg = "#cb8";
            block.type = 3 /* dirt */;
        }
        else if (type == 4 /* rock */) {
            block.bg = "#bbb";
            block.type = 4 /* rock */;
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
    World.prototype.bordersBeach = function (block) {
        return block.above.type === 1 /* beach */ || block.right.type === 1 /* beach */ || block.below.type === 1 /* beach */ || block.left.type === 1 /* beach */;
    };
    return World;
})();
$(function () {
    var world = new World(400, 300, 2, 10);
    world.build();
    world.render($('#container')[0]);
});
//# sourceMappingURL=world.js.map