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
            this.mapObjectType = MapObjectType.item;
            this.getItem(itemset, type);
            this.passing = false;
        }
    }
    MapItem.prototype.createFromInventoryItem = function (itemset, invItem, stack) {
        this.id = guid();
        this.mapObjectType = MapObjectType.item;
        switch (invItem.type) {
            case InventoryItemType.axe:
                this.getItem(itemset, ItemType.axe);
                break;
            //case InventoryItemType.berries:
            //    this.itemType = ItemType.berry;
            //    break;
            case InventoryItemType.bone:
                this.getItem(itemset, ItemType.bone);
                break;
            //case InventoryItemType.brick:
            //    this.itemType = ItemType.brick;
            //    break;
            //case InventoryItemType.canvas:
            //    this.itemType = ItemType.axe;
            //    break;
            case InventoryItemType.clay:
                this.getItem(itemset, ItemType.clay);
                break;
            case InventoryItemType.hammer:
                this.getItem(itemset, ItemType.hammer);
                break;
            case InventoryItemType.hemp:
                this.getItem(itemset, ItemType.hemp);
                break;
            case InventoryItemType.knife:
                this.getItem(itemset, ItemType.knife);
                break;
            //case InventoryItemType.lumber:
            //    this.itemType = ItemType.;
            //    break;
            //case InventoryItemType.meat:
            //    this.itemType = ItemType.mea;
            //    break;
            case InventoryItemType.mushroom:
                this.getItem(itemset, ItemType.mushroom);
                break;
            //case InventoryItemType.plank:
            //    this.itemType = ItemType.axe;
            //    break;
            case InventoryItemType.rock:
                this.getItem(itemset, ItemType.rocksA);
                break;
            case InventoryItemType.roots:
                this.getItem(itemset, ItemType.roots);
                break;
            case InventoryItemType.rope:
                this.getItem(itemset, ItemType.rope);
                break;
            //case InventoryItemType.sand:
            //    this.itemType = ItemType.sa;
            //    break;
            //case InventoryItemType.skin:
            //    this.itemType = ItemType.sk;
            //    break;
            case InventoryItemType.stick:
                this.getItem(itemset, ItemType.stickA);
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
            case ItemType.axe:
                data.x = 2;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.berry:
                data.x = 11;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.bone:
                data.x = 8;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.bush:
                data.x = 10;
                data.y = 0;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.clay:
                data.x = 5;
                data.y = 5;
                data.z = 1;
                data.canPickup = true;
                break;
            case ItemType.fern:
                data.x = 1;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.flowerA:
                data.x = 0;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.flowerB:
                data.x = 0;
                data.y = 6;
                data.canPickup = true;
                break;
            case ItemType.grassA:
                data.x = 4;
                data.y = 6;
                break;
            case ItemType.grassB:
                data.x = 4;
                data.y = 7;
                break;
            case ItemType.grassC:
                data.x = 5;
                data.y = 7;
                break;
            case ItemType.grassD:
                data.x = 5;
                data.y = 6;
                break;
            case ItemType.hammer:
                data.x = 0;
                data.y = 0;
                break;
            case ItemType.hemp:
                data.x = 9;
                data.y = 1;
                data.z = 1;
                data.canPickup = true;
                break;
            case ItemType.knife:
                data.x = 1;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.log:
                data.x = 7;
                data.y = 5;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.mushroom:
                data.x = 4;
                data.y = 5;
                data.canPickup = true;
                break;
            case ItemType.plant:
                data.x = 8;
                data.y = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockA:
                data.x = 8;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockB:
                data.x = 9;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockC:
                data.x = 10;
                data.y = 3;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockD:
                data.x = 1;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rockE:
                data.x = 3;
                data.y = 7;
                data.z = 1;
                data.multiplier = 2;
                break;
            case ItemType.rocksA:
                data.x = 0;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case ItemType.rocksB:
                data.x = 2;
                data.y = 7;
                data.canPickup = true;
                data.stack = 3;
                break;
            case ItemType.roots:
                data.x = 1;
                data.y = 6;
                data.canPickup = true;
                break;
            case ItemType.rope:
                data.x = 5;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.stickA:
                data.x = 6;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.stickB:
                data.x = 7;
                data.y = 0;
                data.canPickup = true;
                break;
            case ItemType.tree:
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
