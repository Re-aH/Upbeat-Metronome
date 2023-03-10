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

}

const increaseTempoLongPress = function () {
    if (!(bpm < bpmTopLimit - 5)) return
    bpm = Math.round(bpm / 5) * 5
    bpm = bpm + 5
    updateDisplay()
    updateToneBpm()

}

const decreaseTempo = function () {
    if (!(bpm > bpmBottomLimit)) return
    bpm--
    updateDisplay()
    updateToneBpm()

}

const decreaseTempoLongPress = function () {
    if (!(bpm > bpmBottomLimit + 5)) return
    bpm = Math.round(bpm / 5) * 5;
    bpm = bpm - 5
    updateDisplay()
    updateToneBpm()

}



playStopBtn.addEventListener('click', function () {
    pressPlay()

})



const pressPlay = function () {
    // toggle Play / Stop
    if (playStopBtn.className === 'play') {
        playStopBtn.className = 'stop';


        Tone.context.resume().then(() => {
            Tone.Transport.start();
        })
        checkAudContextInterval
    } else {
        playStopBtn.className = 'play';
        Tone.Transport.stop();
    }

}

function updateToneBpm() {
    Tone.Transport.bpm.value = bpm
    const toneBpm = Tone.Transport.bpm.value

}






// repeated event every Quarter note
Tone.Transport.scheduleRepeat((time) => {

    metClick.start(time)
    animateDiv(bpm)

}, "4n");


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


tempoUpBtn.addEventListener('touchstart', tempoUp);
tempoUpBtn.addEventListener('touchcancel', clearTempoUp);
tempoUpBtn.addEventListener('touchend', clearTempoUp);

tempoDownBtn.addEventListener('touchstart', tempoDown);
tempoDownBtn.addEventListener('touchcancel', clearTempoDown);
tempoDownBtn.addEventListener('touchend', clearTempoDown);

// console.log(Tone.context._context);

var checkAudContextInterval = setInterval(function () {
    if (typeof getAudioContext !== 'undefined') {
        getAudioContext().onstatechange = function () {
            // console.log(getAudioContext().state);
            if (getAudioContext().state === 'suspended' || getAudioContext().state === 'interrupted') {
                getAudioContext().resume();
            }
        };
        clearInterval(checkAudContextInterval);
    }
}, 1000);


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
    const div = document.getElementById('myDot');
    const start = 0;
    const end = window.innerHeight * 0.77;
    const duration = 1000 / bpm * 60;
    // Sine easing in/out function
    const easing = function (t) { return (0.5 - 0.5 * Math.cos(Math.PI * t)) * 1 };
    let startTime = Date.now();
    const whiteCdn = document.querySelector(".whiteCdn")
    const bigC = document.querySelector('.bigC')

    function animate() {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime < duration) {
            let whiteCdnOpacity
            let position;
            // whiteCdnOpacity = 1 - (elapsedTime / duration);
            if (elapsedTime < duration / 2) {
                position = start + (end - start) * easing(elapsedTime / (duration / 2));
                whiteCdnOpacity = 1 - (elapsedTime / duration * 2);
                // console.log(elapsedTime / duration * 2);
            } else {
                position = end + (start - end) * easing((elapsedTime - duration / 2) / (duration / 2));
                whiteCdnOpacity = 0
            }
            // this creates a slight fade in to the white ball 
            // if (elapsedTime > duration * 0.9) {
            //     whiteCdnOpacity = (elapsedTime * 10 / (duration)) - 9
            //     // console.log((elapsedTime * 10 / (duration)) - 9);
            // }
            whiteCdn.style.opacity = whiteCdnOpacity
            bigC.style.opacity = whiteCdnOpacity / 1.7
            div.style.transform = `translateY(${-Math.round(position)}px)`;
            requestAnimationFrame(animate);
        } else {
            div.style.transform = `translateY(${start}px)`;
            whiteCdn.style.opacity = 0
            bigC.style.opacity = 0
            // startTime = Date.now(); // Reset start time to begin the animation again
            // requestAnimationFrame(animate); // Start the animation again

        }
    }

    requestAnimationFrame(animate);
}


