(function () {
    'use strict';

    /**
     * Create a buffer.
     *
     * @param {HTMLImg | HTMLCanvas} rawData
     *
     * @return {HTMLCanvas}
     */
    function createBuffer(rawData) {
        var buffer = document.createElement('canvas');
        var bufferCtx = buffer.getContext('2d');

        buffer.width  = rawData.width;
        buffer.height = rawData.height;
        bufferCtx.drawImage(rawData, 0, 0);

        return buffer;
    }

    /**
     * Create a weight
     *
     * @param {number} dispersion
     * @param {number} radius
     *
     * @return {Array} weight
     */
    function createWeight(dispersion, radius) {
        var weight = [];
        var total  = 0.0;

        for (var i = 0; i < radius; i++) {
            var w = Math.exp(-0.5 * (i * i) / dispersion);
            weight[i] = w;
            if (i > 0) {
                w *= 2.0;
            }
            total += w;
        }
        
        for (var i = 0; i < radius; i++) {
            weight[i] /= total;
        }

        return weight;
    }
    
    /**
     *  Get pixel at `x, y`
     *
     *  @param {CanvasImageData} imageData
     *  @param {Array<number>} pixels
     *
     *  @return {Array}
     */
    function getPixels(imageData, pixels) {
        var width  = imageData.width;
        var height = imageData.height;
        var data   = imageData.data;

        var result = [];
        for (var i = 0, l = pixels.length; i < l; i++) {
            var x = pixels[i][0] - 1;
            var y = pixels[i][1] - 1;

            if (x < 0) {
                x = 0;
            }
            else if (x > width - 1) {
                x = width - 1;
            }

            if (y < 0) {
                y = 0;
            }
            else if (y > height - 1) {
                y = height - 1;
            }
            var pos = (x + (y * width)) * 4;
            result.push([
                data[pos + 0],
                data[pos + 1],
                data[pos + 2],
                data[pos + 3]
            ]);
        }

        return result;
    }

    /**
     *  Put pixel at `x, y`
     *
     *  @param {CanvasImageData} imageData
     *  @param {Array<number>} pixels
     */
    function putPixels(imageData, pixels) {
        var width  = imageData.width;
        var height = imageData.height;
        var data   = imageData.data;

        for (var i = 0, l = pixels.length; i < l; i++) {
            var x = pixels[i][0] - 1;
            var y = pixels[i][1] - 1;

            if (x < 0) {
                x = 0;
            }
            else if (x > width - 1) {
                x = width - 1;
            }

            if (y < 0) {
                y = 0;
            }
            else if (y > height - 1) {
                y = height - 1;
            }

            var pos = (x + (y * width)) * 4;
            var color = pixels[i][2];
            data[pos + 0] = color[0];
            data[pos + 1] = color[1];
            data[pos + 2] = color[2];
            data[pos + 3] = color[3];
        }
    }


    function blur(img, dispersion, radius) {
        var buffer    = createBuffer(img);
        var bufferCtx = buffer.getContext('2d');
        
        // src用画像データを取得
        var src  = bufferCtx.getImageData(0, 0, buffer.width, buffer.height);

        if (dispersion === 0 || radius === 0) {
            return src;
        }

        // ブラー用に2つのレンダリング用バッファを生成
        var dst1 = bufferCtx.createImageData(src);
        var dst2 = bufferCtx.createImageData(src);
        
        _blur(src, dst1, dispersion, radius, false);
        _blur(dst1, dst2, dispersion, radius, true);

        return dst2;
    }
    window.blur = blur;

    /**
     * @param {HTMLCanvasImageData} src
     * @param {HTMLCanvasImageData} dst
     * @param {number} dispersion
     * @param {number} radius
     * @param {boolean} isVertical
     */
    function _blur(src, dst, dispersion, radius, isVertical) {
        var weight = createWeight(dispersion, radius);

        var width  = src.width;
        var height = src.height;

        var dstColor = [];
        for (var y = 1; y <= height; y++) {
            for (var x = 1; x <= width; x++) {

                var color = [0, 0, 0, 254];

                var pixel0 = getPixels(src, [[x, y]]);
                var w0 = weight[0];
                color[0] += pixel0[0][0] * w0;
                color[1] += pixel0[0][1] * w0;
                color[2] += pixel0[0][2] * w0;

                var pixels = [];
                for (var i = 1, l = radius - 1; i < l; i++) {
                    if (isVertical) {
                        pixels.push([x, (y + i)]);
                        pixels.push([x, (y - i)]);
                    }
                    else {
                        pixels.push([(x + i), y]);
                        pixels.push([(x - i), y]);
                    }
                }

                var pixelsColor = getPixels(src, pixels);

                for (var i = 0, l = pixelsColor.length; i < l; i += 2) {
                    var wPos = (i / 2) + 1;
                    var w  = weight[wPos];
                    var positivePixel = pixelsColor[i + 0];
                    var negativePixel = pixelsColor[i + 1];
                    color[0] += positivePixel[0] * w;
                    color[1] += positivePixel[1] * w;
                    color[2] += positivePixel[2] * w;

                    color[0] += negativePixel[0] * w;
                    color[1] += negativePixel[1] * w;
                    color[2] += negativePixel[2] * w;
                }


                if (color[0] > 254) {
                    color[0] = 254;
                }
                else if (color[0] < 0) {
                    color[0] = 0;
                }

                if (color[1] > 254) {
                    color[1] = 254;
                }
                else if (color[1] < 0) {
                    color[1] = 0;
                }

                if (color[2] > 254) {
                    color[2] = 254;
                }
                else if (color[2] < 0) {
                    color[2] = 0;
                }

                dstColor.push([x, y, color]);
            }
        }

        putPixels(dst, dstColor);
    }

}());

