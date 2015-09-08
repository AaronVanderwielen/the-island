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
        this.worldCache = {};
        this.tileset = tileset;
        this.itemset = itemset;
        // initialize canvases
        this.sections = [];
        this.createSectionCanvases();
        // world
        this.initGrid();
        this.build();
        this.applyTerrain(objects);
        // cache
        this.cacheSections();
    }
    World.prototype.initGrid = function () {
        this.grid = [];
        // initialize empty blocks in grid
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = {
                    x: x,
                    y: y,
                    objects: [],
                    borders: function (terrain) {
                        return terrain.indexOf(this.above.type) != -1 || terrain.indexOf(this.right.type) != -1 || terrain.indexOf(this.below.type) != -1 || terrain.indexOf(this.left.type) != -1 ||
                            terrain.indexOf(this.upperLeft.type) != -1 || terrain.indexOf(this.upperRight.type) != -1 || terrain.indexOf(this.lowerLeft.type) != -1 || terrain.indexOf(this.lowerRight.type) != -1;
                    }
                };
                if (x === 0) {
                    this.grid[y] = [];
                }
                this.grid[y][x] = block;
            }
        }
        // apply pointers to nearby
        for (var j in this.grid) {
            var row = this.grid[j];
            for (var k in row) {
                var b = row[k];
                this.setNearbyPointers(b);
            }
        }
    };
    World.prototype.createSectionCanvases = function () {
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                if (sx === 0) {
                    this.sections[sy] = [];
                }
                this.sections[sy][sx] = document.createElement('canvas');
                this.sections[sy][sx].width = (this.numX / this.sectionsX) * this.tileSize;
                this.sections[sy][sx].height = (this.numY / this.sectionsX) * this.tileSize;
                var newCanvas = document.createElement('canvas'), sectionId = sy + "," + sx;
                newCanvas.width = this.pxps * 3;
                newCanvas.height = this.pyps * 3;
                newCanvas.ready = false;
                this.worldCache[sectionId] = newCanvas;
            }
        }
    };
    World.prototype.cacheSections = function () {
        for (var ySection = 0; ySection < this.sectionsY; ySection++) {
            for (var xSection = 0; xSection < this.sectionsX; xSection++) {
                var sectionId = ySection + "," + xSection, c = this.worldCache[sectionId], ctx = c.getContext('2d'), cy = 0;
                // draw a 3 section x 3 section block
                for (var sy = ySection - 1; sy <= ySection + 1; sy++) {
                    var cx = 0;
                    for (var sx = xSection - 1; sx <= xSection + 1; sx++) {
                        if (this.sections[sy] && this.sections[sy][sx]) {
                            // draw section onto cached
                            ctx.drawImage(this.sections[sy][sx], 0, 0, this.pxps, this.pyps, cx * this.pxps, cy * this.pyps, this.pxps, this.pyps);
                        }
                        else {
                            // blank section
                            ctx.fillStyle = "#000";
                            ctx.fillRect(cx * this.pxps, cy * this.pyps, this.pxps, this.pyps);
                        }
                        cx++;
                    }
                    cy++;
                }
                c.ready = true;
                this.worldCache[sectionId] = c;
            }
        }
    };
    World.prototype.build = function () {
        this.createOcean();
        this.createBeach();
        this.createMountain();
        // fill with dirt
        this.fill(this.gradientSize * 4, this.numX - (this.gradientSize * 4), this.gradientSize * 4, this.numY - (this.gradientSize * 4), TerrainType.dirt, false);
        // add grass patches to dirt randomly
        this.createGrass(.03, 5);
        this.createRiversAndLakes(.005, .002);
    };
    World.prototype.createOcean = function () {
        // create deep water
        this.layerEmptyTop(0, this.numX, 0, TerrainType.ocean, TerrainType.shallow, true);
        this.layerEmptyRight(this.numX - 1, 0, this.numY, TerrainType.ocean, TerrainType.shallow, true);
        this.layerEmptyBelow(0, this.numX, this.numY - 1, TerrainType.ocean, TerrainType.shallow, true);
        this.layerEmptyLeft(0, 0, this.numY, TerrainType.ocean, TerrainType.shallow, true);
        // shallow water/start of beach
        this.layerEmptyTop(this.gradientSize, this.numX - this.gradientSize, this.gradientSize, TerrainType.shallow, TerrainType.beach);
        this.layerEmptyRight(this.numX - this.gradientSize - 1, this.gradientSize, this.numY - this.gradientSize, TerrainType.shallow, TerrainType.beach);
        this.layerEmptyBelow(this.gradientSize, this.numX - this.gradientSize, this.numY - this.gradientSize - 1, TerrainType.shallow, TerrainType.beach);
        this.layerEmptyLeft(this.gradientSize, this.gradientSize, this.numY - this.gradientSize, TerrainType.shallow, TerrainType.beach);
    };
    World.prototype.createBeach = function () {
        var gOffset = 3;
        this.layerEmptyTop(this.gradientSize * gOffset, this.numX - (this.gradientSize * gOffset) + 1, this.gradientSize * gOffset, TerrainType.beach, TerrainType.dirt);
        this.layerEmptyRight(this.numX - 1 - (this.gradientSize * gOffset), this.gradientSize * gOffset, this.numY - (this.gradientSize * gOffset), TerrainType.beach, TerrainType.dirt);
        this.layerEmptyBelow(this.gradientSize * gOffset, this.numX - (this.gradientSize * gOffset) + 1, this.numY - 1 - (this.gradientSize * gOffset), TerrainType.beach, TerrainType.dirt);
        this.layerEmptyLeft(this.gradientSize * gOffset, this.gradientSize * gOffset, this.numY - (this.gradientSize * gOffset) + 1, TerrainType.beach, TerrainType.dirt);
    };
    World.prototype.createGrass = function (chance, size) {
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = this.grid[y][x];
                if (block.type === TerrainType.dirt) {
                    // roll for grass
                    var rand = Math.random();
                    if (rand <= chance) {
                        this.randShape(x, y, Math.round(Math.random() * size), 1, TerrainType.grass, [TerrainType.dirt]);
                    }
                }
            }
        }
    };
    World.prototype.createMountain = function () {
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), this.gradientSize * 4, 1, TerrainType.rock);
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), this.gradientSize * 2, 1, TerrainType.mountain, [TerrainType.rock]);
        this.randShape(Math.round(this.numX / 2), Math.round(this.numY / 2), Math.round(this.gradientSize / 3), 1, TerrainType.lava, [TerrainType.mountain]);
    };
    World.prototype.createRiversAndLakes = function (riverChance, lakeChance) {
        for (var y = 0; y < this.numY; y++) {
            if (y < this.gradientSize * 3 || y > this.numY - (this.gradientSize * 3)) {
                for (var x = 0; x < this.numX; x++) {
                    if (x < this.gradientSize * 3 || x > this.numX - (this.gradientSize * 3)) {
                        var block = this.grid[y][x];
                        if (block.type === TerrainType.shallow) {
                            // roll for river
                            var riverRoll = Math.random();
                            if (riverRoll <= riverChance) {
                                console.log('river starting at ' + y + ',' + x);
                                // now snake towards mountain
                                var distX = (this.numX / 3) - block.x, distY = (this.numY / 2) - block.y, nextX = block.x, nextY = block.y, prevDir = (block.x > this.gradientSize * 4 && block.x < this.numX - this.gradientSize * 4) ? 'y' : 'x', nextBlock = block;
                                while ((distX !== 0 || distY !== 0) && block.type !== TerrainType.mountain) {
                                    // roll for lake
                                    var lakeRoll = Math.random();
                                    if (lakeRoll <= lakeChance) {
                                        console.log('river ending with lake at ' + nextBlock.y + ',' + nextBlock.x);
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(Math.random() * (this.gradientSize)), 1, TerrainType.ocean, [TerrainType.shallow, TerrainType.beach, TerrainType.dirt, TerrainType.grass, TerrainType.rock]);
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(this.gradientSize + (Math.random() * this.gradientSize)), 1, TerrainType.shallow, [TerrainType.beach, TerrainType.dirt, TerrainType.grass, TerrainType.rock]);
                                        break;
                                    }
                                    else {
                                        this.randShape(nextBlock.x, nextBlock.y, Math.ceil(Math.random() * (this.gradientSize / 2)), 0, TerrainType.shallow, [TerrainType.beach, TerrainType.dirt, TerrainType.grass, TerrainType.rock]);
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
                if (block.type == TerrainType.grass && !block.borders([TerrainType.shallow])) {
                    // roll for lake
                    var roll = Math.random();
                    if (roll < lakeChance) {
                        console.log("creating lake at " + block.y + ',' + block.x);
                        this.randShape(block.x, block.y, Math.ceil(Math.random() * (this.gradientSize)), 1, TerrainType.ocean, [TerrainType.shallow, TerrainType.beach, TerrainType.dirt, TerrainType.grass, TerrainType.rock]);
                        this.randShape(block.x, block.y, Math.ceil(this.gradientSize + (Math.random() * this.gradientSize)), 1, TerrainType.shallow, [TerrainType.beach, TerrainType.dirt, TerrainType.grass, TerrainType.rock]);
                    }
                }
            }
        }
    };
    World.prototype.rollForItem = function (block, chanceTypes, objects) {
        // roll for chance
        var rand = Math.random(), prev = 0;
        // chance types = [{ c: .1, types: [] }]
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
        objects = _.filter(objects, function (o) { return o.mapObjectType == MapObjectType.item && o.canPickup; });
        if (objects.length > 0) {
            objects = _.sortBy(objects, function (o) { return world.distance(x, o.x, y, o.y); });
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
            // for n of smooth, make this next one closer previous
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
            // loop through min * 2 for x and set the ocean/beach values
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
    World.prototype.applyTerrain = function (objects) {
        for (var sy = 0; sy < this.sectionsY; sy++) {
            for (var sx = 0; sx < this.sectionsX; sx++) {
                var ctx = this.sections[sy][sx].getContext("2d"), startX = sx * (this.numX / this.sectionsX), endX = startX + (this.numX / this.sectionsX), startY = sy * (this.numY / this.sectionsY), endY = startY + (this.numY / this.sectionsY);
                for (var y = startY; y < endY; y++) {
                    var row = this.grid[y];
                    for (var x = startX; x < endX; x++) {
                        var block = row[x];
                        block.sectionId = sy + "," + sx;
                        this.blockInitialization(block, sy, sx, ctx, objects);
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
    World.prototype.blockInitialization = function (block, ySection, xSection, ctx, objects) {
        var startBlockY = (block.y - (ySection * this.byps)) * this.tileSize, startBlockX = (block.x - (xSection * this.bxps)) * this.tileSize;
        ctx.drawImage(this.tileset, block.type * this.tileSize, 0, this.tileSize, this.tileSize, startBlockX, startBlockY, this.tileSize, this.tileSize);
        var chanceTypes;
        if (block.type === TerrainType.beach) {
            chanceTypes = [
                { c: .005, types: [ItemType.rockA, ItemType.rockB, ItemType.rockC, ItemType.bone] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === TerrainType.dirt) {
            chanceTypes = [
                { c: .01, types: [ItemType.rockA, ItemType.rockB, ItemType.rockC, ItemType.bone] },
                { c: .005, types: [ItemType.clay, ItemType.log, ItemType.stickA, ItemType.stickB] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === TerrainType.grass) {
            chanceTypes = [
                { c: .005, types: [ItemType.rocksA, ItemType.rocksB, ItemType.rockD, ItemType.rockE] },
                { c: .005, types: [ItemType.bone, ItemType.clay, ItemType.hemp, ItemType.stickA, ItemType.stickB] },
                { c: .1, types: [ItemType.grassA, ItemType.grassB, ItemType.grassC, ItemType.grassD] },
                { c: .01, types: [ItemType.berry, ItemType.bush, ItemType.fern, ItemType.flowerA, ItemType.flowerB, ItemType.mushroom, ItemType.plant, ItemType.log] },
                { c: .05, types: [ItemType.tree] }
            ];
            this.rollForItem(block, chanceTypes, objects);
        }
        else if (block.type === TerrainType.rock) {
            chanceTypes = [
                { c: .05, types: [ItemType.rockA, ItemType.rockB, ItemType.rockC] }
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
    World.prototype.getSurroundingSections = function (currSection) {
        var sy = parseInt(currSection.split(",")[0]), sx = parseInt(currSection.split(",")[1]), sections = [];
        sections.push(currSection);
        sections.push(sy + "," + (sx - 1));
        sections.push(sy + "," + (sx + 1));
        sections.push((sy - 1) + "," + sx);
        sections.push((sy - 1) + "," + (sx - 1));
        sections.push((sy - 1) + "," + (sx + 1));
        sections.push((sy + 1) + "," + sx);
        sections.push((sy + 1) + "," + (sx - 1));
        sections.push((sy + 1) + "," + (sx + 1));
        return sections;
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
            return Math.floor(y / this.byps) + "," + Math.floor(x / this.bxps);
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
        if (type == TerrainType.ocean) {
            block.bg = "#08c";
            block.type = TerrainType.ocean;
        }
        else if (type == TerrainType.shallow) {
            block.bg = "#0af";
            block.type = TerrainType.shallow;
        }
        else if (type == TerrainType.beach) {
            block.bg = "#eda";
            block.type = TerrainType.beach;
        }
        else if (type == TerrainType.grass) {
            block.bg = "#8c3";
            block.type = TerrainType.grass;
        }
        else if (type == TerrainType.dirt) {
            block.bg = "#a95";
            block.type = TerrainType.dirt;
        }
        else if (type == TerrainType.rock) {
            block.bg = "#aaa";
            block.type = TerrainType.rock;
        }
        else if (type == TerrainType.mountain) {
            block.bg = "#444";
            block.type = TerrainType.mountain;
        }
        else if (type == TerrainType.lava) {
            block.bg = "#600";
            block.type = TerrainType.lava;
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
