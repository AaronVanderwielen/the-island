var MapObjectType;
(function (MapObjectType) {
    MapObjectType[MapObjectType["item"] = 0] = "item";
    MapObjectType[MapObjectType["sprite"] = 1] = "sprite";
})(MapObjectType || (MapObjectType = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["tree"] = 0] = "tree";
    ItemType[ItemType["berry"] = 1] = "berry";
    ItemType[ItemType["bush"] = 2] = "bush";
    ItemType[ItemType["fern"] = 3] = "fern";
    ItemType[ItemType["flowerA"] = 4] = "flowerA";
    ItemType[ItemType["flowerB"] = 5] = "flowerB";
    ItemType[ItemType["mushroom"] = 6] = "mushroom";
    ItemType[ItemType["grassA"] = 7] = "grassA";
    ItemType[ItemType["grassB"] = 8] = "grassB";
    ItemType[ItemType["grassC"] = 9] = "grassC";
    ItemType[ItemType["grassD"] = 10] = "grassD";
    ItemType[ItemType["plant"] = 11] = "plant";
    ItemType[ItemType["rockA"] = 12] = "rockA";
    ItemType[ItemType["rockB"] = 13] = "rockB";
    ItemType[ItemType["rockC"] = 14] = "rockC";
    ItemType[ItemType["rockD"] = 15] = "rockD";
    ItemType[ItemType["rockE"] = 16] = "rockE";
    ItemType[ItemType["rocksA"] = 17] = "rocksA";
    ItemType[ItemType["rocksB"] = 18] = "rocksB";
    ItemType[ItemType["bone"] = 19] = "bone";
    ItemType[ItemType["log"] = 20] = "log";
    ItemType[ItemType["stickA"] = 21] = "stickA";
    ItemType[ItemType["stickB"] = 22] = "stickB";
    ItemType[ItemType["hemp"] = 23] = "hemp";
    ItemType[ItemType["clay"] = 24] = "clay";
    ItemType[ItemType["roots"] = 25] = "roots";
    ItemType[ItemType["hammer"] = 26] = "hammer";
    ItemType[ItemType["knife"] = 27] = "knife";
    ItemType[ItemType["axe"] = 28] = "axe";
    ItemType[ItemType["rope"] = 29] = "rope";
})(ItemType || (ItemType = {}));
var MapItem = (function () {
    function MapItem(itemset, type) {
        this.type = 0 /* item */;
        this.getItem(itemset, type);
        this.passing = false;
    }
    MapItem.prototype.getItem = function (itemset, type) {
        var canvas = $('<canvas>')[0], ctx = canvas.getContext('2d'), coords = this.getItemImgCoords(type), width = (coords.width * 50) * coords.multiplier, height = (coords.height * 50) * coords.multiplier, splicedImg = new Image();
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(itemset, coords.x * 32, coords.y * 32, coords.width * 32, coords.height * 32, 0, 0, width, height);
        splicedImg.src = canvas.toDataURL('image/png');
        this.img = splicedImg;
        this.height = height;
        this.width = height;
        this.z = coords.z;
        this.pass = coords.pass;
        this.passSlow = coords.passSlow;
    };
    MapItem.prototype.getItemImgCoords = function (type) {
        var loc = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1,
            pass: false,
            passSlow: 1,
        };
        switch (type) {
            case 28 /* axe */:
                loc.x = 2;
                loc.y = 0;
                break;
            case 1 /* berry */:
                loc.x = 11;
                loc.y = 0;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 19 /* bone */:
                loc.x = 8;
                loc.y = 5;
                break;
            case 2 /* bush */:
                loc.x = 10;
                loc.y = 0;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 24 /* clay */:
                loc.x = 5;
                loc.y = 5;
                loc.z = 1;
                break;
            case 3 /* fern */:
                loc.x = 1;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 4 /* flowerA */:
                loc.x = 0;
                loc.y = 5;
                break;
            case 5 /* flowerB */:
                loc.x = 0;
                loc.y = 6;
                break;
            case 7 /* grassA */:
                loc.x = 4;
                loc.y = 6;
                break;
            case 8 /* grassB */:
                loc.x = 4;
                loc.y = 7;
                break;
            case 9 /* grassC */:
                loc.x = 5;
                loc.y = 7;
                break;
            case 10 /* grassD */:
                loc.x = 5;
                loc.y = 6;
                break;
            case 26 /* hammer */:
                loc.x = 0;
                loc.y = 0;
                break;
            case 23 /* hemp */:
                loc.x = 9;
                loc.y = 1;
                loc.z = 1;
                break;
            case 27 /* knife */:
                loc.x = 1;
                loc.y = 0;
                break;
            case 20 /* log */:
                loc.x = 7;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 6 /* mushroom */:
                loc.x = 4;
                loc.y = 5;
                break;
            case 11 /* plant */:
                loc.x = 1;
                loc.y = 8;
                break;
            case 12 /* rockA */:
                loc.x = 8;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 13 /* rockB */:
                loc.x = 9;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 14 /* rockC */:
                loc.x = 10;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 15 /* rockD */:
                loc.x = 1;
                loc.y = 7;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 16 /* rockE */:
                loc.x = 3;
                loc.y = 7;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 17 /* rocksA */:
                loc.x = 0;
                loc.y = 7;
                break;
            case 18 /* rocksB */:
                loc.x = 2;
                loc.y = 7;
                break;
            case 25 /* roots */:
                loc.x = 0;
                loc.y = 6;
                break;
            case 29 /* rope */:
                loc.x = 5;
                loc.y = 0;
                break;
            case 21 /* stickA */:
                loc.x = 6;
                loc.y = 0;
                break;
            case 22 /* stickB */:
                loc.x = 7;
                loc.y = 0;
                break;
            case 0 /* tree */:
                loc.x = 6;
                loc.y = 6;
                loc.z = 1;
                loc.height = 2;
                loc.width = 2;
                loc.pass = true;
                loc.passSlow = .5;
                break;
        }
        return loc;
    };
    MapItem.prototype.onItem = function (y, x) {
        return (y >= this.y && y <= this.y + this.height) && (x >= this.x && x <= this.x + this.width);
    };
    MapItem.prototype.draw = function (ctx, view) {
        var offsetX = this.x - view.startX, offsetY = this.y - view.startY;
        ctx.drawImage(this.img, 0, 0, this.width, this.height, offsetX, offsetY, this.width, this.height);
    };
    return MapItem;
})();
//# sourceMappingURL=mapItem.js.map