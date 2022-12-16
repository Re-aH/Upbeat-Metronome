'use strict'

let bpm = 60
updateToneBpm()
const bpmTopLimit = 300
const bpmBottomLimit = 20
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

function animateUpbeat() {
    document.querySelector('.whiteCup').classList.add('animWhite');
}

const pressPlay = function () {
    // toggle Play / Stop
    let secBpm2 = 60000 / bpm / 2
    if (playStopBtn.className === 'play') {
        playStopBtn.className = 'stop';
        dot.classList.add('animation');
        document.querySelector('.bigC').classList.add('animCircle');
        document.querySelector('.whiteCdn').classList.add('animWhite');
        // uncomenting this will animate a white ball to the off beat
        // not sure if it is a good idea...
        // setTimeout(animateUpbeat, secBpm2)


        Tone.context.resume().then(() => {
            Tone.Transport.start();
            console.log(Tone.context.state);
        })
        // checkAudContextInterval
    } else {
        playStopBtn.className = 'play';
        dot.classList.remove('animation');
        document.querySelector('.bigC').classList.remove('animCircle');
        document.querySelector('.whiteCdn').classList.remove('animWhite');
        document.querySelector('.whiteCup').classList.remove('animWhite');
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
    document.querySelector('.whiteCdn').style.animationDuration = `${secBpm * 2}s`
    document.querySelector('.whiteCup').style.animationDuration = `${secBpm * 2}s`
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

const syncClick = function () {
    // toggle Play / Stop
    // let secBpm2 = 60000 / bpm / 2
    if (playStopBtn.className === 'stop') {
        dot.classList.remove('animation');
        document.querySelector('.whiteCdn').classList.remove('animWhite');
        document.querySelector('.bigC').classList.remove('animCircle');
        Tone.Transport.stop();
        setTimeout(function () {

            Tone.Transport.start();

            // checkAudContextInterval
            dot.classList.add('animation');
            document.querySelector('.bigC').classList.add('animCircle');
            document.querySelector('.whiteCdn').classList.add('animWhite');
            // uncomenting this will animate a white ball to the off beat
            // not sure if it is a good idea...
            // setTimeout(animateUpbeat, secBpm2)
        }, 50)

    }

}

function clearTempoUp() {
    clearTimeout(longPress)
    clearInterval(longPressUp)
    syncClick()
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
    syncClick()
};


tempoUpBtn.addEventListener('touchstart', tempoUp);
tempoUpBtn.addEventListener('touchcancel', clearTempoUp);
tempoUpBtn.addEventListener('touchend', clearTempoUp);

tempoDownBtn.addEventListener('touchstart', tempoDown);
tempoDownBtn.addEventListener('touchcancel', clearTempoDown);
tempoDownBtn.addEventListener('touchend', clearTempoDown);

// console.log(Tone.context._context);

// var checkAudContextInterval = setInterval(function () {

//     if (typeof Tone.getAudioContext !== 'undefined') {
//         Tone.getAudioContext().onstatechange = function () {
//             console.log(Tone.getAudioContext().state);
//             if (Tone.getAudioContext().state === 'suspended' || Tone.getAudioContext().state === 'interrupted') {
//                 Tone.getAudioContext().resume();
//             }

//         };

//         clearInterval(checkAudContextInterval);
//     }
// }, 1000);

//will it?
Tone.context.addEventListener("statechange", (ev) => {
    console.log(Tone.context.state);
    if (Tone.context.state === 'suspended' || Tone.context.state === 'interrupted') {
        Tone.context.resume();
        console.log(Tone.context.state);
    }

}, false);

  // I put the above in the audio ctx onstatechange handler
