class Controls {
    fps: number;
    x: number;
    y: number;
    strength: number;

    constructor(fps: number) {
        this.fps = fps;
        this.x = 0;
        this.y = 0;
        this.strength = 0;
    }

    report(sprite: Sprite) {
        var gp = navigator['getGamepads']()[0];

        for (var i = 0; i < gp.buttons.length; i++) {
            if (gp.buttons[i].pressed) {
                console.log(i);
            }
        }

        if (Math.abs(gp.axes[1]) > 0.1 || Math.abs(gp.axes[0]) > 0.1) {
            var x = gp.axes[0],
                y = gp.axes[1],
                c = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                strength = c < .2 ? 0 : (c < .8 ? 1 : 2);
            //quadrant,
            //o,
            //angle,
            //degrees;

            //if (x >= 0 && y >= 0) {
            //    quadrant = 1;
            //    o = y;
            //}
            //else if (x <= 0 && y >= 0) {
            //    quadrant = 2;
            //    o = x;
            //}
            //else if (x <= 0 && y <= 0) {
            //    quadrant = 3;
            //    o = y;
            //}
            //else if (x >= 0 && y <= 0) {
            //    quadrant = 4;
            //    o = x;
            //}

            //angle = Math.abs(Math.sin(o / c)) * 100;
            //angle += ((quadrant - 1) * 90);
            //console.log("angle: " + angle);

            this.x = x;
            this.y = y;
            this.strength = strength;
            //sprite.move(x, y, strength);
        }
        else {
            this.strength = 0;
        }
    }

    start() {
        var obj = this,
            hasGP = false,
            repGP;

        $(window).on("gamepadconnected", function () {
            console.log("connection event");
            repGP = window.setInterval(function () {
                obj.report.call(obj);
            }, 1000 / this.fps);
        });

        $(window).on("gamepaddisconnected", function () {
            console.log("disconnection event");
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function () {
            if (navigator['getGamepads']()[0]) {
                if (!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }
}