let trex,
  ground,
  clouds,

  obstacle1,
  obstacle2,
  obstacle3,
  obstacle4,
  obstacle5,
  obstacle6,

  texTrex,
  trexSprint,
  trexCollide,
  texGround,

  cloudsGroup,
  obstacleGroup,

  restart,

  objObstacle1,

  score = 0,
  gameState = "start",
  bg = 156
canJump = false;

function preload() {
  //cactuses Imgs
  obstacle1 = loadImage("assets/obstacle1.png");
  obstacle2 = loadImage("assets/obstacle2.png");
  obstacle3 = loadImage("assets/obstacle3.png");
  obstacle4 = loadImage("assets/obstacle4.png");
  obstacle5 = loadImage("assets/obstacle5.png");
  obstacle6 = loadImage("assets/obstacle6.png");

  //floor Img
  texGround = loadImage("assets/ground2.png");

  //Trex animations
  texTrex = loadAnimation("assets/trex1.png", "assets/trex2.png", "assets/trex3.png", "assets/trex4.png");
  trexSprint = loadAnimation("assets/TrexDown1.png", "assets/TrexDown2.png");
  trexCollide = loadImage("assets/collide.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  restart= createImg("assets/restart.png");
  restart.position(windowWidth / 2, windowHeight / 2);
  restart.size(50, 50);

  trex = createSprite(80, windowHeight - 150, 100, 100)
  trex.addAnimation("dead", trexCollide);
  trex.addAnimation("trexWalk", texTrex);
  trex.addAnimation("trexDown", trexSprint);

  trex.animation.offset.y = 15;
  trex.scale = 1;

  trex.mass = 0;

  ground = createSprite(windowWidth / 2, windowHeight - 30, windowWidth, 50);
  ground.addImage("floor", texGround);

  ground.width = windowWidth * 7;
  ground.animation.offset.y = -30;
  ground.scale = 0.9;

  //ground.collider ='static';

  //ground.debug = true;

  //Defining font style
  textFont('Lucida Console', 27);

  cloudsGroup = new Group();
  obstacleGroup = new Group();
}

function draw() {
  background(bg);

  //If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y = trex.velocity.y + 1;
  }

  trex.velocity.x = 0.26;
  ground.velocity.x = -8;

  //Player is alive
  if (gameState == "start") {
    score = score + Math.round(getFrameRate() / 60);

    restart.hide();

    if (ground.x <= -windowWidth - 2200) {
      ground.x = ground.width / 2;
    }

    //Show player score in screen
    fill("white")
    text(score, windowWidth - 1300, windowHeight - 600)
    //text("Maximun score: " + maximunScore, windowWidth - 500, windowHeight - 600)

    if (kb.presses('down')) {
      //   (distance, direction, speed)
      trex.changeAnimation("trexDown", trexSprint);

      canJump = false;
    }
    //Verify if player presses up arrow and deno is not at sprinting anim to jump
    else if (kb.presses('up') && trex.y >= windowHeight - 110 && canJump == true/*trex.animation.name == 'trexDown'*/) {
      trex.velocity.y = -20;
    }

    //console.log(trex.animation)
    generate_clouds();
    generate_cactuses();

    //If player is already playing dor some time && determined frameRate is reached
    if (score >= 300 && frameCount % 50) {
      //Make game sligtly faster the more player plays
      trex.velocity.x = trex.velocity.x * 1.1;
      ground.velocity.x = ground.velocity.x * 1.1;
      objObstacle1.velocity.x = objObstacle1.velocity.x  * 1.0015;


    }

    //Trex dies
    if (trex.collides(obstacleGroup)) {
      //trex.changeImage("falecido", collided);

      //texGameOver = createSprite(windowWidth / 2, 300, 200, windowWidth)
      //texGameOver.addImage("youAreDead", gameOver)

      gameState = "end";
    }
  }

  if (gameState == "end") {

    //collideSound.play();

    trex.changeAnimation("dead", trexCollide);

    trex.velocity.x = 0;
    ground.velocity.x = 0;

    obstacleGroup.collider ='static';
    //cloudsGroup.setVelocityXEach(0);

    //obstacleGroup.velocity.x = -1;
    //cloudsGroup.setLifetimeEach(-1);

    restart.show();

    if (mouse.presses()) {
      reset();
    }
    /*
    //Check for new player score record
    if (score > maximunScore) {
      maximunScore = score;
    }
      */
  }
}

//Check if Down arrow was released
function keyReleased() {
  if (keyCode == 40) {
    trex.changeAnimation("trexWalk", texTrex);

    canJump = true;
  }
}

function generate_clouds() {

  if (frameCount % 40 == 0) {
    clouds = createSprite(windowWidth + 30, random(100, 500), 100, 100);
    clouds.addImage("sky", texCloud);

    clouds.velocity.x = -4;
    clouds.lifetime = 110;

    cloudsGroup.add(clouds);
  }
}

function generate_cactuses() {

  if (frameCount % 70 == 0) {
    objObstacle1 = new Sprite(windowWidth + 30, windowHeight - 100, 50, 70);

    objObstacle1.mass = 0;

    objObstacle1.velocity.x = -8;
    objObstacle1.lifetime = 80;

    obstacleGroup.add(objObstacle1);
    var choose_cactus = Math.round(random(1, 6));
    switch (choose_cactus) {
      case 1:
        objObstacle1.addImage("one_small_cactus", obstacle1);
        objObstacle1.animation.offset.y = 13;
        break;
      case 2:
        objObstacle1.addImage("two_small_cactuses", obstacle2);
        objObstacle1.animation.offset.y = 13;
        break;
      case 3:
        objObstacle1.addImage("tree_small_cactuses", obstacle3);
        objObstacle1.animation.offset.y = 13;
        break;
      case 4:
        objObstacle1.addImage("one_big_catus", obstacle4);
        break;
      case 5:
        objObstacle1.addImage("two_big_cactuses", obstacle5);
        break;
      case 6:
        objObstacle1.addImage("tree_big_cactuses", obstacle6);
        break;
    }
    objObstacle1.debug = true;
  }
}

//Called when player clicks on button to play again
function reset() {
  trex.position.y = 550;
  trex.position.x = 80;

  gameState = "start";

  //texGameOver.destroy();
  restart.visible = false;

  obstacleGroup.remove();

  trex.changeAnimation("trexWalk", texTrex);
  score = 0;

  //bg = 156;
}
