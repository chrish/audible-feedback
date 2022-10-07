function playSound(input) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var context = new AudioContext();

    function sineWaveAt(sampleNumber, tone) {
    var sampleFreq = context.sampleRate / tone
    return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
    }

    var arr = [],
    volume = input.volume,
    seconds = input.duration,
    tone = input.frq

    for (var i = 0; i < context.sampleRate * seconds; i++) {
        arr[i] = sineWaveAt(i, tone) * volume
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
        20,
        25,
        31.5,
        40,
        50,
        63,
        80,
        100,
        125,
        160,
        200,
        250,
        315,
        400,
        500,
        630,
        800,
        1000,
        1250,
        1600,
        2000,
        2500,
        3150,
        4000,
        5000,
        6300,
        8000,
        10000,
        12500,
        16000,
        20000
    ];

    return frequencies;
}

var frq = getFrequencies();
var elmt = document.getElementById('bitsAndBobs');

for(var i=0; i<frq.length; i++){
    var btn = document.createElement("button");
    btn.setAttribute("onClick", "playSound({volume: 0.5, duration: 1, frq: " + frq[i] + "})");
    btn.textContent = frq[i];
    elmt.appendChild(btn);
}
