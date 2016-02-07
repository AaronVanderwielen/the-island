define(["require", "exports", 'worldbuilder', 'map', 'mapObject', 'sprite'], function (require, exports, World, Map, MapObject, Sprite) {
    var MapRender = (function () {
        function MapRender(map) {
            this.map = map;
            // create cached canvas--will be used to hold 3 x 3 sections, updated on section change
            // this is where the viewport is extracted from
            this.mapCache = {};
            // initialize canvases
            this.sections = [];
            this.createSectionCanvases();
        }
        MapRender.prototype.createSectionCanvases = function () {
            for (var sy = 0; sy < this.map.sectionsY; sy++) {
                for (var sx = 0; sx < this.map.sectionsX; sx++) {
                    if (sx === 0) {
                        this.sections[sy] = [];
                    }
                    this.sections[sy][sx] = document.createElement('canvas');
                    this.sections[sy][sx].width = (this.map.numX / this.map.sectionsX) * this.map.tileSize;
                    this.sections[sy][sx].height = (this.map.numY / this.map.sectionsX) * this.map.tileSize;
                    var newCanvas = document.createElement('canvas'), sectionId = sy + "," + sx;
                    newCanvas.width = this.map.pxps * 3;
                    newCanvas.height = this.map.pyps * 3;
                    newCanvas['ready'] = false;
                    this.mapCache[sectionId] = newCanvas;
                }
            }
        };
        MapRender.prototype.initialize = function (tileset) {
            this.applyTerrain(tileset);
            this.cacheSections();
        };
        MapRender.prototype.cacheSections = function () {
            for (var ySection = 0; ySection < this.map.sectionsY; ySection++) {
                for (var xSection = 0; xSection < this.map.sectionsX; xSection++) {
                    var sectionId = ySection + "," + xSection, c = this.mapCache[sectionId], ctx = c.getContext('2d'), cy = 0;
                    // draw a 3 section x 3 section block
                    for (var sy = ySection - 1; sy <= ySection + 1; sy++) {
                        var cx = 0;
                        for (var sx = xSection - 1; sx <= xSection + 1; sx++) {
                            if (this.sections[sy] && this.sections[sy][sx]) {
                                // draw section onto cached
                                ctx.drawImage(this.sections[sy][sx], 0, 0, this.map.pxps, this.map.pyps, cx * this.map.pxps, cy * this.map.pyps, this.map.pxps, this.map.pyps);
                            }
                            else {
                                // blank section
                                ctx.fillStyle = "#000";
                                ctx.fillRect(cx * this.map.pxps, cy * this.map.pyps, this.map.pxps, this.map.pyps);
                            }
                            cx++;
                        }
                        cy++;
                    }
                    c['ready'] = true;
                    this.mapCache[sectionId] = c;
                }
            }
        };
        MapRender.prototype.applyTerrain = function (tileset) {
            for (var sy = 0; sy < this.map.sectionsY; sy++) {
                for (var sx = 0; sx < this.map.sectionsX; sx++) {
                    var ctx = this.sections[sy][sx].getContext("2d"), startX = sx * (this.map.numX / this.map.sectionsX), endX = startX + (this.map.numX / this.map.sectionsX), startY = sy * (this.map.numY / this.map.sectionsY), endY = startY + (this.map.numY / this.map.sectionsY);
                    for (var y = startY; y < endY; y++) {
                        var row = this.map.grid[y];
                        for (var x = startX; x < endX; x++) {
                            var block = row[x];
                            block.sectionId = sy + "," + sx;
                            this.renderBlockTerrain(block, sy, sx, ctx, tileset);
                        }
                    }
                }
            }
        };
        MapRender.prototype.renderBlockTerrain = function (block, ySection, xSection, ctx, tileset) {
            var startBlockY = (block.y - (ySection * this.map.byps)) * this.map.tileSize, startBlockX = (block.x - (xSection * this.map.bxps)) * this.map.tileSize;
            ctx.drawImage(tileset, block.type * this.map.tileSize, 0, this.map.tileSize, this.map.tileSize, startBlockX, startBlockY, this.map.tileSize, this.map.tileSize);
        };
        return MapRender;
    })();
    exports.MapRender = MapRender;
    var GameRender = (function () {
        function GameRender(canvas, resX, resY) {
            this.resX = resX;
            this.resY = resY;
            this.rendering = false;
            this.canvas = canvas;
            this.canvas.width = resX;
            this.canvas.height = resY;
            this.ctx = canvas.getContext('2d');
            this.assets = [
                { id: 'char', src: '/img/char.png' },
                { id: 'terrain', src: "/img/terrain.png" },
                { id: 'items', src: "/img/itemset.png" }
            ];
            this.imgCache = [];
        }
        GameRender.prototype.getCachedImgSet = function (key) {
            var obj = this;
            return _.find(obj.imgCache, function (i) {
                return i.id === key;
            });
        };
        GameRender.prototype.getAssetById = function (id) {
            var asset = _.find(this.assets, function (a) {
                return a.id === id;
            });
            return asset;
        };
        GameRender.prototype.loadAssets = function (callback) {
            var queue = new createjs.LoadQueue(), obj = this;
            queue.on("fileload", handleAssetLoaded);
            queue.on("complete", handleComplete);
            for (var a in obj.assets) {
                queue.loadFile({ id: obj.assets[a].id, src: obj.assets[a].src });
            }
            function handleAssetLoaded(event) {
                var asset = obj.getAssetById(event.item.id);
                asset.value = event.result;
            }
            function handleComplete() {
                obj.importSpriteSet();
                obj.importMapObjectsSet();
                callback();
            }
        };
        GameRender.prototype.importSpriteSet = function () {
            var obj = this;
            //for (var i in spriteIds) {
            var imgId = 'char'; //spriteIds[i];
            if (!_.some(obj.imgCache, function (i) { return i.id === imgId; })) {
                var asset = obj.getAssetById(imgId);
                obj.cacheSprite(imgId, asset.value);
            }
            //}
        };
        GameRender.prototype.cacheSprite = function (imgId, charset) {
            var obj = this, charsetData = [
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null] // left
            ];
            for (var y = 0; y < 4; y++) {
                for (var x = 0; x < 3; x++) {
                    var canvas = document.createElement('canvas'), ctx = canvas.getContext("2d"), offsetx = Sprite.Sprite.width * x, offsety = Sprite.Sprite.height * y, splicedImg = new Image();
                    canvas.width = Sprite.Sprite.width;
                    canvas.height = Sprite.Sprite.height;
                    // sourceImage, sourceOffsetX, sourceOffsetY, chunkSizeX, chunkSizeY, canvasPlacementX, canvasPlacementY, newSizeX, newSizeY)
                    ctx.drawImage(charset, offsetx, offsety, Sprite.Sprite.width, Sprite.Sprite.height, 0, 0, Sprite.Sprite.width, Sprite.Sprite.height);
                    splicedImg.src = canvas.toDataURL('image/png');
                    charsetData[y][x] = splicedImg;
                }
            }
            var imgData = {
                id: imgId,
                value: charsetData
            };
            obj.imgCache.push(imgData);
        };
        GameRender.prototype.importMapObjectsSet = function () {
            var obj = this, asset = obj.getAssetById('items');
            for (var item in MapObject.ItemType) {
                var imgId = MapObject.MapItem.mapItemKey(item);
                if (!_.some(obj.imgCache, function (i) { return i.id === imgId; })) {
                    obj.cacheMapObject(asset.value, item);
                }
            }
        };
        GameRender.prototype.cacheMapObject = function (itemSet, itemType) {
            // cache imported img set if not already there
            var obj = this, imgId = MapObject.MapItem.mapItemKey(itemType);
            var itemImgData = [
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null] // left
            ];
            var canvas = $('<canvas>')[0], ctx = canvas.getContext('2d'), data = MapObject.MapItem.getItemData(itemType), width = (data.width * 50) * data.multiplier, height = (data.height * 50) * data.multiplier, splicedImg = new Image();
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(itemSet, data.x * 32, data.y * 32, data.width * 32, data.height * 32, 0, 0, width, height);
            splicedImg.src = canvas.toDataURL('image/png');
            itemImgData[0][0] = splicedImg;
            var imgData = {
                id: imgId,
                value: itemImgData
            };
            obj.imgCache.push(imgData);
        };
        GameRender.prototype.refresh = function (gameData, x, y) {
            var obj = this;
            if (!obj.rendering) {
                obj.rendering = true;
                var start = new Date(), duration;
                obj.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                obj.moveViewCenter(x, y);
                obj.renderView(gameData, x, y);
                obj.drawMapObjects(gameData, x, y);
                obj.rendering = false;
                duration = new Date().getTime() - start.getTime();
                return duration;
            }
            return -1;
        };
        GameRender.prototype.moveViewCenter = function (x, y) {
            var newStartX = x - (this.resX / 2), newEndX = newStartX + this.resX, newStartY = y - (this.resY / 2), newEndY = newStartY + this.resY;
            this.view = {
                startX: newStartX,
                endX: newEndX,
                startY: newStartY,
                endY: newEndY
            };
        };
        GameRender.prototype.renderView = function (gameData, x, y) {
            var obj = this, ctx = obj.canvas.getContext("2d"), ySection = Math.floor(y / gameData.pyps), xSection = Math.floor(x / gameData.pxps), currSectionId = ySection + "," + xSection, cachedStartY = obj.view.startY - ((ySection - 1) * gameData.pyps), cachedStartX = obj.view.startX - ((xSection - 1) * gameData.pxps);
            // logging
            var info = document.getElementById('view');
            info.innerHTML = currSectionId;
            ctx.drawImage(obj.mapRender.mapCache[currSectionId], cachedStartX, cachedStartY, obj.resX, obj.resY, 0, 0, obj.resX, obj.resY);
        };
        GameRender.prototype.initialMapRender = function () {
            var tileset = this.getAssetById('terrain').value;
            this.mapRender.initialize(tileset);
        };
        GameRender.prototype.drawMapObjects = function (gameDataLight, x, y) {
            var obj = this;
            // sort by z index
            gameDataLight.drawObjects = _.sortBy(gameDataLight.drawObjects, function (o) {
                var sortBy = o.z.toString();
                if (o.mapObjectType == MapObject.MapObjectType.sprite)
                    sortBy += (o.passing ? "0" : "2");
                else
                    sortBy += "1";
                return sortBy;
            });
            // draw
            for (var o in gameDataLight.drawObjects) {
                if (gameDataLight.drawObjects[o].mapObjectType == MapObject.MapObjectType.sprite) {
                    obj.drawSprite(gameDataLight.drawObjects[o]);
                }
                else if (gameDataLight.drawObjects[o].mapObjectType == MapObject.MapObjectType.item) {
                    obj.drawMapItem(gameDataLight.drawObjects[o]);
                }
            }
        };
        GameRender.prototype.drawSprite = function (sprite) {
            var obj = this, block = Map.Map.getBlock(obj.mapRender.map, sprite.x, sprite.y), offsetX = sprite.x - (Sprite.Sprite.width / 2.2), offsetY = sprite.y - (.9 * Sprite.Sprite.height), centeredX = offsetX - obj.view.startX, centeredY = offsetY - obj.view.startY, imgSet = obj.getCachedImgSet('char'), img = imgSet.value[sprite.currAnim][sprite.currStep];
            if (block.type === World.TerrainType.shallow || block.type === World.TerrainType.ocean) {
                var bordersLand = Map.Map.blockBorders(obj.mapRender.map, block, [World.TerrainType.beach, World.TerrainType.dirt, World.TerrainType.grass, World.TerrainType.rock]), bordersOcean = Map.Map.blockBorders(obj.mapRender.map, block, [World.TerrainType.ocean]);
                if ((bordersLand && bordersOcean) || (!bordersLand && !bordersOcean)) {
                    sprite.yAdjust = .75;
                }
                else if (bordersLand) {
                    sprite.yAdjust = .85;
                }
                else if (bordersOcean) {
                    sprite.yAdjust = .65;
                }
            }
            else {
                sprite.yAdjust = 1;
            }
            obj.ctx.drawImage(img, 0, 0, Sprite.Sprite.width, Sprite.Sprite.height * sprite.yAdjust, centeredX, centeredY, Sprite.Sprite.width, Sprite.Sprite.height * sprite.yAdjust);
        };
        GameRender.prototype.drawMapItem = function (mObj) {
            var obj = this, offsetX = (mObj.x - obj.view.startX) - (mObj.width / 2), offsetY = (mObj.y - obj.view.startY) - (mObj.height / 2), imgSet = obj.getCachedImgSet(mObj.imgId), img = imgSet.value[0][0];
            obj.ctx.drawImage(img, 0, 0, mObj.width, mObj.height, offsetX, offsetY, mObj.width, mObj.height);
        };
        return GameRender;
    })();
    exports.GameRender = GameRender;
});
//# sourceMappingURL=render.js.map