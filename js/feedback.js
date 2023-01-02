function getVolume(){
    let vol = document.getElementById("volumeSldr").value/4;
    console.log(vol);
    return vol/100;
}


function playSound(volume, frq, duration = 1) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var context = new AudioContext();

    function sineWaveAt(sampleNumber, tone) {
    var sampleFreq = context.sampleRate / tone
    return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
    }

    var arr = [];

    for (var i = 0; i < context.sampleRate * duration; i++) {
        arr[i] = sineWaveAt(i, frq) * volume
    }
   
    var buf = new Float32Array(arr.length)
    for (var i = 0; i < arr.length; i++) {
        buf[i] = arr[i]
    }
    
    var buffer = context.createBuffer(1, buf.length, context.sampleRate)
    buffer.copyToChannel(buf, 0)
    
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}


function getFrequencies(){
    var frequencies = [
        { "frq": 20, "displayAs": "20"},
    { "frq": 25, "displayAs": "25"},
    { "frq": 31.5, "displayAs": "31.5"},
    { "frq": 40, "displayAs": "40"},
    { "frq": 50, "displayAs": "50"},
    { "frq": 63, "displayAs": "63"},
    { "frq": 80, "displayAs": "80"},
    { "frq": 100, "displayAs": "100"},
    { "frq": 125, "displayAs": "125"},
    { "frq": 160, "displayAs": "160"},
    { "frq": 200, "displayAs": "200"},
    { "frq": 250, "displayAs": "250"},
    { "frq": 315, "displayAs": "315"},
    { "frq": 400, "displayAs": "400"},
    { "frq": 500, "displayAs": "500"},
    { "frq": 630, "displayAs": "630"},
    { "frq": 800, "displayAs": "800"},
    { "frq": 1000, "displayAs": "1k"},
    { "frq": 1250, "displayAs": "1.25k"},
    { "frq": 1600, "displayAs": "1.6k"},
    { "frq": 2000, "displayAs": "2k"},
    { "frq": 2500, "displayAs": "2.5k"},
    { "frq": 3150, "displayAs": "3.15k"},
    { "frq": 4000, "displayAs": "4k"},
    { "frq": 5000, "displayAs": "5k"},
    { "frq": 6300, "displayAs": "6,3k"},
    { "frq": 8000, "displayAs": "8k"},
    { "frq": 10000, "displayAs": "10k"},
    { "frq": 12500, "displayAs": "12.5k"},
    { "frq": 16000, "displayAs": "16k"},
    { "frq": 20000, "displayAs": "20k"}
    ];

    return frequencies;
}

function startGame(){
    /*  Get config
        Pick list of frequencies
        Countdown then start timer
    */
}

let storage = {
    
}

var frq = getFrequencies();
var elmt = document.getElementById('demo');

for(var i=0; i<frq.length; i++){
    var btn = document.createElement("button");
    btn.setAttribute("class", "frqButton");
    btn.setAttribute("data-frq", frq[i].frq);
    btn.textContent = frq[i].displayAs;
    elmt.appendChild(btn);
}

$(function (){
    $(".menuToggle").on("click", function(){
        $("#menu").toggle();
    });

    $(".frqButton").on("click", function(){
        playSound(getVolume(), $(this).attr("data-frq"), 1);
    });
});


