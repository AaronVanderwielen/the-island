var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["ocean"] = 0] = "ocean";
    TerrainType[TerrainType["shallow"] = 1] = "shallow";
    TerrainType[TerrainType["beach"] = 2] = "beach";
    TerrainType[TerrainType["grass"] = 3] = "grass";
    TerrainType[TerrainType["dirt"] = 4] = "dirt";
    TerrainType[TerrainType["rock"] = 5] = "rock";
    TerrainType[TerrainType["mountain"] = 6] = "mountain";
    TerrainType[TerrainType["lava"] = 7] = "lava";
})(TerrainType || (TerrainType = {}));
var World = (function () {
    function World(x, y, tileSize, gradientSize, tileset) {
        this.numX = x;
        this.numY = y;
        this.tileSize = tileSize;
        this.gradientSize = gradientSize;
        // init grid
        this.sectionsX = 2;
        this.sectionsY = 2;
        this.cached = [];
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                if (sx === 0) {
                    this.cached[sy] = [];
                }
                this.cached[sy][sx] = document.createElement('canvas');
                this.cached[sy][sx].width = (this.numX / this.sectionsX) * tileSize;
                this.cached[sy][sx].height = (this.numY / this.sectionsX) * tileSize;
            }
        }
        this.tileset = tileset;
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
        // fill with dirt
        this.fill(this.gradientSize * 4, this.numX - (this.gradientSize * 4), this.gradientSize * 4, this.numY - (this.gradientSize * 4), 4 /* dirt */, false);
        // add grass patches to dirt randomly
        this.createGrass(.02, 5);
    };
    World.prototype.createOcean = function () {
        this.layerEmptyTop(0, this.numX, 0, 0 /* ocean */, 2 /* beach */, true);
        this.layerEmptyRight(this.numX - 1, 0, this.numY, 0 /* ocean */, 2 /* beach */, true);
        this.layerEmptyBelow(0, this.numX, this.numY - 1, 0 /* ocean */, 2 /* beach */, true);
        this.layerEmptyLeft(0, 0, this.numY, 0 /* ocean */, 2 /* beach */, true);
    };
    World.prototype.createBeach = function () {
        this.layerEmptyTop(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.gradientSize * 2, 2 /* beach */, 4 /* dirt */, true);
        this.layerEmptyRight(this.numX - 1 - (this.gradientSize * 2), this.gradientSize * 2, this.numY - (this.gradientSize * 2), 2 /* beach */, 4 /* dirt */, true);
        this.layerEmptyBelow(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.numY - 1 - (this.gradientSize * 2), 2 /* beach */, 4 /* dirt */, true);
        this.layerEmptyLeft(this.gradientSize * 2, this.gradientSize * 2, this.numY - (this.gradientSize * 2) + 1, 2 /* beach */, 4 /* dirt */, true);
    };
    World.prototype.createGrass = function (chance, size) {
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = this.grid[y][x];
                if (block.type === 4 /* dirt */) {
                    // roll for chance
                    var rand = Math.random();
                    if (rand <= chance) {
                        this.randShape(x, y, Math.round(Math.random() * size), 1, 3 /* grass */, [4 /* dirt */]);
                    }
                }
            }
        }
    };
    World.prototype.createMountain = function () {
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), this.gradientSize * 4, 1, 5 /* rock */);
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), this.gradientSize * 2, 1, 6 /* mountain */, [5 /* rock */]);
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), Math.round(this.gradientSize / 3), 1, 7 /* lava */, [6 /* mountain */]);
    };
    World.prototype.randShape = function (cx, cy, d, smooth, type, overwrite) {
        var startX = Math.round(cx - d - (d * Math.random())), endX = Math.round(cx + d + (d * Math.random())), startY = cy - d, endY = cy + d, prevPushA = 0, prevPushB = 0;
        for (var x = startX; x <= endX; x++) {
            var xFactor = d - Math.abs(cx - x), pushA = Math.round(d * Math.random()) + (xFactor > d / 2 ? d / 2 : xFactor), evenedA = pushA, pushB = Math.round(d * Math.random()) + (xFactor > d / 2 ? d / 2 : xFactor), evenedB = pushB;
            for (var s = 0; s < smooth; s++) {
                evenedA = Math.round((evenedA + prevPushA) / 2);
                evenedB = Math.round((evenedB + prevPushB) / 2);
            }
            for (var y = startY; y <= endY; y++) {
                if (!this.typeIsSet(this.grid[y][x]) || (overwrite && overwrite.indexOf(this.grid[y][x].type) > -1)) {
                    // if y is center or y is higher but greater than even or y is lower but less than even, make type
                    if ((y == cy && (evenedA > 0 || evenedB > 0)) || (y < cy && y >= cy - evenedA) || (y > cy && y <= cy + evenedB)) {
                        this.setType(this.grid[y][x], type);
                    }
                }
            }
            prevPushA = evenedA;
            prevPushB = evenedB;
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
    World.prototype.render = function () {
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                var ctx = this.cached[sy][sx].getContext("2d"), startX = sx * (this.numX / this.sectionsX), endX = startX + (this.numX / this.sectionsX), startY = sy * (this.numY / this.sectionsY), endY = startY + (this.numY / this.sectionsY);
                for (var y = startY; y < endY; y++) {
                    var row = this.grid[y];
                    for (var x = startX; x < endX; x++) {
                        var block = row[x];
                        this.renderBlock(block, sy, sx, ctx);
                    }
                }
            }
        }
    };
    World.prototype.renderBlock = function (block, ySection, xSection, ctx) {
        var byps = this.numY / this.sectionsY, bxps = this.numX / this.sectionsX, startBlockY = (block.y - (ySection * byps)) * this.tileSize, startBlockX = (block.x - (xSection * bxps)) * this.tileSize;
        ctx.drawImage(this.tileset, block.type * this.tileSize, 0, this.tileSize, this.tileSize, startBlockX, startBlockY, this.tileSize, this.tileSize);
        //else {
        //    //define the colour of the square
        //    ctx.fillStyle = block.bg;
        //    // Draw a square using the fillRect() method and fill it with the colour specified by the fillStyle attribute
        //    ctx.fillRect(block.x * this.tileSize, block.y * this.tileSize, this.tileSize, this.tileSize);
        //}
    };
    World.prototype.getBlock = function (x, y) {
        var yIndex = Math.floor(y / this.tileSize), xIndex = Math.floor(x / this.tileSize);
        return this.grid[yIndex][xIndex];
    };
    World.prototype.setNearbyPointers = function (block) {
        block.above = block.y > 0 ? this.grid[block.y - 1][block.x] : null;
        block.below = block.y < this.numY - 2 ? this.grid[block.y + 1][block.x] : null;
        block.left = block.x > 0 ? this.grid[block.y][block.x - 1] : null;
        block.right = block.x < this.numX - 2 ? this.grid[block.y][block.x + 1] : null;
    };
    World.prototype.fill = function (startX, endX, startY, endY, fillType, overwrite) {
        for (var y = startY; y < endY; y++) {
            for (var x = startX; x < endX; x++) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    this.setType(this.grid[y][x], fillType);
                }
            }
        }
    };
    World.prototype.setTerrainType = function (block) {
        if (block.type !== undefined && block.type !== null) {
            return;
        }
        else if (this.bordersDirt(block)) {
            var chances = {};
            if (((block.x < (this.numX / 2)) && block.x < this.gradientSize * 5) || ((block.x > (this.numX / 2)) && block.x > this.numX - (this.gradientSize * 5)) || ((block.y < (this.numY / 2)) && block.y < this.gradientSize * 5) || ((block.y > (this.numY / 2)) && block.y > this.numY - (this.gradientSize * 5))) {
                chances[4 /* dirt */] = .8;
                chances[3 /* grass */] = .2;
            }
            else {
                chances[4 /* dirt */] = .6;
                chances[3 /* grass */] = .4;
            }
            this.chanceType(block, chances);
        }
        else if (this.bordersGrass(block)) {
            var chances = {};
            chances[3 /* grass */] = .8;
            chances[4 /* dirt */] = .1;
            chances[5 /* rock */] = .1;
            this.chanceType(block, chances);
        }
        else {
            var chances = {};
            chances[5 /* rock */] = 1;
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
        else if (type == 2 /* beach */) {
            block.bg = "#eda";
            block.type = 2 /* beach */;
        }
        else if (type == 3 /* grass */) {
            block.bg = "#8c3";
            block.type = 3 /* grass */;
        }
        else if (type == 4 /* dirt */) {
            block.bg = "#a95";
            block.type = 4 /* dirt */;
        }
        else if (type == 5 /* rock */) {
            block.bg = "#aaa";
            block.type = 5 /* rock */;
        }
        else if (type == 6 /* mountain */) {
            block.bg = "#444";
            block.type = 6 /* mountain */;
        }
        else if (type == 7 /* lava */) {
            block.bg = "#600";
            block.type = 6 /* mountain */;
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
        return block.above.type === 4 /* dirt */ || block.left.type === 4 /* dirt */;
    };
    World.prototype.bordersGrass = function (block) {
        return block.above.type === 3 /* grass */ || block.left.type === 3 /* grass */;
    };
    return World;
})();
//# sourceMappingURL=world.js.map