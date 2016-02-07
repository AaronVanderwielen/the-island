define(["require", "exports", "lib", "mapObject"], function (require, exports, Lib, MapObject) {
    var Sprite = (function () {
        function Sprite() {
            var sprite = this;
            sprite.id = Lib.guid();
            sprite.mapObjectType = MapObject.MapObjectType.sprite;
            sprite.z = 1;
            sprite.currAnim = 2;
            sprite.currStep = 1;
            sprite.stepCounter = 0;
            sprite.stepDir = 1;
            sprite.yAdjust = 1; // used to cut sprite off early, like when partly underwater
            sprite.pass = false;
            sprite.passSlow = 0;
            sprite.passing = false;
            sprite.canPickup = false;
        }
        Sprite.prototype.onItem = function (y, x) {
            return (y >= this.y && y <= this.y + Sprite.height) && (x >= this.x && x <= this.x + Sprite.width);
        };
        Sprite.height = 96;
        Sprite.width = 72;
        return Sprite;
    })();
    exports.Sprite = Sprite;
});
//# sourceMappingURL=sprite.js.map