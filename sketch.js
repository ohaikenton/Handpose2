let video, handpose, detections, img;
let isFreehandMode = false; // Flag to track freehand mode state
let previousIndexFingerPositions = []; // Stores the positions for the drawn line

function setup() {
    createCanvas(1280, 480);
    img = loadImage('https://i.insider.com/602ee9d81a89f20019a377c6?width=1136&format=jpeg');
    video = createCapture(VIDEO);
    video.size(width / 2, height);
    video.hide();
    handpose = ml5.handpose(video, modelReady);
}

function modelReady() {
    console.log('Handpose model ready!');
    handpose.on('predict', gotResults);
}

function gotResults(results) {
    detections = results;
}

function draw() {
    image(img, 0, 0, width / 2, height);
    image(video, width / 2, 0, width / 2, height);

    if (detections && detections.length > 0) {
        drawKeypoints(detections);
    }

    if (isFreehandMode) {
        freeDraw(detections);
    }

    // Always draw the persistent line
    drawPersistentLine();
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

function drawPersistentLine() {
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();
    beginShape();
    for (let point of previousIndexFingerPositions) {
        vertex(point.x, point.y);
    }
    endShape();
}

function freeDraw(detections) {
    if (detections && detections.length > 0) {
        const detection = detections[0];
        const indexFingerTip = detection.landmarks[8];

        const x = indexFingerTip[0] * (width / video.width) / 2;
        const y = indexFingerTip[1] * (height / video.height);

        // Only add new positions to the array when in freehand mode
        previousIndexFingerPositions.push({ x, y });
    }
}

function keyPressed() {
    if (key === 'f') {
        isFreehandMode = !isFreehandMode; // Toggle freehand mode
        // Do not clear the array here to keep the line persistent
    }
}