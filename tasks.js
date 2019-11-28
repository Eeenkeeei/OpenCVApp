const onOpenCvReady = () => {
    document.getElementById('status').innerHTML = 'Библиотека OpenCV.js загружена';
    console.log('Библиотека OpenCV.js загружена')
};
const resultCanvas = document.getElementById('canvasOutput_2_result');
const ctx = resultCanvas.getContext('2d');

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

        // блюр до преобразования
        let ksize = new cv.Size(store.blur, store.blur);
        // cv.GaussianBlur(image, image, ksize, 0, 0, cv.BORDER_DEFAULT);

        // перевод в HSV пространство
        cv.cvtColor(image, image, cv.COLOR_RGB2HSV);
        for (let i = 0; i < image.matSize[1]; i++) {
            for (let j = 0; j < image.matSize[0]; j++) {
                image.ucharPtr(j, i)[0] = store.hue; // 0 канал из HSV
                image.ucharPtr(j, i)[1] = store.value; // 1 канал из HSV
            }
        }
        // перевод в RGB пространство
        cv.cvtColor(image, image, cv.COLOR_HSV2RGB);

        // const step = this.store.clarity
        // // FIXME: резкость, матрица свертки некорректно работает
        // const dst = new cv.Mat();
        // const matr = [0.01*step, -0.0375*step, 0.0375 - 0.05*step,
        //     0.0375 - 0.05*step
        //     ];
        //
        // let kernel_matrix = new cv.Mat(3, 3, cv.CV_32FC1, matr);
        // cv.filter2D(image, dst, 32, kernel_matrix);
        // image = dst;

        cv.imshow('canvasOutput_2_result', image);
        image.delete();
        renderHistogram()
    }

    setCurrentImageValues = (hue, value, brightness, blur) => {
        this.store.hue = hue;
        this.store.value = value;
        this.store.brightness = brightness;
        this.store.blur = blur
    }
}

const store = new Store();
const resetImgButton = document.getElementById('ResetImgButton');
const imgElement = document.getElementById('imageSrc');
const saveImgButton = document.getElementById('SaveImgButton');

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
    cv.imshow('canvasOutput_2_result', mat);
    renderHistogram();
    mat.delete()
});

setTimeout(() => {
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput_2', mat);
    let image = cv.imread('canvasOutput_2');
    cv.imshow('canvasOutput_2_result', image);
    // перевод в RGB пространство
    cv.cvtColor(image, image, cv.COLOR_HSV2RGB);
    renderHistogram();
    image.delete()
}, 800);

const BlurInputRangeEl = document.getElementById('blurInputRange');
const BrightnessInputRangeEl = document.getElementById('BrightnessInputRange');
const HueInputRangeEl = document.getElementById('HueInputRange');
const ValueInputRangeEl = document.getElementById('ValueInputRange');
const ClarityInputRange = document.getElementById('ClarityInputRange');

const HueSpanText = document.getElementById('HueSpanText');
const ValueSpanText = document.getElementById('ValueSpanText');
const BrightnessSpanText = document.getElementById('BrightnessSpanText');

ClarityInputRange.addEventListener('input', (evt) => {
    store.saveValues('clarity', evt.target.value)
});

HueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('hue', evt.target.value)
    HueSpanText.textContent = "Значение: " + evt.target.value
});

ValueInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('value', evt.target.value);
    ValueSpanText.textContent = "Значение: " + evt.target.value
});

BrightnessInputRangeEl.addEventListener('input', (evt) => {
    store.saveValues('brightness', evt.target.value)
    BrightnessSpanText.textContent = "Значение: " + evt.target.value
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

