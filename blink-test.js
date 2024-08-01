let textColor = 255, score = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    //Defining font style
    textFont('Fira Code', 27);
}

function draw() {
    background(0);
  
    //Show player score and score record in screen
    fill("white");
    text("Maximum score: " /*+ maximumScore*/, windowWidth - 500, windowHeight - 530);
    //MaxScore goes before scrore beacuse it will not blink
    fill(255, 255, 255, textColor);
    text(score, windowWidth - 1200, windowHeight - 530);

    score += Math.round(getFrameRate() / 60);
    
    if (score % 200 == 0) {
        blink_text();
    }
}

//Make the score text blink
function blink_text() {

    //let val = 1;
    textColor = (textColor === 255) ? 0 : 255;
    //textColor = 0; // Make text invisible
    // Alterna a cor do texto entre branco e preto
    /*
    for(let i = 0; i < 6; i++) {
        setTimeout(() => {
            //textColor = (textColor === 255) ? 0 : 255;
            val = val * -1;

            if(val == -1) {
                textColor = 0;
            }
            else {
                textColor = 255;
            }
        }, 100)
        
    }
    */
}