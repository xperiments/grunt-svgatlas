

export module SVGPacker {

    export interface INodeImage {
        width: number;
        height: number;
        type: string;
    }

    export interface IBinaryBlock {

        x: number;
        y: number;
        w: number;
        h: number;
        source?: string;
        id?: string;
        data?: any;
        area?: number;
        used?: boolean;
        down?: IBinaryBlock;
        right?: IBinaryBlock;
        fit?: IBinaryBlock;


    }

    export class BinaryBlock implements IBinaryBlock {
        area: number;
        used: boolean;
        down: BinaryBlock;
        right: BinaryBlock;
        fit: BinaryBlock;
        constructor(public x: number, public y: number, public w: number, public h: number, public data: any, public id: string, public source: string) { }
    }


    export interface IBinarySort {
        (a: IBinaryBlock, b: IBinaryBlock): number;
    }

    export class BinarySortType {
        constructor(private value: string) { }
        // static sconstructor = (()=>{ return true})();
        public toString() { return this.value; }

        // values
        public static WIDTH: BinarySortType = new BinarySortType("width");
        public static HEIGHT: BinarySortType = new BinarySortType("height");
        public static MAX_SIDE: BinarySortType = new BinarySortType("maxside");
        public static AREA: BinarySortType = new BinarySortType("area");
    }

    export class BinarySort {
        public static w(a: IBinaryBlock, b: IBinaryBlock): number { return b.w - a.w; }
        public static h(a: IBinaryBlock, b: IBinaryBlock): number { return b.h - a.h; }
        public static a(a: IBinaryBlock, b: IBinaryBlock): number { return b.area - a.area; }
        public static max(a: IBinaryBlock, b: IBinaryBlock): number { return Math.max(b.w, b.h) - Math.max(a.w, a.h); }
        public static min(a: IBinaryBlock, b: IBinaryBlock): number { return Math.min(b.w, b.h) - Math.min(a.w, a.h); }

        public static height(a: IBinaryBlock, b: IBinaryBlock): number { return BinarySort.msort(a, b, ['h', 'w']); }
        public static width(a: IBinaryBlock, b: IBinaryBlock): number { return BinarySort.msort(a, b, ['w', 'h']); }
        public static area(a: IBinaryBlock, b: IBinaryBlock): number { return BinarySort.msort(a, b, ['a', 'h', 'w']); }
        public static maxside(a: IBinaryBlock, b: IBinaryBlock): number { return BinarySort.msort(a, b, ['max', 'min', 'h', 'w']); }

        public static sort(blocks: IBinaryBlock[], sort: string): void {
            if (!sort.match(/(random)|(w)|(h)|(a)|(max)|(min)|(height)|(width)|(area)|(maxside)/)) return;

            blocks.sort(<IBinarySort>(BinarySort[sort]));
        }

        private static msort(a: IBinaryBlock, b: IBinaryBlock, criteria: string[]): number {
            /* sort by multiple criteria */
            var diff: number;
            var n: number;
            var total: number = criteria.length;
            for (n = 0; n < total; n++) {
                var sortMethod: IBinarySort = <IBinarySort>BinarySort[criteria[n]];
                diff = sortMethod(a, b);
                if (diff != 0) {
                    return diff;
                }

            }
            return 0;
        }

    }
    export class BinaryPacker {
        public static root: IBinaryBlock;

        public static pack(blocks: IBinaryBlock[], mode: string): void {
            BinarySort.sort(blocks, mode);
            BinaryPacker.fit(blocks);
        }
        private static fit(blocks: IBinaryBlock[]): void {
            var n: number;
            var node: IBinaryBlock;
            var block: IBinaryBlock;

            var len: number = blocks.length;

            var w: number = len > 0 ? blocks[0].w : 0;
            var h: number = len > 0 ? blocks[0].h : 0;

            BinaryPacker.root = <IBinaryBlock>{
                x: 0,
                y: 0,
                w: w,
                h: h
            };
            for (n = 0; n < len; n++) {
                block = blocks[n];
                if (node = BinaryPacker.findNode(BinaryPacker.root, block.w, block.h)) {
                    block.fit = BinaryPacker.splitNode(node, block.w, block.h);
                }
                else {
                    block.fit = BinaryPacker.growNode(block.w, block.h);
                }
            }
        }

        private static findNode(root: IBinaryBlock, w: number, h: number): IBinaryBlock {
            if (root.used) {
                return BinaryPacker.findNode(root.right, w, h) || BinaryPacker.findNode(root.down, w, h);
            }
            else {
                if ((w <= root.w) && (h <= root.h)) {
                    return root;
                }
                else {
                    return null;
                }
            }
        }

        private static splitNode(node: IBinaryBlock, w: number, h: number): IBinaryBlock {
            node.used = true;
            node.down = {
                x: node.x,
                y: node.y + h,
                w: node.w,
                h: node.h - h
            };
            node.right = {
                x: node.x + w,
                y: node.y,
                w: node.w - w,
                h: h
            };
            return node;
        }

