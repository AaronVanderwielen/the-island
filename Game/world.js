var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["ocean"] = 0] = "ocean";
    TerrainType[TerrainType["shallow"] = 1] = "shallow";
    TerrainType[TerrainType["beach"] = 2] = "beach";
    TerrainType[TerrainType["dirt"] = 3] = "dirt";
    TerrainType[TerrainType["grass"] = 4] = "grass";
    TerrainType[TerrainType["rock"] = 5] = "rock";
    TerrainType[TerrainType["mountain"] = 6] = "mountain";
    TerrainType[TerrainType["lava"] = 7] = "lava";
})(TerrainType || (TerrainType = {}));
//interface ItemImages {
//    [type: string]: HTMLImageElement;
//}
var World = (function () {
    function World(x, y, tileSize, gradientSize, tileset, itemset, objects) {
        this.numX = x;
        this.numY = y;
        // sections are 25b x 25b
        this.bxps = 25;
        this.byps = 25;
        this.tileSize = tileSize;
        this.gradientSize = gradientSize;
        // init grid
        this.sectionsX = this.numX / this.bxps;
        this.sectionsY = this.numY / this.byps;
        this.pyps = this.byps * this.tileSize; // pixels y per section,
        this.pxps = this.bxps * this.tileSize; // pixels x per section
        // create cached canvas--will be used to hold 3 x 3 sections, updated on section change
        // this is where the viewport is extracted from
        this.cached = document.createElement('canvas');
        this.cached.width = this.pxps * 3;
        this.cached.height = this.pyps * 3;
        var ctx = this.cached.getContext('2d');
        // create section canvases
        this.sections = [];
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                if (sx === 0) {
                    this.sections[sy] = [];
                }
                this.sections[sy][sx] = document.createElement('canvas');
                this.sections[sy][sx].width = (this.numX / this.sectionsX) * tileSize;
                this.sections[sy][sx].height = (this.numY / this.sectionsX) * tileSize;
            }
        }
        this.tileset = tileset;
        this.itemset = itemset;
        this.initGrid();
        this.build();
        this.render(objects);
    }
    World.prototype.initGrid = function () {
        this.grid = [];
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var sectionId = this.getSectionId(y, x, 'b'), block = {
                    x: x,
                    y: y,
                    sectionId: sectionId,
                    objects: [],
                    borders: function (terrain) {
                        return terrain.indexOf(this.above.type) != -1 || terrain.indexOf(this.right.type) != -1 || terrain.indexOf(this.below.type) != -1 || terrain.indexOf(this.left.type) != -1 || terrain.indexOf(this.upperLeft.type) != -1 || terrain.indexOf(this.upperRight.type) != -1 || terrain.indexOf(this.lowerLeft.type) != -1 || terrain.indexOf(this.lowerRight.type) != -1;
                    }
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
        this.fill(this.gradientSize * 4, this.numX - (this.gradientSize * 4), this.gradientSize * 4, this.numY - (this.gradientSize * 4), 3 /* dirt */, false);
        // add grass patches to dirt randomly
        this.createGrass(.03, 5);
        this.createRiversAndLakes(.005, .002);
    };
    World.prototype.createOcean = function () {
        // create deep water
        this.layerEmptyTop(0, this.numX, 0, 0 /* ocean */, 1 /* shallow */, true);
        this.layerEmptyRight(this.numX - 1, 0, this.numY, 0 /* ocean */, 1 /* shallow */, true);
        this.layerEmptyBelow(0, this.numX, this.numY - 1, 0 /* ocean */, 1 /* shallow */, true);
        this.layerEmptyLeft(0, 0, this.numY, 0 /* ocean */, 1 /* shallow */, true);
        // shallow water/start of beach
        this.layerEmptyTop(this.gradientSize, this.numX - this.gradientSize, this.gradientSize, 1 /* shallow */, 2 /* beach */);
        this.layerEmptyRight(this.numX - this.gradientSize - 1, this.gradientSize, this.numY - this.gradientSize, 1 /* shallow */, 2 /* beach */);
        this.layerEmptyBelow(this.gradientSize, this.numX - this.gradientSize, this.numY - this.gradientSize - 1, 1 /* shallow */, 2 /* beach */);
        this.layerEmptyLeft(this.gradientSize, this.gradientSize, this.numY - this.gradientSize, 1 /* shallow */, 2 /* beach */);
    };
    World.prototype.createBeach = function () {
        var gOffset = 3;
        this.layerEmptyTop(this.gradientSize * gOffset, this.numX - (this.gradientSize * gOffset) + 1, this.gradientSize * gOffset, 2 /* beach */, 3 /* dirt */);
        this.layerEmptyRight(this.numX - 1 - (this.gradientSize * gOffset), this.gradientSize * gOffset, this.numY - (this.gradientSize * gOffset), 2 /* beach */, 3 /* dirt */);
        this.layerEmptyBelow(this.gradientSize * gOffset, this.numX - (this.gradientSize * gOffset) + 1, this.numY - 1 - (this.gradientSize * gOffset), 2 /* beach */, 3 /* dirt */);
        this.layerEmptyLeft(this.gradientSize * gOffset, this.gradientSize * gOffset, this.numY - (this.gradientSize * gOffset) + 1, 2 /* beach */, 3 /* dirt */);
    };
    World.prototype.createGrass = function (chance, size) {
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = this.grid[y][x];
                if (block.type === 3 /* dirt */) {
                    // roll for grass
                    var rand = Math.random();
                    if (rand <= chance) {
                        this.randShape(x, y, Math.round(Math.random() * size), 1, 4 /* grass */, [3 /* dirt */]);
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
    World.prototype.createRiversAndLakes = function (riverChance, lakeChance) {
        for (var y = 0; y < this.numY; y++) {
            if (y < this.gradientSize * 3 || y > this.numY - (this.gradientSize * 3)) {
                for (var x = 0; x < this.numX; x++) {
                    if (x < this.gradientSize * 3 || x > this.numX - (this.gradientSize * 3)) {
                        var block = this.grid[y][x];
                        if (block.type === 1 /* shallow */) {
                            // roll for river
                            var riverRoll = Math.random();
                            if (riverRoll <= riverChance) {
                                console.log('river starting at ' + y + ',' + x);
                                // now snake towards mountain
                                var distX = (this.numX / 3) - block.x, distY = (this.numY / 2) - block.y, nextX = block.x, nextY = block.y, prevDir = (block.x > this.gradientSize * 4 && block.x < this.numX - this.gradientSize * 4) ? 'y' : 'x', nextBlock = block;
                                while ((distX !== 0 || distY !== 0) && block.type !== 6 /* mountain */) {
                                    // roll for lake
                                    var lakeRoll = Math.random();
                                    if (lakeRoll <= lakeChance) {
                                        console.log('river ending with lake at ' + nextBlock.y + ',' + nextBlock.x);
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(Math.random() * (this.gradientSize)), 1, 0 /* ocean */, [1 /* shallow */, 2 /* beach */, 3 /* dirt */, 4 /* grass */, 5 /* rock */]);
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(this.gradientSize + (Math.random() * this.gradientSize)), 1, 1 /* shallow */, [2 /* beach */, 3 /* dirt */, 4 /* grass */, 5 /* rock */]);
                                        break;
                                    }
                                    else {
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(Math.random() * (this.gradientSize / 2)), 0, 1 /* shallow */, [2 /* beach */, 3 /* dirt */, 4 /* grass */, 5 /* rock */]);
                                        var chanceX = Math.random(), chanceY = Math.random();
                                        if (distX !== 0 && chanceX < (prevDir === 'x' ? .8 : .2)) {
                                            prevDir = 'x';
                                            if (distX < 0) {
                                                nextX--;
                                            }
                                            else {
                                                nextX++;
                                            }
                                        }
                                        if (distY !== 0 && chanceY < (prevDir === 'y' ? .8 : .2)) {
                                            prevDir = 'y';
                                            if (distY < 0) {
                                                nextY--;
                                            }
                                            else {
                                                nextY++;
                                            }
                                        }
                                        nextBlock = this.grid[nextY][nextX];
                                        // recalculate distance to center
                                        distX = (this.numX / 2) - nextBlock.x;
                                        distY = (this.numY / 2) - nextBlock.y;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = this.grid[y][x];
                if (block.type == 4 /* grass */ && !block.borders([1 /* shallow */])) {
                    // roll for lake
                    var roll = Math.random();
                    if (roll < lakeChance) {
                        console.log("creating lake at " + block.y + ',' + block.x);
                        this.randShape(block.x, block.y, Math.ceil(Math.random() * (this.gradientSize)), 1, 0 /* ocean */, [1 /* shallow */, 2 /* beach */, 3 /* dirt */, 4 /* grass */, 5 /* rock */]);
                        this.randShape(block.x, block.y, Math.ceil(this.gradientSize + (Math.random() * this.gradientSize)), 1, 1 /* shallow */, [2 /* beach */, 3 /* dirt */, 4 /* grass */, 5 /* rock */]);
                    }
                }
            }
        }
    };
    World.prototype.rollForItem = function (block, chanceTypes, objects) {
        // roll for chance
        var rand = Math.random(), prev = 0;
        for (var c in chanceTypes) {
            if (rand >= prev && rand <= prev + chanceTypes[c].c) {
                // now pick random item
                var type = chanceTypes[c].types[Math.round(Math.random() * (chanceTypes[c].types.length - 1))], item = new MapItem(this.itemset, type);
                item.x = item.width >= (this.tileSize / 2) ? block.x * this.tileSize + (this.tileSize / 2) : block.x * this.tileSize + (this.tileSize / 2);
                item.y = item.height >= (this.tileSize / 2) ? block.y * this.tileSize + (this.tileSize / 2) : block.y * this.tileSize + (this.tileSize / 2);
                item.on = block;
                item.sectionId = block.sectionId;
                objects.push(item);
                block.objects.push(item);
            }
            prev += chanceTypes[c].c;
        }
    };
    World.prototype.distance = function (x1, x2, y1, y2) {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    };
    World.prototype.interactMapObject = function (player, game) {
        var item = this.pickupMapItem(player.sprite, game);
        if (item) {
            var numPicked = player.inventory.pickup(item), numLeft = item.stack - numPicked;
            if (numLeft > 0) {
                item.stack = numLeft;
                this.dropMapItem(item, player.sprite, game);
            }
        }
    };
    World.prototype.pickupMapItem = function (sprite, game) {
        // get space in front of player
        var range = (this.tileSize / 4), x = sprite.x + (sprite.currAnim === 1 ? range : sprite.currAnim === 3 ? -range : 0), y = sprite.y + (sprite.currAnim === 2 ? range : sprite.currAnim === 0 ? -range : 0);
        var blocks = this.getSurroundingBlocks(sprite.x, sprite.y), objects = this.getBlocksObjects(blocks), world = this;
        objects = _.filter(objects, function (o) {
            return o.mapObjectType == 0 /* item */ && o.canPickup;
        });
        if (objects.length > 0) {
            objects = _.sortBy(objects, function (o) {
                return world.distance(x, o.x, y, o.y);
            });
            if (objects[0]) {
                var dist = this.distance(x, objects[0].x, y, objects[0].y);
                console.log(dist);
                if (dist < range) {
                    var invItem = objects[0];
                    if (invItem) {
                        // remove from map
                        objects[0].on.objects = _.reject(objects[0].on.objects, function (o) {
                            return o.id === objects[0].id;
                        });
                        game.objects = _.reject(game.objects, function (o) {
                            return o.id === objects[0].id;
                        });
                        return invItem;
                    }
                }
            }
        }
        return null;
    };
    World.prototype.dropMapItem = function (item, sprite, game) {
        // get space in front of player
        var range = (this.tileSize / 4), x = sprite.x + (sprite.currAnim === 1 ? range : sprite.currAnim === 3 ? -range : 0), y = sprite.y + (sprite.currAnim === 2 ? range : sprite.currAnim === 0 ? -range : 0);
        var block = this.getBlock(x, y);
        item.x = x;
        item.y = y;
        item.on = block;
        item.sectionId = block.sectionId;
        block.objects.push(item);
        game.objects.push(item);
    };
    World.prototype.randShape = function (cx, cy, d, smooth, type, overwrite) {
        var startX = Math.round(cx - d - (d * Math.random())), endX = Math.round(cx + d + (d * Math.random())), startY = cy - d, endY = cy + d, prevPushA = 0, prevPushB = 0;
        startX = startX >= 0 ? startX : 0;
        startX = startX < this.numX ? startX : this.numX - 1;
        endX = endX >= 0 ? endX : 0;
        endX = endX < this.numX ? endX : this.numX - 1;
        startY = startY >= 0 ? startY : 0;
        startY = startY < this.numY ? startY : this.numY - 1;
        endY = endY >= 0 ? endY : 0;
        endY = endY < this.numY ? endY : this.numY - 1;
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
    World.prototype.render = function (objects) {
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                var ctx = this.sections[sy][sx].getContext("2d"), startX = sx * (this.numX / this.sectionsX), endX = startX + (this.numX / this.sectionsX), startY = sy * (this.numY / this.sectionsY), endY = startY + (this.numY / this.sectionsY);
                for (var y = startY; y < endY; y++) {
                    var row = this.grid[y];
                    for (var x = startX; x < endX; x++) {
                        var block = row[x];
                        this.renderBlock(block, sy, sx, ctx, objects);
                    }
                }
            }
        }
        //for (var sy = 0; sy < this.sectionsY; sy++) {
        //    for (var sx = 0; sx < this.sectionsX; sx++) {
        //        $('body').append(this.sections[sy][sx]);
        //    }
        //}
    };
    World.prototype.renderBlock = function (block, ySection, xSection, ctx, objects) {
        var startBlockY = (block.y - (ySection * this.byps)) * this.tileSize, startBlockX = (block.x - (xSection * this.bxps)) * this.tileSize;
        ctx.drawImage(this.tileset, block.type * this.tileSize, 0, this.tileSize, this.tileSize, startBlockX, startBlockY, this.tileSize, this.tileSize);
        var chanceTypes;
        if (block.type === 2 /* beach */) {
            chanceTypes = [
                { c: .005, types: [12 /* rockA */, 13 /* rockB */, 14 /* rockC */, 19 /* bone */] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === 3 /* dirt */) {
            chanceTypes = [
                { c: .01, types: [12 /* rockA */, 13 /* rockB */, 14 /* rockC */, 19 /* bone */] },
                { c: .005, types: [24 /* clay */, 20 /* log */, 21 /* stickA */, 22 /* stickB */] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === 4 /* grass */) {
            chanceTypes = [
                { c: .005, types: [17 /* rocksA */, 18 /* rocksB */, 15 /* rockD */, 16 /* rockE */] },
                { c: .005, types: [19 /* bone */, 24 /* clay */, 23 /* hemp */, 21 /* stickA */, 22 /* stickB */] },
                { c: .1, types: [7 /* grassA */, 8 /* grassB */, 9 /* grassC */, 10 /* grassD */] },
                { c: .01, types: [1 /* berry */, 2 /* bush */, 3 /* fern */, 4 /* flowerA */, 5 /* flowerB */, 6 /* mushroom */, 11 /* plant */, 20 /* log */] },
                { c: .05, types: [0 /* tree */] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === 5 /* rock */) {
            chanceTypes = [
                { c: .05, types: [12 /* rockA */, 13 /* rockB */, 14 /* rockC */] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        //for (var i in block.items) {
        //    var item = block.items[i];
        //    this.placeItem(item.type, ctx, startBlockX + (this.tileSize / 2), startBlockY + (this.tileSize / 2));
        //}
        //else {
        //    //define the colour of the square
        //    ctx.fillStyle = block.bg;
        //    // Draw a square using the fillRect() method and fill it with the colour specified by the fillStyle attribute
        //    ctx.fillRect(block.x * this.tileSize, block.y * this.tileSize, this.tileSize, this.tileSize);
        //}
    };
    World.prototype.refreshCached = function (ySection, xSection) {
        var cachedCtx = this.cached.getContext('2d');
        var cy = 0;
        for (var sy = ySection - 1; sy <= ySection + 1; sy++) {
            var cx = 0;
            for (var sx = xSection - 1; sx <= xSection + 1; sx++) {
                if (this.sections[sy] && this.sections[sy][sx]) {
                    // draw section onto cached
                    cachedCtx.drawImage(this.sections[sy][sx], 0, 0, this.pxps, this.pyps, cx * this.pxps, cy * this.pyps, this.pxps, this.pyps);
                }
                else {
                    // blank section
                    cachedCtx.fillStyle = "#000";
                    cachedCtx.fillRect(cx * this.pxps, cy * this.pyps, this.pxps, this.pyps);
                }
                cx++;
            }
            cy++;
        }
        this.cachedId = ySection + "," + xSection;
    };
    World.prototype.getBlock = function (x, y) {
        var yIndex = Math.floor(y / this.tileSize), xIndex = Math.floor(x / this.tileSize);
        return this.grid[yIndex][xIndex];
    };
    World.prototype.getSurroundingBlocks = function (x, y) {
        var blocks = [], block = this.getBlock(x, y);
        blocks.push(block.upperLeft);
        blocks.push(block.above);
        blocks.push(block.upperRight);
        blocks.push(block.left);
        blocks.push(block);
        blocks.push(block.right);
        blocks.push(block.lowerLeft);
        blocks.push(block.below);
        blocks.push(block.lowerRight);
        return blocks;
    };
    World.prototype.getBlocksObjects = function (blocks) {
        var objects = [];
        for (var b in blocks) {
            if (blocks[b]) {
                for (var o in blocks[b].objects) {
                    objects.push(blocks[b].objects[o]);
                }
            }
        }
        return objects;
    };
    World.prototype.getSectionId = function (x, y, measurement) {
        if (measurement === "p") {
            return Math.floor(y / this.pyps) + "," + Math.floor(x / this.pxps);
        }
        else if (measurement === "b") {
            Math.floor(y / this.byps) + "," + Math.floor(x / this.bxps);
        }
    };
    World.prototype.setNearbyPointers = function (block) {
        block.above = block.y > 0 ? this.grid[block.y - 1][block.x] : null;
        block.below = block.y < this.numY - 1 ? this.grid[block.y + 1][block.x] : null;
        block.left = block.x > 0 ? this.grid[block.y][block.x - 1] : null;
        block.right = block.x < this.numX - 1 ? this.grid[block.y][block.x + 1] : null;
        block.upperLeft = block.x > 0 && block.y > 0 ? this.grid[block.y - 1][block.x - 1] : null;
        block.upperRight = block.x < this.numX - 1 && block.y > 0 ? this.grid[block.y - 1][block.x + 1] : null;
        block.lowerLeft = block.x > 0 && block.y < this.numY - 1 ? this.grid[block.y + 1][block.x - 1] : null;
        block.lowerRight = block.x < this.numX - 1 && block.y < this.numY - 1 ? this.grid[block.y + 1][block.x + 1] : null;
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
    World.prototype.typeIsSet = function (block) {
        return block.type !== undefined && block.type !== null;
    };
    World.prototype.setType = function (block, type) {
        if (type == 0 /* ocean */) {
            block.bg = "#08c";
            block.type = 0 /* ocean */;
        }
        else if (type == 1 /* shallow */) {
            block.bg = "#0af";
            block.type = 1 /* shallow */;
        }
        else if (type == 2 /* beach */) {
            block.bg = "#eda";
            block.type = 2 /* beach */;
        }
        else if (type == 4 /* grass */) {
            block.bg = "#8c3";
            block.type = 4 /* grass */;
        }
        else if (type == 3 /* dirt */) {
            block.bg = "#a95";
            block.type = 3 /* dirt */;
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
            block.type = 7 /* lava */;
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
    return World;
})();
//# sourceMappingURL=world.js.map