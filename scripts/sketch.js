let instructions = 'Tap to create a new sprite, drag to throw it!';
let box;

function setup() {
  // creates a canvas that fills the screen
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  //clear(); // try removing this line and see what happens!

  textSize(18);
  textAlign(CENTER);
  fill(200);
  text(instructions, 300, 100);
}