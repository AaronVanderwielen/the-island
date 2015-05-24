interface IMapObject {
    type: MapObjectType;
    img: HTMLImageElement;
    x: number;
    y: number;
    z: number;
    sectionId: string;
    height: number;
    width: number;
    draw(ctx: CanvasRenderingContext2D, view: ViewPort);
    onItem(y: number, x: number);
    // Sound for each mapobject?
}

enum MapObjectType {
    sprite,
    item
}

enum ItemType {
    tree,
    berry,
    bush,
    fern,
    flower,
    mushroom,
    plant,
    rocks,
    rock,
    bone,
    log
}

class MapItem implements IMapObject {
    type: MapObjectType;
    img: HTMLImageElement;
    itemType: ItemType;
    x: number;
    y: number;
    z: number;
    sectionId: string;
    height: number;
    width: number;
    on: Block;

    constructor(itemset: HTMLImageElement, type: ItemType) {
        this.type = MapObjectType.item;
        this.getItem(itemset, type);
    }

    getItem(itemset: HTMLImageElement, type: ItemType) {
        var canvas = <HTMLCanvasElement>$('<canvas>')[0],
            ctx = canvas.getContext('2d'),
            coords = this.getItemImgCoords(type),
            width = (coords.width * 50) * coords.multiplier,
            height = (coords.height * 50) * coords.multiplier,
            splicedImg = new Image();

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(itemset, coords.x * 32, coords.y * 32, coords.width * 32, coords.height * 32, 0, 0, width, height);
        splicedImg.src = canvas.toDataURL('image/png');

        this.img = splicedImg;
        this.height = height;
        this.width = height;
        this.z = coords.z;
    }

    getItemImgCoords(type: ItemType) {
        var loc = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1
        };

        switch (type) {
            case ItemType.berry:
                loc.x = 13;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.bone:
                loc.x = 8
                loc.y = 6;
                break;
            case ItemType.bush:
                loc.x = 10;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.fern:
                loc.x = 1;
                loc.y = 7;
                loc.z = 1;
                break;
            case ItemType.flower:
                loc.x = 0;
                loc.y = 7;
                break;
            case ItemType.mushroom:
                loc.x = 4;
                loc.y = 7;
                break;
            case ItemType.log:
                loc.x = 7;
                loc.y = 6;
                loc.z = 1;
                break;
            case ItemType.plant:
                loc.x = 1;
                loc.y = 8;
                break;
            case ItemType.rock:
                loc.x = 12;
                loc.y = 6;
                break;
            case ItemType.rocks:
                loc.x = 0;
                loc.y = 9;
                break;
            case ItemType.tree:
                loc.x = 2;
                loc.y = 1;
                loc.z = 1;
                loc.height = 2;
                loc.width = 2;
                break;
        }
        return loc;
    }

    onItem(y: number, x: number) {
        return (y >= this.y && y <= this.y + this.height) && (x >= this.x && x <= this.x + this.width);
    }

    draw(ctx: CanvasRenderingContext2D, view: ViewPort) {
        var offsetX = this.x - view.startX,
            offsetY = this.y - view.startY;

        ctx.drawImage(this.img, 0, 0, this.width, this.height, offsetX, offsetY, this.width, this.height);
    }
}