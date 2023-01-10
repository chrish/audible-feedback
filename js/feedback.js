var player;

let storage = {
    "streaks": [
        {
            "id": 1,
            "startDate": "2020.01.01",
            "lastDate": "2021.01.01",
            "longestStreakEver": 43
        }
    ]
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function getRules(){
let rules = 
    [
        {
            "id": 0,
            "numberOfFrequenciesToGuess": 10,
            "usePredefinedBandOnly": true,
            "numberOfTriesPerFrequency": 3,
            "timePerTry": 0,
            "scoreMultiplier": 1
        },
        {
            "id": 1,
            "numberOfFrequenciesToGuess": 10,
            "usePredefinedBandOnly": true,
            "numberOfTriesPerFrequency": 3,
            "timePerTry": 0,
            "scoreMultiplier": 2
        },
        {
            "id": 2,
            "numberOfFrequenciesToGuess": 10,
            "usePredefinedBandOnly": true,
            "numberOfTriesPerFrequency": 3,
            "timePerTry": 0,
            "scoreMultiplier": 3
        },
        {
            "id": 3,
            "numberOfFrequenciesToGuess": 10,
            "usePredefinedBandOnly": true,
            "numberOfTriesPerFrequency": 1,
            "timePerTry": 0,
            "scoreMultiplier": 4
        },
        {
            "id": 4,
            "numberOfFrequenciesToGuess": 10,
            "usePredefinedBandOnly": false,
            "numberOfTriesPerFrequency": 3,
            "timePerTry": 0,
            "scoreMultiplier": 5
        }
    ]
    return rules;
}

function getDifficulties(){
    let json = [
        {
            "id": 0,
            "displayAs": "Simple"
        },
        {
            "id": 1,
            "displayAs": "Tricky"
        },
        {
            "id": 2,
            "displayAs": "Difficult"
        },
        {
            "id": 3,
            "displayAs": "Impossible"
        },
        {
            "id": 4,
            "displayAs": "Even worse"
        }
    ]
    
    return json;
}

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
    player = context;
    source.start(0);
}

function stopSound(){
    // Stopping sound
    if (player instanceof AudioContext){
        player.close();
    }
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

function getDifficulty(){
    return $("#difficulty label input:checked").val()
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
    /** Setup */
    var diffs = getDifficulties();
    for (d of diffs){
        var checked = "";
        if (d.id == 1) checked = "checked=\checked\"";
        $("#difficulty").append("<label><input id=\"d" + d.id + "\" class=\"setting_difficulty\" " + checked + " type=\"radio\" name=\"s_d\" value=\"" + d.id + "\" />" + d.displayAs + "</label>");
    }

    $(".menuToggle").on("click", function(){
        $("#menu").toggle();
    });

    $(".frqButton").on("click", function(){
        playSound(getVolume(), $(this).attr("data-frq"), 1);
    });

    $("#startButton").on("click", function(){
        startGame();
    });
    /** End setup */

    function startCountdown(){
        $("#overlay").show();
        $("#countdown").show();
        
        $("#countdown span").addClass('flash');
        $("#countdown span").empty().append("3");
        setTimeout(function() {
            $("#countdown span").empty().append("2");
            setTimeout(function() {
                $("#countdown span").empty().append("1");
                setTimeout(function() {
                    $("#countdown span").empty().append("Go!");
                    $("#countdown span").removeClass('flash');
                    $("#countdown").fadeOut();
                    $("#overlay").fadeOut();
                }, 1000);
            }, 1000);
        }, 1000);
    }

    async function startGame(){
        // Get difficulty
        let difficulty = getDifficulty();
        let tmprules = getRules();
        let rules = tmprules[difficulty];
    
        // Pick random frqs
        let frqs = []
    
        console.log("Difficulty:");
        console.log(difficulty);
    
        console.log("Rules");
        console.log(rules);
    
        let bandFrequencies = getFrequencies();
    
        for(var i=0; i<rules.numberOfFrequenciesToGuess; i++){
            if (rules.usePredefinedBandOnly){
                var numberOfBands = getFrequencies().length;
                var randVal = Math.floor(Math.random() * (numberOfBands - 0) + 0);
    
                console.log("Random frqIdx:");
                console.log(randVal);
    
                frqs.push(bandFrequencies[randVal]);
            } else {
                var randFrq = Math.floor(Math.random() * (16000 - 200) + 200);
    
                console.log("Random frq:");
                console.log(randFrq);
    
                let f = {"frq": randFrq, "displayAs": randFrq}
                frqs.push(f);
            }
        }
    
        console.log("Frequencies");
        console.log(frqs);
    
        console.log("Starting game");
        
        startCountdown();
        await delay(3000);

            for(var i=0; i<3; i++){
                console.log("Playing " + frqs[i].frq);
                playSound(getVolume(), frqs[i].frq, 1);
                await delay(1500);                
            }

    }
});


