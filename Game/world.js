var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["ocean"] = 0] = "ocean";
    TerrainType[TerrainType["beach"] = 1] = "beach";
    TerrainType[TerrainType["grass"] = 2] = "grass";
    TerrainType[TerrainType["dirt"] = 3] = "dirt";
    TerrainType[TerrainType["rock"] = 4] = "rock";
    TerrainType[TerrainType["mountain"] = 5] = "mountain";
    TerrainType[TerrainType["lava"] = 6] = "lava";
})(TerrainType || (TerrainType = {}));
var World = (function () {
    function World(x, y, tileSize, gradientSize) {
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
        this.fill(this.gradientSize * 4, this.numX - (this.gradientSize * 4), this.gradientSize * 4, this.numY - (this.gradientSize * 4), 3 /* dirt */, false);
        //for (var y = this.gradientSize * 3; y < this.numY - (this.gradientSize * 3); y++) {
        //    for (var x = this.gradientSize * 3; x < this.numX - (this.gradientSize * 3); x++) {
        //        this.setTerrainType(this.grid[y][x]);
        //    }
        //}
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
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), Math.round(this.gradientSize / 3), 1, 6 /* lava */);
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), this.gradientSize * 2, 1, 5 /* mountain */);
        //// lava
        //var lStartX = Math.round((this.numX / 2) - (this.gradientSize / 2)),
        //    lEndX = Math.round((this.numX / 2) + (this.gradientSize / 2)),
        //    lStartY = Math.round((this.numY / 2) - (this.gradientSize / 2)),
        //    lEndY = Math.round((this.numY / 2) + (this.gradientSize / 2));
        //this.layerEmptyBelow(lStartX, lEndX, lStartY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyLeft(lStartX, lStartY, lEndY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyTop(lStartX, lEndX, lEndY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyRight(lStartX, lStartY, lEndY, TerrainType.mountain, TerrainType.rock, false);
        //// mountain
        //var mStartX = Math.round((this.numX / 2) - this.gradientSize),
        //    mEndX = Math.round((this.numX / 2) + this.gradientSize),
        //    mStartY = Math.round((this.numY / 2) - this.gradientSize),
        //    mEndY = Math.round((this.numY / 2) + this.gradientSize);
        //this.layerEmptyBelow(mStartX, mEndX, mStartY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyLeft(mStartX, mStartY, mEndY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyTop(mStartX, mEndX, mEndY, TerrainType.mountain, TerrainType.rock, false);
        //this.layerEmptyRight(mStartX, mStartY, mEndY, TerrainType.mountain, TerrainType.rock, false);
        //// rocky surrounding
        //var rStartX = mStartX - Math.round(this.gradientSize * Math.random()),
        //    rEndX = mEndX + Math.round(this.gradientSize * Math.random()),
        //    rStartY = mStartY - Math.round(this.gradientSize * Math.random()),
        //    rEndY = mEndY + Math.round(this.gradientSize * Math.random());
        //this.layerEmptyBelow(rStartX, rEndX, rStartY, TerrainType.rock, TerrainType.dirt, false);
        //this.layerEmptyLeft(rStartX, rStartY, rEndY, TerrainType.rock, TerrainType.dirt, false);
        //this.layerEmptyTop(rStartX, rEndX, rEndY, TerrainType.rock, TerrainType.dirt, false);
        //this.layerEmptyRight(rStartX, rStartY, rEndY, TerrainType.rock, TerrainType.dirt, false);
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
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
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
        else if (type == 6 /* lava */) {
            block.bg = "#600";
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