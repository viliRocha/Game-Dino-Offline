/**
 * Made with p5play!
 * https://p5play.org
 */

// Learn more about p5play here -> https://p5play.org/learn

let instructions = 'Tap to create a new sprite, drag to throw it!';
let box;

function setup() {
  // creates a canvas that fills the screen
  new Canvas();
}

function draw() {
  clear(); // try removing this line and see what happens!

  textSize(18);
  textAlign(CENTER);
  fill(200);
  text(instructions, canvas.w / 2, canvas.h / 2);

  if (mouse.presses()) {
    // by default, sprites collide with other sprites
    box = new Sprite(mouse.x, mouse.y, 30, 30);
  }
  
  if (mouse.dragging()) {
    box.moveTowards(mouse); // throw the box!
  }
  
  // if the user didn't throw the box,
  // then give it a random speed and direction
  if (mouse.released() && !mouse.dragged()) {
    box.speed = random(0, 5);
    box.direction = random(0, 360);
  }

  // by default, all sprites are drawn by p5play
  // after the end of the draw function
}

// WARNING! Using the p5.js web editor is not recommended
// due to these long-standing issues that they won't fix.

// 1. When console.log is used to print a number on
//    every frame, it causes drops in frame rate.
//    This makes the p5.js web editor unusable
//    for play testing certain kinds of games.

// 2. console.log doesn't print out the correct
//    values of arrays before and after they're
//    changed.

// 3. The sequence mode of loadAnimation doesn't
//    work unless you use backticks for the name
//    of the image file.

// p5play is not affiliated with the Processing Foundation.
// I can't persuade them to fix these critical issues which
// make the p5.js web editor inadequate for p5play users.
