interface IMapObject {
    set: Array<Array<HTMLImageElement>>;
    x: number;
    y: number;
    height: number;
    width: number;
    currAnim: number;
    currStep: number;
    draw(ctx: CanvasRenderingContext2D);
}

class Game {
    world: World;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    resX: number;
    resY: number;
    fps: number;
    objects: Array<IMapObject>;
    userControlled: Sprite;
    controls: Controls;

    constructor(canvas: HTMLCanvasElement, resX: number, resY: number, fps: number) {
        this.canvas = canvas;
        this.canvas.width = resX;
        this.canvas.height = resY;
        this.ctx = canvas.getContext('2d');

        this.resX = resX;
        this.resY = resY;

        this.fps = fps;
        this.objects = new Array();
    }

    onGameReady(callback: Function) {
        var game = this,
            i;

        i = window.setInterval(function () {
            var ready = true;
            for (var o in game.objects) {
                if (!game.objects[0].set) ready = false; // check map objects rendered
            }
            if (ready) {
                window.clearInterval(i);
                callback();
            }
        }, 100);
    }

    start() {
        var obj = this;

        window.setInterval(function () {
            obj.refresh();
        }, 1000 / obj.fps);
    }

    refresh() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.world.moveViewCenter(this.userControlled);
        this.drawMapObjects();
    }

    drawMapObjects() {
        for (var o in this.objects) {
            this.objects[o].draw(this.ctx);
        }
    }

    addMapObject(obj: IMapObject) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 2000;
        obj.y = 2000;
        this.objects.push(obj);
    }
}

function canGame() {
    return "getGamepads" in navigator;
}

$(function () {
    if (canGame()) {
        var canvas = <HTMLCanvasElement>$('canvas')[0],
            game = new Game(canvas, 1600, 1200, 60),
            //game = new Game(canvas, 1920, 1080, 60),
            world = new World(game, 100, 100, 100, 10),
            sprite = new Sprite('/img/char.png', world),
            controls = new Controls(game.fps);

        game.userControlled = sprite;
        game.addMapObject(sprite);

        game.onGameReady(function () {
            game.world = world;
            game.start();
            controls.start(sprite);
        });
    }
});