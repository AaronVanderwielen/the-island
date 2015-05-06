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
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    fps: number;
    objects: Array<IMapObject>;
    userControlled: Sprite;
    controls: Controls;

    constructor(element: HTMLCanvasElement, fps: number) {
        this.canvas = element;
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = element.getContext('2d');
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
        obj.x = 0;
        obj.y = 0;
        this.objects.push(obj);
    }
}

function canGame() {
    return "getGamepads" in navigator;
}

$(function () {
    if (canGame()) {
        var canvas = <HTMLCanvasElement>$('#canvas')[0],
            game = new Game(canvas, 60),
            sprite = new Sprite('/img/char.png'),
            controls = new Controls(game.fps);

        game.userControlled = sprite;
        game.addMapObject(sprite);

        game.onGameReady(function () {
            game.start();
            controls.start(sprite);
        });
    }
});