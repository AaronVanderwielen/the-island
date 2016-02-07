define(["require", "exports", 'mapObject', 'map'], function (require, exports, MapObject, Map) {
    (function (TerrainType) {
        TerrainType[TerrainType["ocean"] = 0] = "ocean";
        TerrainType[TerrainType["shallow"] = 1] = "shallow";
        TerrainType[TerrainType["beach"] = 2] = "beach";
        TerrainType[TerrainType["dirt"] = 3] = "dirt";
        TerrainType[TerrainType["grass"] = 4] = "grass";
        TerrainType[TerrainType["rock"] = 5] = "rock";
        TerrainType[TerrainType["mountain"] = 6] = "mountain";
        TerrainType[TerrainType["lava"] = 7] = "lava";
    })(exports.TerrainType || (exports.TerrainType = {}));
    var TerrainType = exports.TerrainType;
    var World = (function () {
        function World(x, y, tileSize, gradientSize) {
            this.numX = x;
            this.numY = y;
            //// sections are 25b x 25b
            //this.bxps = 25;
            //this.byps = 25;
            this.tileSize = tileSize;
            this.gradientSize = gradientSize;
            //// create cached canvas--will be used to hold 3 x 3 sections, updated on section change
            //// this is where the viewport is extracted from
            //this.worldCache = {};
            //// initialize canvases
            //this.sections = [];
            //this.createSectionCanvases();
            // world
            this.initGrid();
            this.build();
            this.createMapObjects();
        }
        World.prototype.initGrid = function () {
            // init grid
            this.map = new Map.Map(this.numX, this.numY, this.tileSize);
            this.map.grid = [];
            // initialize empty blocks in grid
            for (var y = 0; y < this.numY; y++) {
                for (var x = 0; x < this.numX; x++) {
                    var block = {
                        x: x,
                        y: y,
                        objects: []
                    };
                    if (x === 0) {
                        this.map.grid[y] = [];
                    }
                    this.map.grid[y][x] = block;
                }
            }
            // apply pointers to nearby
            //for (var j in this.map.grid) {
            //    var row = this.map.grid[j];
            //    for (var k in row) {
            //        var b = row[k];
            //        this.setNearbyPointers(b);
            //    }
            //}
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
                    var block = this.map.grid[y][x];
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
                            var block = this.map.grid[y][x];
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
                                            nextBlock = this.map.grid[nextY][nextX];
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
                    var block = this.map.grid[y][x];
                    if (block.type == TerrainType.grass) {
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
        World.prototype.rollForItem = function (block, chanceTypes) {
            // roll for chance
            var rand = Math.random(), prev = 0;
            // chance types = [{ c: .1, types: [] }]
            for (var c in chanceTypes) {
                if (rand >= prev && rand <= prev + chanceTypes[c].c) {
                    // now pick random item
                    var itemType = chanceTypes[c].types[Math.round(Math.random() * (chanceTypes[c].types.length - 1))], item = new MapObject.MapItem(itemType);
                    item.x = item.width >= (this.tileSize / 2) ? block.x * this.tileSize + (this.tileSize / 2) : block.x * this.tileSize + (this.tileSize / 2);
                    item.y = item.height >= (this.tileSize / 2) ? block.y * this.tileSize + (this.tileSize / 2) : block.y * this.tileSize + (this.tileSize / 2);
                    item.blockX = block.x;
                    item.blockY = block.y;
                    item.sectionId = block.sectionId;
                    this.map.objects.push(item);
                    block.objects.push(item);
                }
                prev += chanceTypes[c].c;
            }
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
                    if (!this.typeIsSet(this.map.grid[y][x]) || (overwrite && overwrite.indexOf(this.map.grid[y][x].type) > -1)) {
                        // if y is center or y is higher but greater than even or y is lower but less than even, make type
                        if ((y == cy && (evenedA > 0 || evenedB > 0)) || (y < cy && y >= cy - evenedA) || (y > cy && y <= cy + evenedB)) {
                            this.setType(this.map.grid[y][x], type);
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
                    if (overwrite || !this.typeIsSet(this.map.grid[y][x])) {
                        if (y < startY + this.gradientSize + middle) {
                            this.setType(this.map.grid[y][x], type);
                        }
                        else if (fillType && this.map.grid[y][x].type != type) {
                            this.setType(this.map.grid[y][x], fillType);
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
                    if (overwrite || !this.typeIsSet(this.map.grid[y][x])) {
                        if (x > startX - (this.gradientSize + middle)) {
                            this.setType(this.map.grid[y][x], type);
                        }
                        else if (fillType && this.map.grid[y][x].type != type) {
                            this.setType(this.map.grid[y][x], fillType);
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
                    if (overwrite || !this.typeIsSet(this.map.grid[y][x])) {
                        if (y > startY - (this.gradientSize + middle)) {
                            this.setType(this.map.grid[y][x], type);
                        }
                        else if (fillType && this.map.grid[y][x].type != type) {
                            this.setType(this.map.grid[y][x], fillType);
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
                    if (overwrite || !this.typeIsSet(this.map.grid[y][x])) {
                        if (x < startX + this.gradientSize + middle) {
                            this.setType(this.map.grid[y][x], type);
                        }
                        else if (fillType && this.map.grid[y][x].type != type) {
                            this.setType(this.map.grid[y][x], fillType);
                        }
                    }
                }
                prevPush = push;
            }
        };
        World.prototype.createMapObjects = function () {
            for (var sy = 0; sy < this.map.sectionsY; sy++) {
                for (var sx = 0; sx < this.map.sectionsX; sx++) {
                    var startX = sx * (this.numX / this.map.sectionsX), endX = startX + (this.numX / this.map.sectionsX), startY = sy * (this.numY / this.map.sectionsY), endY = startY + (this.numY / this.map.sectionsY);
                    for (var y = startY; y < endY; y++) {
                        var row = this.map.grid[y];
                        for (var x = startX; x < endX; x++) {
                            var block = row[x];
                            var chanceTypes;
                            if (block.type === TerrainType.beach) {
                                chanceTypes = [
                                    { c: .005, types: [MapObject.ItemType.rockA, MapObject.ItemType.rockB, MapObject.ItemType.rockC, MapObject.ItemType.bone] }
                                ];
                                this.rollForItem(block, chanceTypes);
                            }
                            else if (block.type === TerrainType.dirt) {
                                chanceTypes = [
                                    { c: .01, types: [MapObject.ItemType.rockA, MapObject.ItemType.rockB, MapObject.ItemType.rockC, MapObject.ItemType.bone] },
                                    { c: .005, types: [MapObject.ItemType.clay, MapObject.ItemType.log, MapObject.ItemType.stickA, MapObject.ItemType.stickB] }
                                ];
                                this.rollForItem(block, chanceTypes);
                            }
                            else if (block.type === TerrainType.grass) {
                                chanceTypes = [
                                    { c: .005, types: [MapObject.ItemType.rocksA, MapObject.ItemType.rocksB, MapObject.ItemType.rockD, MapObject.ItemType.rockE] },
                                    { c: .005, types: [MapObject.ItemType.bone, MapObject.ItemType.clay, MapObject.ItemType.hemp, MapObject.ItemType.stickA, MapObject.ItemType.stickB] },
                                    { c: .1, types: [MapObject.ItemType.grassA, MapObject.ItemType.grassB, MapObject.ItemType.grassC, MapObject.ItemType.grassD] },
                                    { c: .01, types: [MapObject.ItemType.berry, MapObject.ItemType.bush, MapObject.ItemType.fern, MapObject.ItemType.flowerA, MapObject.ItemType.flowerB, MapObject.ItemType.mushroom, MapObject.ItemType.plant, MapObject.ItemType.log] },
                                    { c: .05, types: [MapObject.ItemType.tree] }
                                ];
                                this.rollForItem(block, chanceTypes);
                            }
                            else if (block.type === TerrainType.rock) {
                                chanceTypes = [
                                    { c: .05, types: [MapObject.ItemType.rockA, MapObject.ItemType.rockB, MapObject.ItemType.rockC] }
                                ];
                                this.rollForItem(block, chanceTypes);
                            }
                        }
                    }
                }
            }
        };
        //setNearbyPointers(block) {
        //    block.above = block.y > 0 ? this.map.grid[block.y - 1][block.x] : null;
        //    block.below = block.y < this.numY - 1 ? this.map.grid[block.y + 1][block.x] : null;
        //    block.left = block.x > 0 ? this.map.grid[block.y][block.x - 1] : null;
        //    block.right = block.x < this.numX - 1 ? this.map.grid[block.y][block.x + 1] : null;
        //    block.upperLeft = block.x > 0 && block.y > 0 ? this.map.grid[block.y - 1][block.x - 1] : null;
        //    block.upperRight = block.x < this.numX - 1 && block.y > 0 ? this.map.grid[block.y - 1][block.x + 1] : null;
        //    block.lowerLeft = block.x > 0 && block.y < this.numY - 1 ? this.map.grid[block.y + 1][block.x - 1] : null;
        //    block.lowerRight = block.x < this.numX - 1 && block.y < this.numY - 1 ? this.map.grid[block.y + 1][block.x + 1] : null;
        //}
        World.prototype.fill = function (startX, endX, startY, endY, fillType, overwrite) {
            for (var y = startY; y < endY; y++) {
                for (var x = startX; x < endX; x++) {
                    if (overwrite || !this.typeIsSet(this.map.grid[y][x])) {
                        this.setType(this.map.grid[y][x], fillType);
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
    exports.World = World;
});
//# sourceMappingURL=worldbuilder.js.map