////////////////////////////////////////////////////////////////////////////

/**
 * onDrop
 * @param {Object.Event} e event object.
 * @return undefined
 */
function onDrop(e) {

    var files = e.dataTransfer.files,
        i = 0, f = 0, l,
        fileList = [],
        readers = [],
        viewer = document.getElementById('viewBox');

    for (l = files.length; i < l; i++) {
        if (files[i].type.match(/image\/(jpeg|png|gif|svg)/)[1]) {
            fileList.push(files[i]);
        }
    }

    //if files not exist, return.
    if (fileList.length === 0) {
        e.stopPropagation();
        return false;
    }

    for (l = fileList.length; f < l; f++) {
        readers[f] = new FileReader();
        readers[f].onload = (function (f) {

            var num = f;

            return function () {

                var fileContent = readers[num].result;
                var index = 0;
                var data;

                currentImg = new Image();
                currentImg.src = fileContent;                
                currentImg.onload = function () {
                    doBlur(this);
                };
            }
        })(f);

        readers[f].readAsDataURL(fileList[f]);
    }

    e.preventDefault();
    e.stopPropagation();
}

/**
 * onDragEnter
 * @return undefined
 */
function onDragEnter(e) {
    e.target.classList.add('hover');
    e.stopPropagation();
}

/**
 * onDragLeave
 * @param {Object.Event} e event object.
 * @return undefined
 */
function onDragLeave(e) {
    e.target.classList.remove('hover');
}

/**
 * onDragOver
 * @param {Object.Event} e event object.
 * @return undefined
 */
function onDragOver(e) {
    e.preventDefault();
}

////////////////////////////////////////////////////////////////////////////

//attach `dragover` function to dragover event.
document.body.addEventListener('dragover', function (e) {
    e.preventDefault();
}, false);

function doBlur(img) {
    var data = blur(img, +range.value, +radius.value);
    var cv = document.getElementById('viewCanvas');
    var ctx = cv.getContext('2d');
    cv.width  = img.width;
    cv.height = img.height;
    ctx.putImageData(data, 0, 0);
}

var currentImg = new Image();
var range = document.getElementById('range');
var rangeDisplay = document.getElementById('rangeDisplay');
range.addEventListener('change', function (e) {
    doBlur(currentImg);
    rangeDisplay.innerHTML = this.value;
}, false);

var radius = document.getElementById('radius');
var radiusDisplay = document.getElementById('radiusDisplay');
radius.addEventListener('change', function (e) {
    doBlur(currentImg);
    radiusDisplay.innerHTML = this.value;
}, false);

currentImg.onload = function () {
    doBlur(this);
};

currentImg.src = 'http://jsrun.it/assets/v/U/e/3/vUe3Q.png';
