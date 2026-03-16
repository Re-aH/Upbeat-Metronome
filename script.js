'use strict'

let bpm = localStorage.getItem("localBpm") || 60
updateToneBpm()
const bpmTopLimit = 300
const bpmBottomLimit = 20
let bpmDisplay = document.querySelector(".bpmDisplay").innerText
const tempoUpBtn = document.getElementById("tempoUp")
const tempoDownBtn = document.getElementById("tempoDown")
const playStopBtn = document.getElementById("onOff")
// const dot = document.getElementById("dot")
const metClick = new Tone.Player('click3.wav').toMaster();
const metBounce = new Tone.Player('basketBallBounce.mp3').toMaster();
const lottiePlayer = document.querySelector('lottie-player');
const displayModeToggleBtn = document.getElementById("displayModeToggle");
const sineCanvas = document.getElementById("sineCanvas");
const sineCanvasContainer = document.getElementById("sineCanvasContainer");
let sineCtx = sineCanvas ? sineCanvas.getContext("2d") : null;
const displayModes = [
    { id: 'classic', label: 'View 1' },
    { id: 'sine', label: 'View 2' },
    { id: 'classicDark', label: 'View 3' },
    { id: 'sineDark', label: 'View 4' },
    { id: 'basketball', label: 'View 5' },
];
const savedMode = localStorage.getItem("localDisplayMode");
let currentModeIndex = savedMode !== null
    ? Math.max(0, Math.min(parseInt(savedMode, 10) || 0, displayModes.length - 1))
    : 0;
let sineModeActive = false;

// Coast-to-bottom state when stopping in View 2: keep animating until ball reaches -π/2
let lastTransportWasStarted = false;
let coastingActive = false;
let coastingStartTime = 0;
let coastingT0 = 0;
let coastingTimeToBottom = 0;
let coastingBeatDuration = 1;
let useBounceSound = false;

const updateDisplay = function () {
    document.querySelector(".bpmDisplay").innerText = bpm
    localStorage.setItem("localBpm", bpm)
}

updateDisplay()

const increaseTempo = function () {
    if (!(bpm < bpmTopLimit)) return
    bpm++
    updateDisplay()
    updateToneBpm()
    lottiePlayer.setSpeed(bpm / 60);

}

const increaseTempoLongPress = function () {
    if (!(bpm < bpmTopLimit - 5)) return
    bpm = Math.round(bpm / 5) * 5
    bpm = bpm + 5
    updateDisplay()
    updateToneBpm()
    lottiePlayer.setSpeed(bpm / 60);

}

const decreaseTempo = function () {
    if (!(bpm > bpmBottomLimit)) return
    bpm--
    updateDisplay()
    updateToneBpm()
    lottiePlayer.setSpeed(bpm / 60);

}

const decreaseTempoLongPress = function () {
    if (!(bpm > bpmBottomLimit + 5)) return
    bpm = Math.round(bpm / 5) * 5;
    bpm = bpm - 5
    updateDisplay()
    updateToneBpm()
    lottiePlayer.setSpeed(bpm / 60);

}



playStopBtn.addEventListener('click', function () {
    pressPlay()

})



const pressPlay = async function () {
    if (Tone.context.state !== 'running') {
        await Tone.context.resume(); // Ensure the AudioContext is running
        // console.log("AudioContext resumed");
    }

    if (playStopBtn.className === 'play') {
        playStopBtn.className = 'stop';
        Tone.Transport.start();
    } else {
        playStopBtn.className = 'play';
        Tone.Transport.stop();
    }
};

function updateToneBpm() {
    Tone.Transport.bpm.value = bpm
    const toneBpm = Tone.Transport.bpm.value

}






// repeated event every Quarter note
Tone.Transport.scheduleRepeat((time) => {

    if (useBounceSound) {
        metBounce.start(time);
    } else {
        metClick.start(time);
    }
    animateDiv(bpm)
    if (!useBounceSound) {
        lottiePlayer.setSpeed(bpm / 60)

        setTimeout(function () {
            lottiePlayer.seek(0);
            lottiePlayer.play();   // Play the animation

        }, 115)
    }
}, "4n");


function setDisplayModeByIndex(index) {
    if (!displayModes[index]) return;
    currentModeIndex = index;
    localStorage.setItem("localDisplayMode", String(currentModeIndex));
    const mode = displayModes[currentModeIndex];

    if (displayModeToggleBtn) {
        // displayModeToggleBtn.textContent = mode.label;
    }

    const isClassic = mode.id === 'classic' || mode.id === 'classicDark' || mode.id === 'basketball';
    const isSine = mode.id === 'sine' || mode.id === 'sineDark';
    const isDark = mode.id === 'classicDark' || mode.id === 'sineDark';
    const isBasketball = mode.id === 'basketball';

    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('basketball-mode', isBasketball);

    const lottieContainer = document.getElementById('lottie');
    const myDot = document.getElementById('myDot');
    const whiteCup = document.querySelector('.whiteCup');
    const whiteCdn = document.querySelector('.whiteCdn');

    if (lottieContainer) lottieContainer.style.display = isClassic && !isBasketball ? 'block' : 'none';
    if (myDot) myDot.style.display = isClassic ? 'block' : 'none';
    if (whiteCup) whiteCup.style.display = isClassic && !isBasketball ? 'block' : 'none';
    if (whiteCdn) whiteCdn.style.display = isClassic && !isBasketball ? 'block' : 'none';
    if (sineCanvasContainer) sineCanvasContainer.style.display = isClassic ? 'none' : 'block';

    sineModeActive = isSine;

    useBounceSound = isBasketball;

    // Ensure the sine canvas has a real size once it becomes visible
    if (sineModeActive) {
        resizeSineCanvas();
    }
}

