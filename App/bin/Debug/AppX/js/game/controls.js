var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var Controls = (function () {
        function Controls() {
            this.x = 0;
            this.y = 0;
            this.actions = [];
            this.hasGp = false;
        }
        Controls.prototype.report = function () { };
        Controls.prototype.start = function () {
            var obj = this;
            if ("getGamepads" in window.navigator) {
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
        };
        Controls.prototype.pollForGamepad = function () {
            var obj = this;
            //setup an interval for Chrome
            obj.checkGp = window.setInterval(function () {
                if (window.navigator['getGamepads']()[0]) {
                    if (!obj.hasGp)
                        $(window).trigger("gamepadconnected");
                    window.clearInterval(obj.checkGp);
                }
            }, 100);
        };
        Controls.prototype.clear = function () {
            this.onConnect = null;
            this.onDisconnect = null;
            $(window).off("gamepadconnected");
            $(window).off("gamepaddisconnected");
            clearInterval(this.checkGp);
        };
        return Controls;
    })();
    exports.Controls = Controls;
    var MenuControls = (function (_super) {
        __extends(MenuControls, _super);
        function MenuControls() {
            _super.apply(this, arguments);
        }
        MenuControls.prototype.report = function () {
            var obj = this, gp = window.navigator['getGamepads']()[0];
            if (gp) {
                for (var i = 0; i < gp.buttons.length; i++) {
                    var existingAction = _.find(obj.actions, function (a) { return a.button === i; });
                    if (gp.buttons[i].pressed) {
                        //console.log(i);
                        if (!existingAction) {
                            // new action
                            obj.actions.push({
                                button: i,
                                recorded: false
                            });
                        }
                    }
                    else {
                        // no longer holding button
                        if (existingAction) {
                            // remove from actions
                            obj.actions = _.reject(obj.actions, function (a) { return a.button === i; });
                        }
                    }
                }
            }
        };
        return MenuControls;
    })(Controls);
    exports.MenuControls = MenuControls;
    var GameControls = (function (_super) {
        __extends(GameControls, _super);
        function GameControls() {
            _super.call(this);
            this.lookx = 0;
            this.looky = 0;
            this.strength = 0;
            this.sprinting = false;
            this.looking = false;
        }
        GameControls.prototype.report = function () {
            var obj = this, gp = window.navigator['getGamepads']()[0];
            if (gp) {
                for (var i = 0; i < gp.buttons.length; i++) {
                    var existingAction = _.find(obj.actions, function (a) { return a.button === i; });
                    if (gp.buttons[i].pressed) {
                        //console.log(i);
                        if (!existingAction) {
                            // new action
                            obj.actions.push({
                                button: i,
                                recorded: false
                            });
                        }
                    }
                    else {
                        // no longer holding button
                        if (existingAction) {
                            // remove from actions
                            obj.actions = _.reject(obj.actions, function (a) { return a.button === i; });
                        }
                    }
                }
                if (Math.abs(gp.axes[1]) > 0.1 || Math.abs(gp.axes[0]) > 0.1) {
                    var x = gp.axes[0], y = gp.axes[1], c = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), strength = c < .2 ? 1 : (c < .8 ? 1.5 : 2);
                    obj.x = x;
                    obj.y = y;
                    obj.strength = strength;
                }
                else {
                    obj.x = 0;
                    obj.y = 0;
                    obj.strength = 0;
                }
                if (Math.abs(gp.axes[3]) > 0.1 || Math.abs(gp.axes[2]) > 0.1) {
                    obj.looking = true;
                    obj.lookx = gp.axes[2];
                    obj.looky = gp.axes[3];
                }
                else {
                    obj.looking = false;
                    obj.lookx = 0;
                    obj.looky = 0;
                }
                obj.sprinting = gp.buttons[10].pressed;
            }
        };
        return GameControls;
    })(Controls);
    exports.GameControls = GameControls;
});
//# sourceMappingURL=controls.js.map