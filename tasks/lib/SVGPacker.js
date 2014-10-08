var SVGPacker;
(function (SVGPacker) {
    var BinaryBlock = (function () {
        function BinaryBlock(x, y, w, h, data, id, source) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.data = data;
            this.id = id;
            this.source = source;
        }
        return BinaryBlock;
    })();
    SVGPacker.BinaryBlock = BinaryBlock;
    var BinarySortType = (function () {
        function BinarySortType(value) {
            this.value = value;
        }
        // static sconstructor = (()=>{ return true})();
        BinarySortType.prototype.toString = function () {
            return this.value;
        };
        // values
        BinarySortType.WIDTH = new BinarySortType("width");
        BinarySortType.HEIGHT = new BinarySortType("height");
        BinarySortType.MAX_SIDE = new BinarySortType("maxside");
        BinarySortType.AREA = new BinarySortType("area");
        return BinarySortType;
    })();
    SVGPacker.BinarySortType = BinarySortType;
    var BinarySort = (function () {
        function BinarySort() {
        }
        BinarySort.w = function (a, b) {
            return b.w - a.w;
        };
        BinarySort.h = function (a, b) {
            return b.h - a.h;
        };
        BinarySort.a = function (a, b) {
            return b.area - a.area;
        };
        BinarySort.max = function (a, b) {
            return Math.max(b.w, b.h) - Math.max(a.w, a.h);
        };
        BinarySort.min = function (a, b) {
            return Math.min(b.w, b.h) - Math.min(a.w, a.h);
        };
        BinarySort.height = function (a, b) {
            return BinarySort.msort(a, b, ['h', 'w']);
        };
        BinarySort.width = function (a, b) {
            return BinarySort.msort(a, b, ['w', 'h']);
        };
        BinarySort.area = function (a, b) {
            return BinarySort.msort(a, b, ['a', 'h', 'w']);
        };
        BinarySort.maxside = function (a, b) {
            return BinarySort.msort(a, b, ['max', 'min', 'h', 'w']);
        };
        BinarySort.sort = function (blocks, sort) {
            if (!sort.match(/(random)|(w)|(h)|(a)|(max)|(min)|(height)|(width)|(area)|(maxside)/))
                return;
            blocks.sort((BinarySort[sort]));
        };
        BinarySort.msort = function (a, b, criteria) {
            /* sort by multiple criteria */
            var diff;
            var n;
            var total = criteria.length;
            for (n = 0; n < total; n++) {
                var sortMethod = BinarySort[criteria[n]];
                diff = sortMethod(a, b);
                if (diff != 0) {
                    return diff;
                }
            }
            return 0;
        };
        return BinarySort;
    })();
    SVGPacker.BinarySort = BinarySort;
    var BinaryPacker = (function () {
        function BinaryPacker() {
        }
        BinaryPacker.pack = function (blocks, mode) {
            BinarySort.sort(blocks, mode);
            BinaryPacker.fit(blocks);
        };
        BinaryPacker.fit = function (blocks) {
            var n;
            var node;
            var block;
            var len = blocks.length;
            var w = len > 0 ? blocks[0].w : 0;
            var h = len > 0 ? blocks[0].h : 0;
            BinaryPacker.root = {
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
        };
        BinaryPacker.findNode = function (root, w, h) {
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
        };
        BinaryPacker.splitNode = function (node, w, h) {
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
        };
        BinaryPacker.growNode = function (w, h) {
            var canGrowDown = (w <= BinaryPacker.root.w);
            var canGrowRight = (h <= BinaryPacker.root.h);
            var shouldGrowRight = canGrowRight && (BinaryPacker.root.h >= (BinaryPacker.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
            var shouldGrowDown = canGrowDown && (BinaryPacker.root.w >= (BinaryPacker.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height
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
        };
        BinaryPacker.growRight = function (w, h) {
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
            var node;
            if (node = BinaryPacker.findNode(BinaryPacker.root, w, h)) {
                return BinaryPacker.splitNode(node, w, h);
            }
            else {
                return null;
            }
        };
        BinaryPacker.growDown = function (w, h) {
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
            var node;
            if (node = BinaryPacker.findNode(BinaryPacker.root, w, h)) {
                return BinaryPacker.splitNode(node, w, h);
            }
            else {
                return null;
            }
        };
        return BinaryPacker;
    })();
    SVGPacker.BinaryPacker = BinaryPacker;
    var DynamicTextureAtlas = (function () {
        /**
         * Creates a new DynamicTextureAtlas
         * @param uid A unique identifier for use with DynamicTextureAtlas.getLibrary method
         * @param shapePadding The padding value that is appened to each Image Block
         */
        function DynamicTextureAtlas(uid, shapePadding) {
            if (shapePadding === void 0) { shapePadding = 2; }
            this.uid = uid;
            this.shapePadding = shapePadding;
            /**
             * Contains the blocks used in the Binary Packing
             * @type {Array}
             */
            this.blocks = [];
        }
        /**
         * Add an element to the DynamicTextureAtlas
         * @param id The id that will be used to identify the element in the json SpriteAtlas
         * @param image
         * @param source
         */
        DynamicTextureAtlas.prototype.add = function (id, image, source) {
            var block;
            var shapePadding2x = this.shapePadding * 2;
            block = new BinaryBlock(this.shapePadding, this.shapePadding, image.width + shapePadding2x, image.height + shapePadding2x, image, id, source);
            this.blocks.push(block);
        };
        /**
         * Packs all block elements and generates the BaseTexture & TextureAtlas
         * @param mode
         */
        DynamicTextureAtlas.prototype.render = function (mode) {
            if (mode === void 0) { mode = BinarySortType.MAX_SIDE; }
            var i;
            var total;
            // Packs & Order the image blocks
            BinaryPacker.pack(this.blocks, mode.toString());
            var w = BinaryPacker.root.w;
            var h = BinaryPacker.root.h;
            var svgIntro = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + '" height="' + h + '">';
            svgIntro += '<g id="___svgroot___" transform="scale(1,1)">';
            var textureAtlas = {
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
                var cur = this.blocks[i];
                var x = cur.fit.x + this.shapePadding;
                var y = cur.fit.y + this.shapePadding;
                var cw = cur.fit.w - (this.shapePadding * 2);
                var ch = cur.fit.h - (this.shapePadding * 2);
                textureAtlas.frames[cur.id] = {
                    frame: { x: x, y: y, w: cw, h: ch },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: x, y: y, w: cw, h: ch },
                    sourceSize: { w: cw, h: ch }
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
        };
        DynamicTextureAtlas.prototype.getNextPowerOfTwo = function (num) {
            if (num > 0 && (num & (num - 1)) == 0) {
                return num;
            }
            else {
                var result = 1;
                while (result < num)
                    result <<= 1;
                return result;
            }
        };
        return DynamicTextureAtlas;
    })();
    SVGPacker.DynamicTextureAtlas = DynamicTextureAtlas;
})(SVGPacker = exports.SVGPacker || (exports.SVGPacker = {}));
