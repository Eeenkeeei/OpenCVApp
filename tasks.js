const onOpenCvReady = () => {
    document.getElementById('status').innerHTML = 'Библиотека OpenCV.js загружена';
    console.log('Библиотека OpenCV.js загружена')
};

const BlurInputRangeEl = document.getElementById('blurInputRange');
const BrightnessInputRangeEl = document.getElementById('BrightnessInputRange');
const HueInputRangeEl = document.getElementById('HueInputRange');
const ValueInputRangeEl = document.getElementById('ValueInputRange');
const ClarityInputRange = document.getElementById('ClarityInputRange');
const HueSpanText = document.getElementById('HueSpanText');
const ValueSpanText = document.getElementById('ValueSpanText');
const BrightnessSpanText = document.getElementById('BrightnessSpanText');
const resultCanvas = document.getElementById('canvasOutput_2_result');
const resetImgButton = document.getElementById('ResetImgButton');
const imgElement = document.getElementById('imageSrc');
const saveImgButton = document.getElementById('SaveImgButton');
const uploadButton = document.getElementById('uploadButton');
const fileInputElement = document.getElementById('fileInput');
const ctx = resultCanvas.getContext('2d');
let startImage;

class Store {
    store = {
        hue: 0,
        value: 0,
        brightness: 0,
        blur: 0,
        clarity: 0
    };

    saveValues(key, value) {
        this.store[key] = Number(value);
        this.displayWithChanges(this.store);
    }

    displayWithChanges(store) {
        let image = cv.imread('canvasOutput_2');
        // Смена яркости
        image.convertTo(image, -1, 1, store.brightness);

        // перевод в HSV пространство
        cv.cvtColor(image, image, cv.COLOR_RGB2HSV);
        for (let i = image.matSize[1]; i--;) {
            for (let j = image.matSize[0]; j--;) {
                image.ucharPtr(j, i)[0] = store.hue; // 0 канал из HSV
                image.ucharPtr(j, i)[1] = store.value; // 1 канал из HSV
            }
        }
        // перевод в RGB пространство
        cv.cvtColor(image, image, cv.COLOR_HSV2RGB);

        cv.imshow('canvasOutput_2_result', image);
        image.delete();
        renderHistogram()
    }
}

const store = new Store();

saveImgButton.addEventListener('click', () => {
    const dataURL = resultCanvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = dataURL;
    link.download = "image.jpg";
    link.click();
    document.body.removeChild(link);
});


resetImgButton.addEventListener('click', () => {
    let mat = cv.imread('canvasOutput_2');
    cv.imshow('canvasOutput_2_result', startImage);
    renderHistogram();
    mat.delete()
});

fileInputElement.addEventListener('input', (evt) => {
    imgElement.src = window.URL.createObjectURL(fileInputElement.files[0]);
    setTimeout(updateImage, 100)
});

uploadButton.addEventListener('click', (evt) => {
    fileInputElement.click();
});



const updateImage = () => {
    let mat = cv.imread(imgElement);
    startImage = mat;
    cv.imshow('canvasOutput_2', mat);
    let image = cv.imread('canvasOutput_2');
    cv.imshow('canvasOutput_2_result', image);
    const height = mat.rows;
    const width = mat.cols;
    console.log(image.matSize[0]);
    console.log(image.matSize[1]);

    const heightBlocks = height / 100 > Math.floor(height/100) ? Math.floor(height/100) + 1 : height / 100;
    const widthBlocks = width / 100 > Math.floor(width/100) ? Math.floor(width/100) + 1 : width / 100;

    const heightBlocksArr = [];
    const widthBlocksArr = [];

    let heightCounter = 1;
    let widthCounter = 1;

    while (heightCounter <= heightBlocks) {
        heightBlocksArr.push(heightCounter-1); // делаем -1 потому что считаем с нулевых пикселей, а значит с нулевого счетчика
        heightCounter++
    }

    while (widthCounter <= widthBlocks) {
        widthBlocksArr.push(widthCounter-1);
        widthCounter++
    }

    console.log(heightBlocksArr);
    console.log(widthBlocksArr);

    heightBlocksArr.forEach(i => {
        widthBlocksArr.forEach(j => {
            calculating(i, j, image)
        })
    });

    console.log('Количество блоков: ',heightBlocksArr.length * widthBlocksArr.length);

    renderHistogram();
    image.delete()
};

