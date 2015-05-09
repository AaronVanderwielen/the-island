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
    bgCanvas: HTMLCanvasElement;
    bgCtx: CanvasRenderingContext2D;
    oCanvas: HTMLCanvasElement;
    oCtx: CanvasRenderingContext2D;
    fps: number;
    objects: Array<IMapObject>;
    userControlled: Sprite;
    controls: Controls;

    constructor(bgCanvas: HTMLCanvasElement, oCanvas: HTMLCanvasElement, fps: number) {
        this.bgCanvas = bgCanvas;
        this.bgCanvas.width = 1920;
        this.bgCanvas.height = 1080;
        this.bgCtx = bgCanvas.getContext('2d');

        this.oCanvas = oCanvas;
        this.oCanvas.width = 1920;
        this.oCanvas.height = 1080;
        this.oCtx = oCanvas.getContext('2d');

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
        this.oCtx.clearRect(0, 0, this.oCanvas.width, this.oCanvas.height);
        this.drawMapObjects();
    }

    drawMapObjects() {
        for (var o in this.objects) {
            this.objects[o].draw(this.oCtx);
        }
    }

    addMapObject(obj: IMapObject) {
        obj.currAnim = 2;
        obj.currStep = 1;
        obj.x = 600;
        obj.y = 600;
        this.objects.push(obj);
    }
}

function canGame() {
    return "getGamepads" in navigator;
}

$(function () {
    if (canGame()) {
        var bgCanvas = <HTMLCanvasElement>$('canvas#bg')[0],
            oCanvas = <HTMLCanvasElement>$('canvas#objects')[0],
            game = new Game(bgCanvas, oCanvas, 60),
            world = new World(1000, 1000, 100, 50, 5),
            sprite = new Sprite('/img/char.png', world),
            controls = new Controls(game.fps);

        world.build();
        world.render(bgCanvas);

        game.userControlled = sprite;
        game.addMapObject(sprite);

        game.onGameReady(function () {
            game.start();
            controls.start(sprite);
        });
    }
});