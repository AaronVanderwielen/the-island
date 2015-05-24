var MapObjectType;
(function (MapObjectType) {
    MapObjectType[MapObjectType["sprite"] = 0] = "sprite";
    MapObjectType[MapObjectType["item"] = 1] = "item";
})(MapObjectType || (MapObjectType = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["tree"] = 0] = "tree";
    ItemType[ItemType["berry"] = 1] = "berry";
    ItemType[ItemType["bush"] = 2] = "bush";
    ItemType[ItemType["fern"] = 3] = "fern";
    ItemType[ItemType["flower"] = 4] = "flower";
    ItemType[ItemType["mushroom"] = 5] = "mushroom";
    ItemType[ItemType["plant"] = 6] = "plant";
    ItemType[ItemType["rocks"] = 7] = "rocks";
    ItemType[ItemType["rock"] = 8] = "rock";
    ItemType[ItemType["bone"] = 9] = "bone";
    ItemType[ItemType["log"] = 10] = "log";
})(ItemType || (ItemType = {}));
var MapItem = (function () {
    function MapItem(itemset, type) {
        this.type = 1 /* item */;
        this.getItem(itemset, type);
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
    };
    MapItem.prototype.getItemImgCoords = function (type) {
        var loc = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1
        };
        switch (type) {
            case 1 /* berry */:
                loc.x = 13;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 9 /* bone */:
                loc.x = 8;
                loc.y = 6;
                break;
            case 2 /* bush */:
                loc.x = 10;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case 3 /* fern */:
                loc.x = 1;
                loc.y = 7;
                loc.z = 1;
                break;
            case 4 /* flower */:
                loc.x = 0;
                loc.y = 7;
                break;
            case 5 /* mushroom */:
                loc.x = 4;
                loc.y = 7;
                break;
            case 10 /* log */:
                loc.x = 7;
                loc.y = 6;
                loc.z = 1;
                break;
            case 6 /* plant */:
                loc.x = 1;
                loc.y = 8;
                break;
            case 8 /* rock */:
                loc.x = 12;
                loc.y = 6;
                break;
            case 7 /* rocks */:
                loc.x = 0;
                loc.y = 9;
                break;
            case 0 /* tree */:
                loc.x = 2;
                loc.y = 1;
                loc.z = 1;
                loc.height = 2;
                loc.width = 2;
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