# audible-feedback
Simple webapp for training feedback frequencies.

It has modes of operation: 
* Simple point-and-click: Click on a frequency to hear it. 
* Game: A frequency is played, you need to guess which one by clicking on the correct band. 

# Scoring and difficulty

Difficulty is controlled in the following manner: 
* Base score is 1 point for each correct answer. Difficulty level increases score by given multiplier. 

* Fixed bands and frequencies, no timer. x1
* * With timer, x1,5
* Fixed bands, frequencies range from any frequency between 20-20k. x4
* * With timer, x6
* * * Shorter duration, lower volume. x10
* * * * Moving buttons; x40. Must obtain given score on previous first. 

# Base rules 
* One round per day, regardless of difficulty. 
* Scoring icon (shareable on SoMe: Level|Streak|Points, eg 1|24|24)



-----

Increasing volume? Lower volume/successful guess => higher score?

-----

jq.startGame()
    -> Picks frequencies, finds difficulty and rules and 
       sets gamestate
    -> Populates the data-attr on frq buttons, 
       sets the handler
    -> Starts the countdown

    -> Todo: Must start the first step

gametick()
    Fired by buttonclick
    -> Stops currently playing sound
    -> Gets duration of player guess
    -> Starts the next step
    -> Start the next frq

    -> If at the end, finish game. 