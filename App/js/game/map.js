define(["require", "exports", 'mapObject'], function (require, exports, MapObject) {
    var Map = (function () {
        function Map(numX, numY, tileSize) {
            // sections are 25b x 25b
            this.bxps = 25;
            this.byps = 25;
            this.numX = numX;
            this.numY = numY;
            this.tileSize = tileSize;
            this.sectionsX = this.numX / this.bxps;
            this.sectionsY = this.numY / this.byps;
            this.pyps = this.byps * this.tileSize; // pixels y per section,
            this.pxps = this.bxps * this.tileSize; // pixels x per section
            this.objects = [];
            this.sprites = [];
        }
        Map.getSectionId = function (map, x, y, measurement) {
            if (measurement === "p") {
                return Math.floor(y / map.pyps) + "," + Math.floor(x / map.pxps);
            }
            else if (measurement === "b") {
                return Math.floor(y / map.byps) + "," + Math.floor(x / map.bxps);
            }
        };
        Map.addSprite = function (map, sprite) {
            sprite.x = 2000;
            sprite.y = 2000;
            map.sprites.push(sprite);
        };
        //interactMapObject(player: Player.Player) {
        //    // attempt to pick something up
        //    var item = this.removeMapItem(player.sprite.y, player.sprite.x, player.sprite.currAnim);
        //    if (item) {
        //        var numPicked = player.inventory.pickup(item),
        //            numLeft = item.stack - numPicked;
        //        if (numLeft > 0) {
        //            item.stack = numLeft;
        //            // drop
        //            this.receiveMapItem(item, player.sprite.y, player.sprite.x, player.sprite.currAnim);
        //        }
        //    }
        //}
        Map.removeMapItem = function (map, y, x, currAnim) {
            var range = (map.tileSize / 4);
            // get space in front of player
            x += currAnim === 1 ? range : (currAnim === 3 ? -range : 0);
            y += currAnim === 2 ? range : (currAnim === 0 ? -range : 0);
            var blocks = Map.getSurroundingBlocks(map, x, y), objects = Map.getBlocksObjects(map, blocks);
            objects = _.filter(objects, function (o) { return o.mapObjectType == MapObject.MapObjectType.item && o.canPickup; });
            if (objects.length > 0) {
                objects = _.sortBy(objects, function (o) { return Map.distance(map, x, o.x, y, o.y); });
                if (objects[0]) {
                    var dist = Map.distance(map, x, objects[0].x, y, objects[0].y);
                    console.log(dist);
                    if (dist < range) {
                        var invItem = objects[0];
                        if (invItem) {
                            var block = Map.getBlock(map, objects[0].blockX, objects[0].blockY);
                            // remove from map
                            block.objects = _.reject(block.objects, function (o) {
                                return o.id === objects[0].id;
                            });
                            map.objects = _.reject(map.objects, function (o) {
                                return o.id === objects[0].id;
                            });
                            return invItem;
                        }
                    }
                }
            }
            return null;
        };
        Map.receiveMapItem = function (map, item, y, x, currAnim) {
            var range = (map.tileSize / 4);
            // get space in front of player
            x += currAnim === 1 ? range : (currAnim === 3 ? -range : 0);
            y += currAnim === 2 ? range : (currAnim === 0 ? -range : 0);
            var block = Map.getBlock(map, x, y);
            item.x = x;
            item.y = y;
            item.blockX = block.x;
            item.blockY = block.y;
            item.sectionId = block.sectionId;
            block.objects.push(item);
            map.objects.push(item);
        };
        Map.distance = function (map, x1, x2, y1, y2) {
            return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
        };
        Map.getBlock = function (map, x, y) {
            var yIndex = Math.floor(y / map.tileSize), xIndex = Math.floor(x / map.tileSize);
            return map.grid[yIndex][xIndex];
        };
        Map.blockBorders = function (map, block, terrain) {
            var surroundingBlocks = Map.getBlockSurroundingBlocks(map, block);
            for (var t in terrain) {
                var anyThisType = _.some(surroundingBlocks, function (b) {
                    return b.type === terrain[t];
                });
                if (anyThisType)
                    return true;
            }
            return false;
        };
        Map.getBlockSurroundingBlocks = function (map, block) {
            return Map.getSurroundingBlocks(map, block.x * map.tileSize, block.y * map.tileSize);
        };
        Map.getSurroundingBlocks = function (map, pixelsX, pixelsY) {
            var blocks = [], block = Map.getBlock(map, pixelsX, pixelsY), upperLeft = map.grid[block.y - 1][block.x - 1], above = map.grid[block.y - 1][block.x], upperRight = map.grid[block.y - 1][block.x + 1], left = map.grid[block.y][block.x - 1], right = map.grid[block.y][block.x + 1], lowerLeft = map.grid[block.y + 1][block.x - 1], below = map.grid[block.y + 1][block.x], lowerRight = map.grid[block.y + 1][block.x + 1];
            blocks.push(upperLeft);
            blocks.push(above);
            blocks.push(upperRight);
            blocks.push(left);
            blocks.push(block);
            blocks.push(right);
            blocks.push(lowerLeft);
            blocks.push(below);
            blocks.push(lowerRight);
            return blocks;
        };
        Map.getSurroundingSections = function (currSection) {
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
        Map.getBlocksObjects = function (map, blocks) {
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
        Map.getRandomBeachWaterfrontBlock = function () {
        };
        return Map;
    })();
    exports.Map = Map;
});
//# sourceMappingURL=map.js.map