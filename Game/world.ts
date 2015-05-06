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
    rock
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

    render(container: HTMLElement) {
        for (var y in this.grid) {
            var row = this.grid[y];

            for (var x in row) {
                var block = row[x];
                this.renderBlock(block, container);
            }
        }
    }

    renderBlock(block: Block, container: HTMLElement) {
        var div = document.createElement("div");
        div.style.width = this.tileSize + "px";
        div.style.height = this.tileSize + "px";
        div.style.backgroundColor = block.bg;
        container.appendChild(div);
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
        else if (this.bordersBeach(block)) {
            var chances = {};
            chances[TerrainType.beach] = .6;
            //chances[terrainType.grass] = .3;
            chances[TerrainType.dirt] = .4;
            this.chanceType(block, chances);
        }
        else {
            var chances = {};
            chances[TerrainType.grass] = .4;
            chances[TerrainType.dirt] = .4;
            chances[TerrainType.rock] = .2;
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
            block.bg = "#ac5";
            block.type = TerrainType.grass;
        }
        else if (type == TerrainType.dirt) {
            block.bg = "#cb8";
            block.type = TerrainType.dirt;
        }
        else if (type == TerrainType.rock) {
            block.bg = "#bbb";
            block.type = TerrainType.rock;
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

    bordersBeach(block) {
        return block.above.type === TerrainType.beach ||
            block.right.type === TerrainType.beach ||
            block.below.type === TerrainType.beach ||
            block.left.type === TerrainType.beach;
    }
}

$(function () {
    var world = new World(400, 300, 2, 10);
    world.build();
    world.render($('#container')[0]);
});