const calculating = (startHeightCounter, startWidthCounter, image) => {
    for (let i = startWidthCounter*100; i < startWidthCounter*100 + 100; i++) {
        for (let j = startHeightCounter*100; j < startHeightCounter*100 + 100; j++) {
            // image.ucharPtr(j, i)[0] = store.hue; // 0 канал из HSV
            // image.ucharPtr(j, i)[1] = store.value; // 1 канал из HSV
        }
    }

    console.log('startWidth: ', startWidthCounter*100, ' end: ', startWidthCounter*100 + 100, ' startHeight: ',startHeightCounter*100, 'heightEnd: ', startHeightCounter*100 + 100)
};

setTimeout(() => {
    updateImage()
}, 800);

ClarityInputRange.addEventListener('input', (evt) => {
    store.saveValues('clarity', evt.target.value)
});

HueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('hue', evt.target.value);
    HueSpanText.textContent = "Значение: " + evt.target.value
});

ValueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('value', evt.target.value);
    ValueSpanText.textContent = "Значение: " + evt.target.value
});

BrightnessInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('brightness', evt.target.value);
    BrightnessSpanText.textContent = "Значение: " + evt.target.value
});

BlurInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('blur', evt.target.value)
});

resultCanvas.addEventListener('mousedown', (evt) => {
    let mouseDownPoint;
    let mouseUpPoint;
    // сброс картинки на исходную
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput_2', mat);
    mouseDownPoint = new cv.Point(evt.offsetX, evt.offsetY);
    resultCanvas.addEventListener('mouseup', (evt) => {
        mouseUpPoint = new cv.Point(evt.offsetX, evt.offsetY);
        drawRectangle(mouseDownPoint, mouseUpPoint);
        mouseUpPoint = null;
        mouseDownPoint = null;
    });
    mat.delete()
});


const drawRectangle = (mouseDownPoint, mouseUpPoint) => {
    let startImage = cv.imread(imgElement);
    let image = cv.imread(resultCanvas);
    cv.rectangle(image, mouseDownPoint, mouseUpPoint, new cv.Scalar(255, 255, 255, 255), 2);
    let height = mouseUpPoint.y - mouseDownPoint.y;
    let width = mouseUpPoint.x - mouseDownPoint.x;
    let result = new cv.Mat(height, width, cv.CV_8UC3);

    for (let i = 0; i < image.matSize[1]; i++) {
        for (let j = 0; j < image.matSize[0]; j++) {
            if (i >= mouseDownPoint.x && i <= mouseUpPoint.x) {
                if (j >= mouseDownPoint.y && j <= mouseUpPoint.y) {
                    let R = startImage.ucharPtr(j, i)[0];
                    let G = startImage.ucharPtr(j, i)[1];
                    let B = startImage.ucharPtr(j, i)[2];
                    result.ucharPtr(j - mouseDownPoint.y, i - mouseDownPoint.x)[0] = R;
                    result.ucharPtr(j - mouseDownPoint.y, i - mouseDownPoint.x)[1] = G;
                    result.ucharPtr(j - mouseDownPoint.y, i - mouseDownPoint.x)[2] = B;
                }
            }
        }
    }

    cv.imshow('canvasOutput_2', result);
    cv.imshow('canvasOutput_2_result', result);
    image.delete();
    result.delete();
    startImage.delete()
};

const renderHistogram = () => {
    let src = cv.imread('canvasOutput_2_result');
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    let srcVec = new cv.MatVector();
    srcVec.push_back(src);
    let accumulate = false;
    let channels = [0];
    let histSize = [256];
    let ranges = [0, 255];
    let hist = new cv.Mat();
    let mask = new cv.Mat();
    let color = new cv.Scalar(224, 224, 224);
    let scale = 2;
// You can try more different parameters
    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
    let result = cv.minMaxLoc(hist, mask);
    let max = result.maxVal;
    let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale,
        cv.CV_8UC3);
// draw histogram
    for (let i = 0; i < histSize[0]; i++) {
        let binVal = hist.data32F[i] * src.rows / max;
        let point1 = new cv.Point(i * scale, src.rows - 1);
        let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
    }
    cv.imshow('histogram', dst);
    src.delete();
    dst.delete();
    srcVec.delete();
    mask.delete();
    hist.delete();
};

