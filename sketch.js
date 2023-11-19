let video;
let handpose;
let predictions = [];
let img;

function setup() {
    createCanvas(1280, 480); // doubled the width to accommodate the video
    img = loadImage('https://i.insider.com/602ee9d81a89f20019a377c6?width=1136&format=jpeg'); // replace with your image file
    video = createCapture(VIDEO);
    video.size(width / 2, height);
    handpose = ml5.handpose(video, modelReady);
    handpose.on('predict', results => {
        predictions = results;
    });
    video.hide();
}

function modelReady() {
    console.log('Handpose model ready!');
}

function draw() {
    image(img, 0, 0, width / 2, height);
    image(video, width / 2, 0, width / 2, height); // place the video next to the image
    drawKeypoints();
}

function drawKeypoints()  {
    for (let i = 0; i < predictions.length; i += 1) {
        const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j += 1) {
            if (j === 8) { // 8 is the index finger tip
                const keypoint = prediction.landmarks[j];
                fill(0, 255, 0);
                noStroke();
                circle(keypoint[0] + width / 2, keypoint[1], 10); // draw the circle on the video
                circle(keypoint[0] * (width / video.width) / 2, keypoint[1] * (height / video.height), 10); // draw the circle on the image, scaling the position to match the image size
            }
        }
    }
}