'use strict'

let bpm = 60
updateToneBpm()
const bpmTopLimit = 300
const bpmBottomLimit = 35
let bpmDisplay = document.querySelector(".bpmDisplay").innerText
const tempoUpBtn = document.getElementById("tempoUp")
const tempoDownBtn = document.getElementById("tempoDown")
const playStopBtn = document.getElementById("onOff")
const dot = document.getElementById("dot")
const metClick = new Tone.Player('click3.wav').toMaster();



const updateDisplay = function () {
    document.querySelector(".bpmDisplay").innerText = bpm
}

const increaseTempo = function () {
    if (!(bpm < bpmTopLimit)) return
    bpm++
    updateDisplay()
    updateToneBpm()
    updateAnimationTempo()
}

const decreaseTempo = function () {
    if (!(bpm > bpmBottomLimit)) return
    bpm--
    updateDisplay()
    updateToneBpm()
    updateAnimationTempo()
}

const togglePlayStop = function () {

}

playStopBtn.addEventListener('click', function () {
    pressPlay()
    updateAnimationTempo()
})



const pressPlay = function () {
    // toggle Play / Stop
    if (playStopBtn.className === 'play') {
        playStopBtn.className = 'stop';
        dot.classList.add('animation');
        document.querySelector('.bigC').classList.add('animCircle');
        Tone.context.resume().then(() => {
            Tone.Transport.start();
        })
        checkAudContextInterval
    } else {
        playStopBtn.className = 'play';
        dot.classList.remove('animation');
        document.querySelector('.bigC').classList.remove('animCircle');
        Tone.Transport.stop();
    }

}

function updateToneBpm() {
    Tone.Transport.bpm.value = bpm
    const toneBpm = Tone.Transport.bpm.value

}


function updateAnimationTempo() {
    let secBpm = 60 / bpm / 2
    document.querySelector('.bigC').style.animationDuration = `${secBpm * 2}s`
    dot.style.animationDuration = `${secBpm}s`
}



// repeated event every 4th note
Tone.Transport.scheduleRepeat((time) => {

    metClick.start(time)

}, "4n");


let longPress;
let longPressUp;

function tempoUp() {
    longPress = setTimeout(

        function () {
            // alert("test")
            longPressUp = setInterval(
                function () { increaseTempo() }, 50)
        }
        , 1000)
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
            // alert("test")
            longPressDown = setInterval(
                function () { decreaseTempo() }, 50);
        }
        , 1000);
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
