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
    pass: boolean;
    passSlow: number;
    passing: boolean;
    // Sound for each mapobject?
}

enum MapObjectType {
    item,
    sprite
}

enum ItemType {
    tree,
    berry,
    bush,
    fern,
    flowerA,
    flowerB,
    mushroom,
    grassA,
    grassB,
    grassC,
    grassD,
    plant,
    rockA,
    rockB,
    rockC,
    rockD,
    rockE,
    rocksA,
    rocksB,
    bone,
    log,
    stickA,
    stickB,
    hemp,
    clay,
    roots,
    hammer,
    knife,
    axe,
    rope
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
    pass: boolean;
    passSlow: number;
    passing: boolean;

    constructor(itemset: HTMLImageElement, type: ItemType) {
        this.type = MapObjectType.item;
        this.getItem(itemset, type);

        this.passing = false;
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
        this.pass = coords.pass;
        this.passSlow = coords.passSlow;
    }

    getItemImgCoords(type: ItemType) {
        var loc = {
            x: 0,
            y: 0,
            z: 0,
            width: 1,
            height: 1,
            multiplier: 1,
            pass: false,
            passSlow: 1,
            //passYOffset: 
        };

        switch (type) {
            case ItemType.axe:
                loc.x = 2;
                loc.y = 0;
                break;
            case ItemType.berry:
                loc.x = 11;
                loc.y = 0;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.bone:
                loc.x = 8;
                loc.y = 5;
                break;
            case ItemType.bush:
                loc.x = 10;
                loc.y = 0;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.clay:
                loc.x = 5;
                loc.y = 5;
                loc.z = 1;
                break;
            case ItemType.fern:
                loc.x = 1;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.flowerA:
                loc.x = 0;
                loc.y = 5;
                break;
            case ItemType.flowerB:
                loc.x = 0;
                loc.y = 6;
                break;
            case ItemType.grassA:
                loc.x = 4;
                loc.y = 6;
                break;
            case ItemType.grassB:
                loc.x = 4;
                loc.y = 7;
                break;
            case ItemType.grassC:
                loc.x = 5;
                loc.y = 7;
                break;
            case ItemType.grassD:
                loc.x = 5;
                loc.y = 6;
                break;
            case ItemType.hammer:
                loc.x = 0;
                loc.y = 0;
                break;
            case ItemType.hemp:
                loc.x = 9;
                loc.y = 1;
                loc.z = 1;
                break;
            case ItemType.knife:
                loc.x = 1;
                loc.y = 0;
                break;
            case ItemType.log:
                loc.x = 7;
                loc.y = 5;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.mushroom:
                loc.x = 4;
                loc.y = 5;
                break;
            case ItemType.plant:
                loc.x = 1;
                loc.y = 8;
                break;
            case ItemType.rockA:
                loc.x = 8;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.rockB:
                loc.x = 9;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.rockC:
                loc.x = 10;
                loc.y = 3;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.rockD:
                loc.x = 1;
                loc.y = 7;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.rockE:
                loc.x = 3;
                loc.y = 7;
                loc.z = 1;
                loc.multiplier = 2;
                break;
            case ItemType.rocksA:
                loc.x = 0;
                loc.y = 7;
                break;
            case ItemType.rocksB:
                loc.x = 2;
                loc.y = 7;
                break;
            case ItemType.roots:
                loc.x = 0;
                loc.y = 6;
                break;
            case ItemType.rope:
                loc.x = 5;
                loc.y = 0;
                break;
            case ItemType.stickA:
                loc.x = 6;
                loc.y = 0;
                break;
            case ItemType.stickB:
                loc.x = 7;
                loc.y = 0;
                break;
            case ItemType.tree:
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