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
    src.delete(); dst.delete();
}, 800);

const BlurInputRangeEl = document.getElementById('blurInputRange');

BlurInputRangeEl.addEventListener('input', (evt) => {
    let src = cv.imread('canvasOutput_2');
    let dst = new cv.Mat();
// You can try more different parameters
    cv.medianBlur(src, dst, Number(evt.target.value));
    cv.imshow('canvasOutput_2_result', dst);
    src.delete(); dst.delete();
});