function goToNextDisplayMode() {
    const nextIndex = (currentModeIndex + 1) % displayModes.length;
    setDisplayModeByIndex(nextIndex);
}

if (displayModeToggleBtn) {
    displayModeToggleBtn.addEventListener('click', goToNextDisplayMode);
}

function resizeSineCanvas() {
    if (!sineCanvas || !sineCtx) return;
    const rect = sineCanvas.getBoundingClientRect();
    sineCanvas.width = rect.width * window.devicePixelRatio;
    sineCanvas.height = rect.height * window.devicePixelRatio;
    sineCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function drawSineModeFrame() {
    if (!sineModeActive || !sineCtx || !sineCanvas) return;

    const width = sineCanvas.width / window.devicePixelRatio;
    const height = sineCanvas.height / window.devicePixelRatio;
    if (width === 0 || height === 0) return;

    const bpmNumber = Number(bpm) || 60;
    const beatDurationSeconds = 60 / bpmNumber;
    const beatsVisible = 2;
    const timeWindow = beatDurationSeconds * beatsVisible;
    const isPlaying = Tone.Transport.state === 'started';

    // When user just stopped: start coasting until ball reaches bottom (phase = -π/2)
    if (isPlaying) {
        lastTransportWasStarted = true;
    } else {
        if (lastTransportWasStarted) {
            lastTransportWasStarted = false;
            coastingStartTime = performance.now();
            coastingT0 = Tone.Transport.seconds;
            coastingBeatDuration = beatDurationSeconds;
            const nextK = Math.ceil(coastingT0 / coastingBeatDuration);
            coastingTimeToBottom = nextK * coastingBeatDuration - coastingT0;
            coastingActive = true;
        }
    }

    // timeNow: actual time when playing, virtual time when coasting, then use for wave/ball
    let timeNow = Tone.Transport.seconds;
    if (!isPlaying && coastingActive) {
        const elapsed = (performance.now() - coastingStartTime) / 1000;
        if (elapsed >= coastingTimeToBottom) {
            coastingActive = false;
            timeNow = Math.ceil(coastingT0 / coastingBeatDuration) * coastingBeatDuration;
        } else {
            timeNow = coastingT0 + elapsed;
        }
    }

    sineCtx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const amplitude = height * 0.45;
    const centerX = width / 2;
    const isDark = document.body.classList.contains('dark-mode');

    // Phase offset: beat/click at bottom (-π/2). When fully stopped, shift wave so min is at centerX
    let phaseOffset;
    if (isPlaying || coastingActive) {
        phaseOffset = -Math.PI / 2;
    } else {
        const tCenter = timeNow - (1 - centerX / width) * timeWindow;
        const basePhaseCenter = 2 * Math.PI * (tCenter / beatDurationSeconds);
        phaseOffset = -Math.PI / 2 - basePhaseCenter;
    }

    sineCtx.lineWidth = 2;
    sineCtx.strokeStyle = isDark ? 'rgb(240, 240, 240)' : 'rgb(0, 0, 0)';
    sineCtx.beginPath();
    for (let x = 0; x <= width; x++) {
        const t = timeNow - (1 - x / width) * timeWindow;
        const phase = 2 * Math.PI * (t / beatDurationSeconds) + phaseOffset;
        const y = centerY - amplitude * Math.sin(phase);
        if (x === 0) {
            sineCtx.moveTo(x, y);
        } else {
            sineCtx.lineTo(x, y);
        }
    }
    sineCtx.stroke();

    const ballX = width / 2;
    let ballPhase;
    if (isPlaying || coastingActive) {
        ballPhase = 2 * Math.PI * (timeNow / beatDurationSeconds) - Math.PI / 2;
    } else {
        ballPhase = -Math.PI / 2;
    }
    const ballY = centerY - amplitude * Math.sin(ballPhase);

    const ballRadius = 37;
    sineCtx.fillStyle = isDark ? 'rgb(240, 240, 240)' : 'rgb(0, 0, 0)';
    sineCtx.beginPath();
    sineCtx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    sineCtx.fill();
}

function animationLoop() {
    if (sineModeActive) {
        drawSineModeFrame();
    }
    requestAnimationFrame(animationLoop);
}

requestAnimationFrame(animationLoop);


let longPress;
let longPressUp;

function tempoUp() {
    longPress = setTimeout(

        function () {

            longPressUp = setInterval(
                function () { increaseTempoLongPress() }, 120)
        }
        , 500)
}


function clearTempoUp() {
    clearTimeout(longPress)
    clearInterval(longPressUp)

}

let longPress2;
let longPressDown;

function tempoDown() {
    longPress2 = setTimeout(

        function () {

            longPressDown = setInterval(
                function () { decreaseTempoLongPress() }, 120);
        }
        , 500);
};

function clearTempoDown() {
    clearTimeout(longPress2);
    clearInterval(longPressDown);

};


tempoUpBtn.addEventListener('touchstart', tempoUp, { passive: true });
tempoUpBtn.addEventListener('touchcancel', clearTempoUp);
tempoUpBtn.addEventListener('touchend', clearTempoUp);

tempoDownBtn.addEventListener('touchstart', tempoDown, { passive: true });
tempoDownBtn.addEventListener('touchcancel', clearTempoDown);
tempoDownBtn.addEventListener('touchend', clearTempoDown);

// console.log(Tone.context._context);

// var checkAudContextInterval = setInterval(function () {
//     if (typeof getAudioContext !== 'undefined') {
//         getAudioContext().onstatechange = function () {
//             // console.log(getAudioContext().state);
//             if (getAudioContext().state === 'suspended' || getAudioContext().state === 'interrupted') {
//                 getAudioContext().resume();
//             }
//         };
//         clearInterval(checkAudContextInterval);
//     }
// }, 1000);

document.addEventListener("click", async () => {
    if (Tone.context.state === "suspended" || Tone.context.state === "interrupted") {
        await Tone.context.resume();
        // console.log("AudioContext resumed!");
    }
}, { once: true }); // Ensures this runs only once


document.body.addEventListener("keydown", function (event) {
    if (event.key === " ") {
        // Spacebar was pressed
        pressPlay()

    }

    if (event.key === "ArrowUp") {
        increaseTempo()
    }

    if (event.key === "ArrowDown") {
        decreaseTempo()
    }

});


function animateDiv(bpm) {

    const duration = (60 / bpm) * 1000; // Duration in milliseconds
    let startTime = performance.now();

    const isBasketball = document.body.classList.contains('basketball-mode');

    const whiteCdn = !isBasketball ? document.querySelector(".whiteCdn") : null;
    const whiteCup = !isBasketball ? document.querySelector(".whiteCup") : null;
    const myDot = isBasketball ? document.getElementById("myDot") : null;

    const startBottom = 70;
    let bounceHeight = 140;
    if (isBasketball && myDot) {
        const viewportHeight = window.innerHeight;
        const ballHeight = myDot.offsetHeight || 90;
        const targetTop = 70;
        const topBottom = Math.max(0, viewportHeight - targetTop - ballHeight);
        bounceHeight = Math.max(0, topBottom - startBottom);
    }

    function animate() {

        const elapsedTime = performance.now() - startTime;

        if (elapsedTime < duration) {

            const progress = elapsedTime / duration;

            if (isBasketball && myDot) {
                // const t = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
                // const offset = bounceHeight * t;

                const offset = bounceHeight * Math.sin(progress * Math.PI);

                myDot.style.bottom = (startBottom + offset) + "px";
            } else if (whiteCdn) {
                const whiteCdnOpacity = Math.max(0, 1 - (elapsedTime / duration * 2));
                whiteCdn.style.opacity = whiteCdnOpacity;
                if (whiteCup) whiteCup.style.opacity = whiteCdnOpacity;
            }

            requestAnimationFrame(animate);
        } else {
            if (isBasketball && myDot) {
                myDot.style.bottom = startBottom + "px";
            } else if (whiteCdn) {
                whiteCdn.style.opacity = 0;
                if (whiteCup) whiteCup.style.opacity = 0;
            }
        }
    }

    requestAnimationFrame(animate);
}






// Function to update scale based on viewport height
function updateScale() {
    const viewportHeight = window.innerHeight;
    const bottomMargin = 78;
    const availableHeight = viewportHeight - bottomMargin;

    const isSmallViewport = viewportHeight < 1000;
    const baseHeight = isSmallViewport ? 604 : 1205;
    const minScale = 0.5, maxScale = 1.8;

    let scaleFactor = availableHeight / baseHeight;
    if (isSmallViewport) {
        scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor));
    }

    const lottieSrc = isSmallViewport ? 'bounce60fps.json' : 'long1201.json';
    const lottieHeight = isSmallViewport ? '604px' : '1200px';
    const lottieWidth = isSmallViewport ? '' : '80px';
    const lottieBottom = isSmallViewport ? '78px' : '71px';

    // console.log(scaleFactor);

    lottiePlayer.setAttribute('src', lottieSrc);
    lottiePlayer.style.height = lottieHeight;
    if (!isSmallViewport) {
        lottiePlayer.style.width = lottieWidth;
    }

    lottiePlayer.load(lottieSrc);

    document.documentElement.style.setProperty('--scale-factor', scaleFactor);
    document.getElementById('lottie').style.bottom = lottieBottom;
}

// Call on load and window resize
window.addEventListener('load', function () {
    updateScale();
    resizeSineCanvas();
    setDisplayModeByIndex(currentModeIndex);
});
window.addEventListener('resize', function () {
    updateScale();
    resizeSineCanvas();
});