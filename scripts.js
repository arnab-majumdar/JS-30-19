const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(localMediaStream => {
            console.log(localMediaStream);
            // video.src = localMediaStream; // needs to be converted to a URL
            // video.src = window.URL.createObjectURL(localMediaStream); // DEPRICATED

            // NEW SYNTAX
            video.srcObject = localMediaStream;
            video.play(); // need this to continue to work
        }).catch(error => {
            console.error('Not working', error);
    });
}

function paintCanvas() {
    //need width and height of video
    const width = video.videoWidth;
    const height = video.videoHeight;

    //canvas and video needs to be of the same width
    canvas.width = width;
    canvas.height = height;

    //every few seconds will capture image
    return setInterval( () => {
        ctx.drawImage(video, 0, 0, width, height);
    // added later for red filter and all -  select the pixels and add color
        // take pixels out
        let pixels = ctx.getImageData(0,0, width, height);

        //OPTION1: RedEffect
        // pixels = rojoEffect(pixels); // red effect

        // OPTION2: ghost effect
        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.3; // ghosting effect

        //OPTION3: greenScreen effect
        pixels = greenScreen(pixels);

// now assign the pixels and out them back
        ctx.putImageData(pixels, 0, 0);
        }, 16);

}
function takePhoto() {
    // snap is where we dump all the images
    //played the sound
    snap.currentTime = 0;
    snap.play();
    // take the data of the canvas

    const data = canvas.toDataURL('image/jpeg'); // create d image to test based code
    // create a a tag and supply this information
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'guapo');
    link.textContent = 'Download Image';
    link.innerHTML = `<img src="${data}" alt="Guapo Guapo" />`;
    strip.insertBefore(link, strip.firstChild);
}

function rojoEffect(pixels) {
    // map doesnt work with this pixel inputs
    for (let i = 0; i< pixels.data.length; i += 4) {
        pixels.data[i] = pixels.data[i] + 66; // red
        pixels.data[i+1]= pixels.data[i] - 66; // green
        pixels.data[i+2]= pixels.data[i] * 1.2; // blue

    }
    return pixels;
}

function rgbSplit(pixels) {
    // copied the rojo effect and changed it
    for (let i = 0; i< pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i]; // red
        pixels.data[i + 400]= pixels.data[i + 1]; // green
        pixels.data[i - 250]= pixels.data[i + 2]; // blue

    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax) {
            // take it out!
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

getVideo();

// paintCanvas(); -  will call this when an event happens, once the video is played , it is going to event canplay
video.addEventListener('canplay', paintCanvas);


