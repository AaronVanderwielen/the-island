import World = require('worldbuilder');
import Map = require('map');
import Game = require('gameServer');
import MapObject = require('mapObject');
import Player = require('player');
import Sprite = require('sprite');

interface Asset {
    id: string;
    src: string;
    value?;
}

interface CachedImageData {
    id: string;
    value: Array<Array<HTMLImageElement>>;
}

interface ViewPort {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

interface IRender {
    draw(ctx: CanvasRenderingContext2D, view: ViewPort, imgCache: Array<CachedImageData>);
}

interface MapCache {
    [sectionId: string]: HTMLCanvasElement;
}

export class MapRender {
    map: Map.Map;
    mapCache: MapCache;
    sections: Array<Array<HTMLCanvasElement>>;

    constructor(map: Map.Map) {
        this.map = map;

        // create cached canvas--will be used to hold 3 x 3 sections, updated on section change
        // this is where the viewport is extracted from
        this.mapCache = {};

        // initialize canvases
        this.sections = [];
        this.createSectionCanvases();
    }

    createSectionCanvases() {
        for (var sy = 0; sy < this.map.sectionsY; sy++) {
            for (var sx = 0; sx < this.map.sectionsX; sx++) {
                if (sx === 0) {
                    this.sections[sy] = [];
                }

                this.sections[sy][sx] = document.createElement('canvas');
                this.sections[sy][sx].width = (this.map.numX / this.map.sectionsX) * this.map.tileSize;
                this.sections[sy][sx].height = (this.map.numY / this.map.sectionsX) * this.map.tileSize;

                var newCanvas = document.createElement('canvas'),
                    sectionId = sy + "," + sx;

                newCanvas.width = this.map.pxps * 3;
                newCanvas.height = this.map.pyps * 3;
                newCanvas['ready'] = false;
                this.mapCache[sectionId] = newCanvas;
            }
        }
    }

    initialize(tileset: HTMLImageElement) {
        this.applyTerrain(tileset);
        this.cacheSections();
    }

