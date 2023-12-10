let video, handpose, detections, img;
let isFreehandMode = false;
let previousIndexFingerPositions = [];
let selectionMode = false;
let regionCaptured = false;
let capturedRegion, capturedRegionWidth, capturedRegionHeight;


function setup() {
    createCanvas(1280, 480);
    img = loadImage('resized.png');
    video = createCapture(VIDEO);
    video.size(width / 2, height);
    video.hide();
    handpose = ml5.handpose(video, modelReady);
}

function modelReady() {
    console.log('Model ready');
    handpose.on('hand', gotResults);
}

function gotResults(results) {
    detections = results;
}

function draw() {
    image(img, 0, 0, width / 2, height);
    image(video, width / 2, 0, width / 2, height);
    if (isFreehandMode) {
        freeDraw(detections);
    } else if (selectionMode && detections && detections.length > 0) {
        const thumbTip = detections[0].landmarks[4];
        const indexTip = detections[0].landmarks[8];
        const region = drawBoundingBox(thumbTip, indexTip);
        if (regionCaptured) {
            image(capturedRegion, region.x, region.y, region.w, region.h);
        }
    }
    if (detections && detections.length > 0 && !selectionMode) {
        drawKeypoints(detections);
    }

}

function drawKeypoints(detections) {
    for (let i = 0; i < detections.length; i++) {
        const detection = detections[i];
        for (let j = 0; j < detection.landmarks.length; j++) {
            if (j === 8) {
                const keypoint = detection.landmarks[j];
                fill(0, 255, 0);
                noStroke();
                ellipse(keypoint[0] + width / 2, keypoint[1], 10, 10);
                circle(keypoint[0] * (width / video.width) / 2, keypoint[1] * (height / video.height), 10);
            }
        }
    }
}

function freeDraw(detections) {
    if (detections && detections.length > 0) {
        let detection = detections[0];
        let indexFingerTip = detection.landmarks[8];
        let x = indexFingerTip[0] * (width / video.width) / 2;
        let y = indexFingerTip[1] * (height / video.height);
        previousIndexFingerPositions.push({ x, y });
        stroke(255, 0, 0);
        strokeWeight(3);
        noFill();
        beginShape();
        for (let point of previousIndexFingerPositions) {
            vertex(point.x, point.y);
        }
        endShape();
    }
}

function drawBoundingBox(tipThumb, tipIndex) {
    let x = min(tipThumb[0], tipIndex[0]) * (width / video.width) / 2;
    let y = min(tipThumb[1], tipIndex[1]) * (height / video.height);
    let w = abs(tipThumb[0] - tipIndex[0]) * (width / video.width) / 2;
    let h = abs(tipThumb[1] - tipIndex[1]) * (height / video.height);

    noFill();
    stroke(0, 0, 255);
    strokeWeight(2);
    rect(x + width / 2, y, w, h);
    rect(x, y, w, h);

    return { x, y, w, h };
}

function captureRegion(detections) {
    let thumbTip = detections[0].landmarks[4];
    let indexTip = detections[0].landmarks[8];
    let region = drawBoundingBox(thumbTip, indexTip);
    capturedRegion = img.get(region.x, region.y, region.w, region.h);
    capturedRegionWidth = region.w;
    capturedRegionHeight = region.h;
    regionCaptured = true;
}

function pasteRegion(detections) {
    let thumbTip = detections[0].landmarks[4];
    let indexTip = detections[0].landmarks[8];
    let region = drawBoundingBox(thumbTip, indexTip);
    img.copy(capturedRegion, 0, 0, capturedRegionWidth, capturedRegionHeight, region.x, region.y, region.w, region.h);
    regionCaptured = false;
}

function keyPressed() {
    if (key === 'f') {
        isFreehandMode = true; 
        console.log('Freehand mode enabled');
    }
    if (key === 'e') {
        if (isFreehandMode) {
            isFreehandMode = false;
            previousIndexFingerPositions = [];
            console.log('Freehand mode disabled');
        } else if (selectionMode) {
            selectionMode = false;
            console.log('Selection mode disabled');
        }
    }
    if (key === 's') {
        selectionMode = true;
        console.log('Selection mode enabled');
    }
    if (key === 'c' && selectionMode) {
        captureRegion(detections);
        console.log('Region captured');
    }
    if (key === 'v' && regionCaptured) {
        pasteRegion(detections);
        console.log('Region pasted');
        selectionMode = false;
        console.log('Selection mode disabled');
    }
}
