const onOpenCvReady = () => {
    document.getElementById('status').innerHTML = 'Библиотека OpenCV.js загружена';
    console.log('Библиотека OpenCV.js загружена')
};

const imgElement = document.getElementById('imageSrc');

setTimeout(() => {
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput_2', mat);
    let src = cv.imread('canvasOutput_2');
    let dst = new cv.Mat();
// You can try more different parameters
    cv.medianBlur(src, dst, 1);
    cv.imshow('canvasOutput_2_result', dst);
    renderHistogram();
    src.delete(); dst.delete();
}, 800);

const BlurInputRangeEl = document.getElementById('blurInputRange');

BlurInputRangeEl.addEventListener('input', (evt) => {
    let src = cv.imread('canvasOutput_2');
    let dst = new cv.Mat();
// You can try more different parameters
    cv.medianBlur(src, dst, Number(evt.target.value));
    cv.imshow('canvasOutput_2_result', dst);
    renderHistogram();
    src.delete(); dst.delete();
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
    src.delete(); dst.delete(); srcVec.delete(); mask.delete(); hist.delete();
};