    cacheSections() {
        for (var ySection = 0; ySection < this.map.sectionsY; ySection++) {
            for (var xSection = 0; xSection < this.map.sectionsX; xSection++) {
                var sectionId = ySection + "," + xSection,
                    c = this.mapCache[sectionId],
                    ctx = c.getContext('2d'),
                    cy = 0;

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
                            ctx.fillRect(cx * this.map.pxps, cy * this.map.pyps, this.map.pxps, this.map.pyps)
                        }
                        cx++;
                    }
                    cy++;
                }
                c['ready'] = true;
                this.mapCache[sectionId] = c;
            }
        }
    }

    applyTerrain(tileset: HTMLImageElement) {
        for (var sy = 0; sy < this.map.sectionsY; sy++) {
            for (var sx = 0; sx < this.map.sectionsX; sx++) {
                var ctx = this.sections[sy][sx].getContext("2d"),
                    startX = sx * (this.map.numX / this.map.sectionsX),
                    endX = startX + (this.map.numX / this.map.sectionsX),
                    startY = sy * (this.map.numY / this.map.sectionsY),
                    endY = startY + (this.map.numY / this.map.sectionsY);

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
    }

    renderBlockTerrain(block: World.Block, ySection: number, xSection: number, ctx: CanvasRenderingContext2D, tileset: HTMLImageElement) {
        var startBlockY = (block.y - (ySection * this.map.byps)) * this.map.tileSize,
            startBlockX = (block.x - (xSection * this.map.bxps)) * this.map.tileSize;

        ctx.drawImage(tileset, block.type * this.map.tileSize, 0, this.map.tileSize, this.map.tileSize, startBlockX, startBlockY, this.map.tileSize, this.map.tileSize);
    }
}

export class GameRender {
    resX: number;
    resY: number;
    rendering: boolean;
    mapRender: MapRender;
    assets: Array<Asset>;
    imgCache: Array<CachedImageData>;
    view: ViewPort;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, resX: number, resY: number) {
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

    getCachedImgSet(key: string) {
        var obj = this;
        return _.find(obj.imgCache, function (i: CachedImageData) {
            return i.id === key;
        });
    }

    getAssetById(id: string) {
        var asset = _.find(this.assets, function (a: Asset) {
            return a.id === id;
        });
        return asset;
    }

    loadAssets(callback: Function) {
        var queue = new createjs.LoadQueue(),
            obj = this;

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
    }

    importSpriteSet() {//spriteIds: string[]) {
        var obj = this;

        //for (var i in spriteIds) {
        var imgId = 'char';//spriteIds[i];
        if (!_.some(obj.imgCache, function (i: CachedImageData) { return i.id === imgId; })) {
            var asset = obj.getAssetById(imgId);
            obj.cacheSprite(imgId, asset.value);
        }
        //}
    }

    cacheSprite(imgId: string, charset: HTMLImageElement) {
        var obj = this,
            charsetData = [
                [null, null, null], // up
                [null, null, null], // right
                [null, null, null], // down
                [null, null, null]  // left
            ];

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 3; x++) {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext("2d"),
                    offsetx = Sprite.Sprite.width * x,
                    offsety = Sprite.Sprite.height * y,
                    splicedImg = new Image();

                canvas.width = Sprite.Sprite.width;
                canvas.height = Sprite.Sprite.height;

                // sourceImage, sourceOffsetX, sourceOffsetY, chunkSizeX, chunkSizeY, canvasPlacementX, canvasPlacementY, newSizeX, newSizeY)
                ctx.drawImage(charset, offsetx, offsety, Sprite.Sprite.width, Sprite.Sprite.height, 0, 0, Sprite.Sprite.width, Sprite.Sprite.height);
                splicedImg.src = canvas.toDataURL('image/png');
                charsetData[y][x] = splicedImg;
            }
        }

        var imgData: CachedImageData = {
            id: imgId,
            value: charsetData
        };

        obj.imgCache.push(imgData);
    }

    importMapObjectsSet() {
        var obj = this,
            asset = obj.getAssetById('items');

        for (var item in MapObject.ItemType) {
            var imgId = MapObject.MapItem.mapItemKey(item);

            if (!_.some(obj.imgCache, function (i: CachedImageData) { return i.id === imgId; })) {
                obj.cacheMapObject(asset.value, item);
            }
        }
    }

    cacheMapObject(itemSet: HTMLImageElement, itemType: MapObject.ItemType) {
        // cache imported img set if not already there
        var obj = this,
            imgId = MapObject.MapItem.mapItemKey(itemType);

        var itemImgData = [
            [null, null, null], // up
            [null, null, null], // right
            [null, null, null], // down
            [null, null, null]  // left
        ];

        var canvas = <HTMLCanvasElement>$('<canvas>')[0],
            ctx = canvas.getContext('2d'),
            data = MapObject.MapItem.getItemData(itemType),
            width = (data.width * 50) * data.multiplier,
            height = (data.height * 50) * data.multiplier,
            splicedImg = new Image();

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(itemSet, data.x * 32, data.y * 32, data.width * 32, data.height * 32, 0, 0, width, height);

        splicedImg.src = canvas.toDataURL('image/png');
        itemImgData[0][0] = splicedImg;

        var imgData: CachedImageData = {
            id: imgId,
            value: itemImgData
        };

        obj.imgCache.push(imgData);
    }

    refresh(gameData: Game.GameDataLight, x: number, y: number) {
        var obj = this;

        if (!obj.rendering) {
            obj.rendering = true;

            var start = new Date(),
                duration;

            obj.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            obj.moveViewCenter(x, y);
            obj.renderView(gameData, x, y);
            obj.drawMapObjects(gameData, x, y);

            obj.rendering = false;

            duration = new Date().getTime() - start.getTime();
            return duration;
        }

        return -1;
    }

    moveViewCenter(x: number, y: number) {
        var newStartX = x - (this.resX / 2),
            newEndX = newStartX + this.resX,
            newStartY = y - (this.resY / 2),
            newEndY = newStartY + this.resY;

        this.view = {
            startX: newStartX,
            endX: newEndX,
            startY: newStartY,
            endY: newEndY
        };
    }

    renderView(gameData: Game.GameDataLight, x: number, y: number) {
        var obj = this,
            ctx = obj.canvas.getContext("2d"),
            ySection = Math.floor(y / gameData.pyps),
            xSection = Math.floor(x / gameData.pxps),
            currSectionId = ySection + "," + xSection,
            cachedStartY = obj.view.startY - ((ySection - 1) * gameData.pyps),
            cachedStartX = obj.view.startX - ((xSection - 1) * gameData.pxps);

        // logging
        var info = document.getElementById('view');
        info.innerHTML = currSectionId;

        ctx.drawImage(obj.mapRender.mapCache[currSectionId], cachedStartX, cachedStartY, obj.resX, obj.resY, 0, 0, obj.resX, obj.resY);
    }

    initialMapRender() {
        var tileset = <HTMLImageElement>this.getAssetById('terrain').value;
        this.mapRender.initialize(tileset);
    }

    drawMapObjects(gameDataLight: Game.GameDataLight, x: number, y: number) {
        var obj = this;

        // sort by z index
        gameDataLight.drawObjects = _.sortBy(gameDataLight.drawObjects, function (o: MapObject.IMapObject) {
            var sortBy = o.z.toString();

            if (o.mapObjectType == MapObject.MapObjectType.sprite) sortBy += (o.passing ? "0" : "2");
            else sortBy += "1";

            return sortBy;
        });

        // draw
        for (var o in gameDataLight.drawObjects) {
            if (gameDataLight.drawObjects[o].mapObjectType == MapObject.MapObjectType.sprite) {
                obj.drawSprite(<Sprite.Sprite>gameDataLight.drawObjects[o]);
            }
            else if (gameDataLight.drawObjects[o].mapObjectType == MapObject.MapObjectType.item) {
                obj.drawMapItem(<MapObject.MapItem>gameDataLight.drawObjects[o]);
            }
        }
    }

    drawSprite(sprite: Sprite.Sprite) {
        var obj = this,
            block = Map.Map.getBlock(obj.mapRender.map, sprite.x, sprite.y),
            offsetX = sprite.x - (Sprite.Sprite.width / 2.2),
            offsetY = sprite.y - (.9 * Sprite.Sprite.height),
            centeredX = offsetX - obj.view.startX,
            centeredY = offsetY - obj.view.startY,
            imgSet = obj.getCachedImgSet('char'),
            img: HTMLImageElement = imgSet.value[sprite.currAnim][sprite.currStep];

        if (block.type === World.TerrainType.shallow || block.type === World.TerrainType.ocean) {
            var bordersLand = Map.Map.blockBorders(obj.mapRender.map, block, [World.TerrainType.beach, World.TerrainType.dirt, World.TerrainType.grass, World.TerrainType.rock]),
                bordersOcean = Map.Map.blockBorders(obj.mapRender.map, block, [World.TerrainType.ocean]);

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
    }

    drawMapItem(mObj: MapObject.MapItem) {
        var obj = this,
            offsetX = (mObj.x - obj.view.startX) - (mObj.width / 2),
            offsetY = (mObj.y - obj.view.startY) - (mObj.height / 2),
            imgSet = obj.getCachedImgSet(mObj.imgId),
            img: HTMLImageElement = imgSet.value[0][0];

        obj.ctx.drawImage(img, 0, 0, mObj.width, mObj.height, offsetX, offsetY, mObj.width, mObj.height);
    }
}
