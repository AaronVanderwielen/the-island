interface Block {
    x: number;
    y: number;
    type?: TerrainType;
    above?: Block;
    right?: Block;
    below?: Block;
    left?: Block;
    bg?: string;
}

enum TerrainType {
    ocean,
    beach,
    grass,
    dirt,
    rock,
    mountain
}

class World {
    grid: Array<Array<Block>>;
    numX: number;
    numY: number;
    tileSize: number;
    gradientSize: number;
    terrainType: TerrainType;

    constructor(x, y, tileSize, gradientSize) {
        this.numX = x;
        this.numY = y;
        this.tileSize = tileSize;
        this.gradientSize = gradientSize;

        // init grid
        this.initGrid()
    }

    initGrid() {
        this.grid = [];

        // initialize empty blocks in grid
        for (var y = 0; y < this.numY; y++) {
            for (var x = 0; x < this.numX; x++) {
                var block = {
                    x: x,
                    y: y
                };

                if (x === 0) {
                    this.grid[y] = [];
                }
                this.grid[y][x] = block;
            }
        }

        // apply pointers to nearby
        for (var j in this.grid) {
            var row = this.grid[j];

            for (var k in row) {
                var b = row[k];
                this.setNearbyPointers(b);
            }
        }
    }

    build() {
        this.createOcean();
        this.createBeach();
        this.createMountain();

        for (var y = this.gradientSize * 3; y < this.numY - (this.gradientSize * 3); y++) {
            for (var x = this.gradientSize * 3; x < this.numX - (this.gradientSize * 3); x++) {
                this.setTerrainType(this.grid[y][x]);
            }
        }
    }

    createOcean() {
        this.layerEmptyTop(0, this.numX, 0, TerrainType.ocean, TerrainType.beach, true);
        this.layerEmptyRight(this.numX - 1, 0, this.numY, TerrainType.ocean, TerrainType.beach, true);
        this.layerEmptyBelow(0, this.numX, this.numY - 1, TerrainType.ocean, TerrainType.beach, true);
        this.layerEmptyLeft(0, 0, this.numY, TerrainType.ocean, TerrainType.beach, true);
    }

    createBeach() {
        this.layerEmptyTop(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.gradientSize * 2, TerrainType.beach, TerrainType.dirt, true);
        this.layerEmptyRight(this.numX - 1 - (this.gradientSize * 2), this.gradientSize * 2, this.numY - (this.gradientSize * 2), TerrainType.beach, TerrainType.dirt, true);
        this.layerEmptyBelow(this.gradientSize * 2, this.numX - (this.gradientSize * 2) + 1, this.numY - 1 - (this.gradientSize * 2), TerrainType.beach, TerrainType.dirt, true);
        this.layerEmptyLeft(this.gradientSize * 2, this.gradientSize * 2, this.numY - (this.gradientSize * 2) + 1, TerrainType.beach, TerrainType.dirt, true);
    }

    createMountain() {
        var startX = Math.round((this.numX / 2) - this.gradientSize - (Math.random() * 10)),
            endX = Math.round((this.numX / 2) + this.gradientSize + (Math.random() * 10)),
            startY = Math.round((this.numY / 2) - this.gradientSize - (Math.random() * 10)),
            endY = Math.round((this.numY / 2) + this.gradientSize + (Math.random() * 10));

        for (var y = startY; y < endY; y++) {
            for (var x = startX; x < endX; x++) {
                this.setType(this.grid[y][x], TerrainType.mountain);
            }
        }
    }

