const onOpenCvReady = () => {
    document.getElementById('status').innerHTML = 'Библиотека OpenCV.js загружена';
    console.log('Библиотека OpenCV.js загружена')
};

class Store {
    store = {
        hue: 0,
        value: 0,
        brightness: 0,
        blur: 0,
    };

    saveValues(key, value) {
        this.store[key] = Number(value);
        this.displayWithChanges(this.store);
    }

    displayWithChanges(store) {
        let image = cv.imread('canvasOutput_2');
        // Смена яркости
        image.convertTo(image, -1, 1, store.brightness);

        // // блюр до преобразования
        // let blur = new cv.Mat();
        // let ksize = new cv.Size(store.blur, store.blur);
        // cv.GaussianBlur(brightness, blur, ksize, 0, 0, cv.BORDER_DEFAULT);
        // cv.imshow('canvasOutput_2_result', blur);

        //
        // // перевод в HSV пространство
        cv.cvtColor(image, image, cv.COLOR_RGB2HSV);
        for (let i = 0; i < image.matSize[1]; i++) {
            for (let j = 0; j < image.matSize[0]; j++) {
                image.ucharPtr(j, i)[0] = store.hue; // 0 канал из HSV
                image.ucharPtr(j, i)[1] = store.value; // 1 канал из HSV
            }
        }
        // // перевод в RGB пространство
        cv.cvtColor(image, image, cv.COLOR_HSV2RGB);

        cv.imshow('canvasOutput_2_result', image);
        image.delete();
        renderHistogram()
    }
}

const store = new Store();
const resetImgButton = document.getElementById('ResetImgButton');
const imgElement = document.getElementById('imageSrc');

resetImgButton.addEventListener('click', () => {
    let mat = cv.imread('canvasOutput_2');
    cv.imshow('canvasOutput_2_result', mat);
    renderHistogram();
    mat.delete()
});

setTimeout(() => {
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput_2', mat);
    let src = cv.imread('canvasOutput_2');
    let dst = new cv.Mat();
// You can try more different parameters
    cv.medianBlur(src, dst, 1);
    cv.imshow('canvasOutput_2_result', dst);
    renderHistogram();
    src.delete();
    dst.delete();
}, 800);

const BlurInputRangeEl = document.getElementById('blurInputRange');
const BrightnessInputRangeEl = document.getElementById('BrightnessInputRange');
const HueInputRangeEl = document.getElementById('HueInputRange');
const ValueInputRangeEl = document.getElementById('ValueInputRange');

HueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('hue', evt.target.value)
});

ValueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('value', evt.target.value);
});

BrightnessInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('brightness', evt.target.value)
});

BlurInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('blur', evt.target.value)
});

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
    let color = new cv.Scalar(255, 255, 255);
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

