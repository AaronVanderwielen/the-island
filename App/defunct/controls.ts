interface ButtonAction {
    button: number;
    recorded: boolean;
}

class Controls {
    x: number;
    y: number;
    lookx: number;
    looky: number;
    strength: number;
    sprinting: boolean;
    looking: boolean;
    actions: Array<ButtonAction>;
    public onConnect: Function;
    public onDisconnect: Function;
    checkGp;
    hasGp: boolean;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.lookx = 0;
        this.looky = 0;
        this.strength = 0;
        this.actions = [];
        this.hasGp = false;
    }

    report() {
        var gp = navigator['getGamepads']()[0];
        if (gp) {
            for (var i = 0; i < gp.buttons.length; i++) {
                var existingAction = _.find(this.actions, function (a) { return a.button === i; });
                if (gp.buttons[i].pressed) {
                    //console.log(i);
                    if (!existingAction) {
                        // new action
                        this.actions.push({
                            button: i,
                            recorded: false
                        });
                    }
                }
                else {
                    // no longer holding button
                    if (existingAction) {
                        // remove from actions
                        this.actions = _.reject(this.actions, function (a) { return a.button === i; });
                    }
                }
            }

            if (Math.abs(gp.axes[1]) > 0.1 || Math.abs(gp.axes[0]) > 0.1) {
                var x = gp.axes[0],
                    y = gp.axes[1],
                    c = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                    strength = c < .2 ? 0 : (c < .8 ? 1 : 1.5);

                this.x = x;
                this.y = y;
                this.strength = strength;
            }
            else {
                this.strength = 0;
            }

            if (Math.abs(gp.axes[3]) > 0.1 || Math.abs(gp.axes[2]) > 0.1) {
                this.lookx = gp.axes[2];
                this.looky = gp.axes[3];
            }

            this.looking = gp.buttons[6].pressed;
            this.sprinting = gp.buttons[7].pressed;
        }
    }

    start() {
        var obj = this;

        $(window).on("gamepadconnected", function () {
            console.log("connection event");

            if (obj.onConnect) {
                obj.onConnect();
            }
        });

        $(window).on("gamepaddisconnected", function () {
            console.log("disconnection event");
            obj.pollForGamepad();

            if (obj.onDisconnect) {
                obj.onDisconnect();
            }
        });

        obj.pollForGamepad();
    }

    pollForGamepad() {
        var obj = this;

        //setup an interval for Chrome
        obj.checkGp = window.setInterval(function () {
            if (navigator['getGamepads']()[0]) {
                if (!obj.hasGp) $(window).trigger("gamepadconnected");
                window.clearInterval(obj.checkGp);
            }
        }, 100);
    }

    clear() {
        this.onConnect = null;
        this.onDisconnect = null;
        $(window).off("gamepadconnected");
        $(window).off("gamepaddisconnected");
        clearInterval(this.checkGp);
    }
}