    layerEmptyTop(startX: number, endX: number, startY: number, type: TerrainType, fillType: TerrainType, overwrite: boolean) {
        var prevPush = this.gradientSize;
        for (var x = startX; x < endX; x++) {
            var random = Math.random(),
                push = Math.round(this.gradientSize * random),
                middle = Math.round((push + prevPush) / 2);

            for (var y = startY; y < startY + (this.gradientSize * 2); y++) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (y < startY + this.gradientSize + middle) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }

            prevPush = push;
        }
    }

    layerEmptyRight(startX: number, startY: number, endY: number, type: TerrainType, fillType: TerrainType, overwrite: boolean) {
        var prevPush = this.gradientSize;
        for (var y = startY; y < endY; y++) {
            var random = Math.random(),
                push = Math.round(this.gradientSize * random),
                middle = Math.round((push + prevPush) / 2);

            for (var x = startX; x > startX - (this.gradientSize * 2); x--) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (x > startX - (this.gradientSize + middle)) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }

            prevPush = push;
        }
    }

    layerEmptyBelow(startX: number, endX: number, startY: number, type: TerrainType, fillType: TerrainType, overwrite: boolean) {
        var prevPush = this.gradientSize;
        for (var x = startX; x < endX; x++) {
            var random = Math.random(),
                push = Math.round(this.gradientSize * random),
                middle = Math.round((push + prevPush) / 2);

            for (var y = startY; y > startY - (this.gradientSize * 2); y--) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (y > startY - (this.gradientSize + middle)) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }

            prevPush = push;
        }
    }

    layerEmptyLeft(startX: number, startY: number, endY: number, type: TerrainType, fillType: TerrainType, overwrite: boolean) {
        var prevPush = this.gradientSize;
        for (var y = startY; y < endY; y++) {
            // generate values for random edges
            var random = Math.random(),
                push = Math.round((this.gradientSize * random)),
                middle = Math.round((push + prevPush) / 2); // keeps close rows similar 
			
            // loop through min * 2 for x and set the ocean/beach values
            for (var x = startX; x < startX + (this.gradientSize * 2); x++) {
                if (overwrite || !this.typeIsSet(this.grid[y][x])) {
                    if (x < startX + this.gradientSize + middle) {
                        this.setType(this.grid[y][x], type);
                    }
                    else if (fillType && this.grid[y][x].type != type) {
                        this.setType(this.grid[y][x], fillType);
                    }
                }
            }

            prevPush = push;
        }
    }

    render(canvas: HTMLCanvasElement) {
        var ctx = canvas.getContext("2d");
        for (var y in this.grid) {
            var row = this.grid[y];

            for (var x in row) {
                var block = row[x];
                this.renderBlock(block, ctx);
            }
        }
    }

    renderBlock(block: Block, ctx: CanvasRenderingContext2D) {
        //define the colour of the square
        ctx.fillStyle = block.bg;

        // Draw a square using the fillRect() method and fill it with the colour specified by the fillStyle attribute
        ctx.fillRect(block.x * this.tileSize, block.y * this.tileSize, this.tileSize, this.tileSize);       
    }

    setNearbyPointers(block) {
        block.above = block.y > 0 ? this.grid[block.y - 1][block.x] : null;
        block.below = block.y < this.numY - 2 ? this.grid[block.y + 1][block.x] : null;
        block.left = block.x > 0 ? this.grid[block.y][block.x - 1] : null;
        block.right = block.x < this.numX - 2 ? this.grid[block.y][block.x + 1] : null;
    }

    setTerrainType(block: Block) {
        if (block.type !== undefined && block.type !== null) {
            return;
        }
        else if (this.bordersDirt(block)) {
            var chances = {};

            if (((block.x < (this.numX / 2)) && block.x < this.gradientSize * 5) || // left side and close to left
                ((block.x > (this.numX / 2)) && block.x > this.numX - (this.gradientSize * 5)) || // left side and close to left
                ((block.y < (this.numY / 2)) && block.y < this.gradientSize * 5) || // left side and close to left
                ((block.y > (this.numY / 2)) && block.y > this.numY - (this.gradientSize * 5))) { // left side and close to left
                chances[TerrainType.dirt] = .8;
                chances[TerrainType.grass] = .2;
            }
            else {
                chances[TerrainType.dirt] = .6;
                chances[TerrainType.grass] = .4;
            }
            this.chanceType(block, chances);
        }
        else if (this.bordersGrass(block)) {
            var chances = {};
            chances[TerrainType.grass] = .8;
            chances[TerrainType.dirt] = .1;
            chances[TerrainType.rock] = .1;
            this.chanceType(block, chances);
        }
        else {
            var chances = {};
            chances[TerrainType.rock] = 1;
            this.chanceType(block, chances);
        }
    }

    typeIsSet(block: Block) {
        return block.type !== undefined && block.type !== null;
    }

    setType(block: Block, type: TerrainType) {
        if (type == TerrainType.ocean) {
            block.bg = "#0af";
            block.type = TerrainType.ocean;
        }
        else if (type == TerrainType.beach) {
            block.bg = "#eda";
            block.type = TerrainType.beach;
        }
        else if (type == TerrainType.grass) {
            block.bg = "#4a0";
            block.type = TerrainType.grass;
        }
        else if (type == TerrainType.dirt) {
            block.bg = "#cb8";
            block.type = TerrainType.dirt;
        }
        else if (type == TerrainType.rock) {
            block.bg = "#aaa";
            block.type = TerrainType.rock;
        }
        else if (type == TerrainType.mountain) {
            block.bg = "#444";
            block.type = TerrainType.mountain;
        }
    }

    chanceType(block, chance) {
        var start = 0,
            random = Math.random();

        for (var c in chance) {
            if (random >= start && random <= (chance[c] + start)) {
                return this.setType(block, c);
            }
            start += chance[c];
        }
    }

    bordersDirt(block) {
        return block.above.type === TerrainType.dirt ||
            //block.right.type === TerrainType.dirt ||
            //block.below.type === TerrainType.dirt ||
            block.left.type === TerrainType.dirt;
    }

    bordersGrass(block) {
        return block.above.type === TerrainType.grass ||
            //block.right.type === TerrainType.grass ||
            //block.below.type === TerrainType.grass ||
            block.left.type === TerrainType.grass;
    }
}

$(function () {
    var world = new World(800, 600, 1, 5);
    world.build();
    world.render((<HTMLCanvasElement>$('#canvas')[0]));
});