        private static growNode(w: number, h: number): IBinaryBlock {
            var canGrowDown: boolean = (w <= BinaryPacker.root.w);
            var canGrowRight: boolean = (h <= BinaryPacker.root.h);

            var shouldGrowRight: boolean = canGrowRight && (BinaryPacker.root.h >= (BinaryPacker.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
            var shouldGrowDown: boolean = canGrowDown && (BinaryPacker.root.w >= (BinaryPacker.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height

            if (shouldGrowRight)
                return BinaryPacker.growRight(w, h);
            else if (shouldGrowDown)
                return BinaryPacker.growDown(w, h);
            else if (canGrowRight)
                return BinaryPacker.growRight(w, h);
            else if (canGrowDown)
                return BinaryPacker.growDown(w, h);
            else
                return null; // need to ensure sensible root starting size to avoid this happening
        }

        private static growRight(w: number, h: number): IBinaryBlock {
            BinaryPacker.root = {
                used: true,
                x: 0,
                y: 0,
                w: BinaryPacker.root.w + w,
                h: BinaryPacker.root.h,
                down: BinaryPacker.root,
                right: {
                    x: BinaryPacker.root.w,
                    y: 0,
                    w: w,
                    h: BinaryPacker.root.h
                }
            };
            var node: IBinaryBlock;
            if (node = BinaryPacker.findNode(BinaryPacker.root, w, h)) {
                return BinaryPacker.splitNode(node, w, h);
            }
            else {
                return null;
            }
        }

        private static growDown(w: number, h: number): IBinaryBlock {
            BinaryPacker.root = {
                used: true,
                x: 0,
                y: 0,
                w: BinaryPacker.root.w,
                h: BinaryPacker.root.h + h,
                down: {
                    x: 0,
                    y: BinaryPacker.root.h,
                    w: BinaryPacker.root.w,
                    h: h
                },
                right: BinaryPacker.root
            };
            var node: IBinaryBlock;
            if (node = BinaryPacker.findNode(BinaryPacker.root, w, h)) {
                return BinaryPacker.splitNode(node, w, h);
            }
            else {
                return null;
            }
        }
    }

    export interface TextureAtlas {
        [s: string]: TextureAtlasElement;
    }

    export interface TextureAtlasElement {
        frame: TextureAtlasFrame;
        rotated: boolean;
        trimmed: boolean;
        spriteSourceSize: TextureAtlasFrame;
        sourceSize: TextureAtlasSourceSize;
    }

    export interface TextureAtlasFrame {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    export interface TextureAtlasSourceSize {
        w: number;
        h: number;
    }

    export class DynamicTextureAtlas {

        /**
         * Contains the blocks used in the Binary Packing
         * @type {Array}
         */
        private blocks: IBinaryBlock[] = [];

        /**
         * Creates a new DynamicTextureAtlas
         * @param uid A unique identifier for use with DynamicTextureAtlas.getLibrary method
         * @param shapePadding The padding value that is appened to each Image Block
         */
        constructor(public uid: string, public shapePadding: number = 2) { }

        /**
         * Add an element to the DynamicTextureAtlas
         * @param id The id that will be used to identify the element in the json SpriteAtlas
         * @param image
         * @param source
         */
        public add(id: string, image: INodeImage, source: string): void {

            var block: BinaryBlock;
            var shapePadding2x: number = this.shapePadding * 2;


            block = new BinaryBlock
                (
                this.shapePadding,
                this.shapePadding,
                image.width + shapePadding2x,
                image.height + shapePadding2x,
                image,
                id,
                source
                );
            this.blocks.push(block);
        }



        /**
         * Packs all block elements and generates the BaseTexture & TextureAtlas
         * @param mode
         */
        public render(mode: BinarySortType = BinarySortType.MAX_SIDE): { svg: string; atlas: any; } {
            var i: number;
            var total: number;
            // Packs & Order the image blocks
            BinaryPacker.pack(this.blocks, mode.toString());
            var w = BinaryPacker.root.w;
            var h = BinaryPacker.root.h;

            var svgIntro: string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + '" height="' + h + '">';
            svgIntro += '<g id="___svgroot___" transform="scale(1,1)">';
            var textureAtlas: { frames: TextureAtlas } = {
                frames: {},
                meta: {
                    "app": "http://www.github.com/xperiments/grunt-svgatlas",
                    "version": "1.0",
                    "image": "atlas.svg",
                    "format": "RGBA8888",
                    "size": {
                        "w": w,
                        "h": h
                    },
                    "scale": "1"
                }
            };

            for (i = 0, total = this.blocks.length; i < total; i++) {
                var cur: IBinaryBlock = this.blocks[i];

                var x = cur.fit.x + this.shapePadding;
                var y = cur.fit.y + this.shapePadding;
                var cw = cur.fit.w - (this.shapePadding * 2);
                var ch = cur.fit.h - (this.shapePadding * 2);
                textureAtlas.frames[cur.id] = <TextureAtlasElement> {

                    frame: <TextureAtlasFrame>{ x: x, y: y, w: cw, h: ch },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: <TextureAtlasFrame>{ x: x, y: y, w: cw, h: ch },
                    sourceSize: <TextureAtlasSourceSize>{ w: cw, h: ch }

                };
                // add positioned svg item
                svgIntro += '<svg x="' + x + '" y="' + y + '">' + cur.source + '</svg>\n';

            }


            svgIntro += '</g></svg>';
            this.blocks = null;

            return {
                svg: svgIntro,
                atlas: textureAtlas

            };
        }

        private getNextPowerOfTwo(num: number): number {
            if (num > 0 && (num & (num - 1)) == 0) {
                return num;
            }
            else {
                var result: number = 1;
                while (result < num) result <<= 1;
                return result;
            }
        }
    }
}