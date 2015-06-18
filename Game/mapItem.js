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
    function MapItem(itemset, type, droppedItem, stack) {
        if (droppedItem) {
            this.createFromInventoryItem(itemset, droppedItem, stack);
        }
        else {
            this.id = guid();
            this.mapObjectType = 0 /* item */;
            this.getItem(itemset, type);
            this.passing = false;
        }
    }
    MapItem.prototype.createFromInventoryItem = function (itemset, invItem, stack) {
        this.id = guid();
        this.mapObjectType = 0 /* item */;
        switch (invItem.type) {
            case 19 /* axe */:
                this.getItem(itemset, 28 /* axe */);
                break;
            case 3 /* bone */:
                this.getItem(itemset, 19 /* bone */);
                break;
            case 4 /* clay */:
                this.getItem(itemset, 24 /* clay */);
                break;
            case 18 /* hammer */:
                this.getItem(itemset, 26 /* hammer */);
                break;
            case 2 /* hemp */:
                this.getItem(itemset, 23 /* hemp */);
                break;
            case 17 /* knife */:
                this.getItem(itemset, 27 /* knife */);
                break;
            case 6 /* mushroom */:
                this.getItem(itemset, 6 /* mushroom */);
                break;
            case 1 /* rock */:
                this.getItem(itemset, 17 /* rocksA */);
                break;
            case 7 /* roots */:
                this.getItem(itemset, 25 /* roots */);
                break;
            case 11 /* rope */:
                this.getItem(itemset, 29 /* rope */);
                break;
            case 0 /* stick */:
                this.getItem(itemset, 21 /* stickA */);
                break;
        }
        this.stack = stack ? stack : invItem.stack;
        this.canPickup = true;
    };
    MapItem.prototype.getItem = function (itemset, type) {
        var canvas = $('<canvas>')[0], ctx = canvas.getContext('2d'), data = this.getItemData(type), width = (data.width * 50) * data.multiplier, height = (data.height * 50) * data.multiplier, splicedImg = new Image();
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(itemset, data.x * 32, data.y * 32, data.width * 32, data.height * 32, 0, 0, width, height);
        splicedImg.src = canvas.toDataURL('image/png');
        this.img = splicedImg;
        this.itemType = type;
        this.height = height;
        this.width = height;
        this.z = data.z;
        this.pass = data.pass;
        this.passSlow = data.passSlow;
        this.canPickup = data.canPickup;
        this.stack = data.stack;
    };
    MapItem.prototype.getItemData = function (type) {
        var data = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1,
            pass: false,
            passSlow: 1,
            canPickup: false,
            stack: 1
        };
        switch (type) {
            case 28 /* axe */:
                data.x = 2;
                data.y = 0;
                data.canPickup = true;
                break;
            case 1 /* berry */:
                data.x = 11;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 19 /* bone */:
                data.x = 8;
                data.y = 5;
                data.canPickup = true;
                break;
            case 2 /* bush */:
                data.x = 10;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 24 /* clay */:
                data.x = 5;
                data.y = 5;
                data.z = 1;
                data.canPickup = true;
                break;
            case 3 /* fern */:
                data.x = 1;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 4 /* flowerA */:
                data.x = 0;
                data.y = 5;
                data.canPickup = true;
                break;
            case 5 /* flowerB */:
                data.x = 0;
                data.y = 6;
                data.canPickup = true;
                break;
            case 7 /* grassA */:
                data.x = 4;
                data.y = 6;
                break;
            case 8 /* grassB */:
                data.x = 4;
                data.y = 7;
                break;
            case 9 /* grassC */:
                data.x = 5;
                data.y = 7;
                break;
            case 10 /* grassD */:
                data.x = 5;
                data.y = 6;
                break;
            case 26 /* hammer */:
                data.x = 0;
                data.y = 0;
                break;
            case 23 /* hemp */:
                data.x = 9;
                data.y = 1;
                data.z = 1;
                data.canPickup = true;
                break;
            case 27 /* knife */:
                data.x = 1;
                data.y = 0;
                data.canPickup = true;
                break;
            case 20 /* log */:
                data.x = 7;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 6 /* mushroom */:
                data.x = 4;
                data.y = 5;
                data.canPickup = true;
                break;
            case 11 /* plant */:
                data.x = 8;
                data.y = 1;
                data.multiplier = 2;
                break;
            case 12 /* rockA */:
                data.x = 8;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 13 /* rockB */:
                data.x = 9;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 14 /* rockC */:
                data.x = 10;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 15 /* rockD */:
                data.x = 1;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 16 /* rockE */:
                data.x = 3;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case 17 /* rocksA */:
                data.x = 0;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case 18 /* rocksB */:
                data.x = 2;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case 25 /* roots */:
                data.x = 1;
                data.y = 6;
                data.canPickup = true;
                break;
            case 29 /* rope */:
                data.x = 5;
                data.y = 0;
                data.canPickup = true;
                break;
            case 21 /* stickA */:
                data.x = 6;
                data.y = 0;
                data.canPickup = true;
                break;
            case 22 /* stickB */:
                data.x = 7;
                data.y = 0;
                data.canPickup = true;
                break;
            case 0 /* tree */:
                data.x = 6;
                data.y = 6;
                data.z = 1;
                data.height = 2;
                data.width = 2;
                data.pass = true;
                data.passSlow = .5;
                break;
        }
        return data;
    };
    MapItem.prototype.onItem = function (y, x) {
        var startY = this.y - (this.height / 2), endY = startY + this.height, startX = this.x - (this.width / 2), endX = startX + this.width;
        return (y >= startY && y <= endY) && (x >= startX && x <= endX);
    };
    MapItem.prototype.toInventoryItem = function () {
        var item = new InventoryItem(this);
        return item;
    };
    MapItem.prototype.draw = function (ctx, view) {
        var offsetX = (this.x - view.startX) - (this.width / 2), offsetY = (this.y - view.startY) - (this.height / 2);
        ctx.drawImage(this.img, 0, 0, this.width, this.height, offsetX, offsetY, this.width, this.height);
    };
    return MapItem;
})();
//# sourceMappingURL=mapItem.js.map