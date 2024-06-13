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

  //Setting a speed to the frames of the animations
  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  //creating a restart button that will only be shown when player dies
  restart= createImg("assets/restart.png");
  restart.position(windowWidth / 2, windowHeight / 2);
  restart.size(50, 50);

  trex = createSprite(80, windowHeight - 150, 100, 100)
  trex.addAnimation("dead", trexCollide);
  trex.addAnimation("trexWalk", texTrex);
  trex.addAnimation("trexDown", trexSprint);

  trex.animation.offset.y = 15;
  trex.scale = 1;

  //Defining player's weight, player's mass is 0 because otherwise, it would flip the floor
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

  //Show player score in screen
  fill("white");
  text(score, windowWidth - 1300, windowHeight - 600);

  //If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y = trex.velocity.y + 1;
  }

  //Just has some speed to stay in place, otherwise, the ground would drag it away
  trex.velocity.x = 0.26;
  //Give the impression player is moving
  ground.velocity.x = -8;

  //If layer is alive
  if (gameState == "start") {
    score = score + Math.round(getFrameRate() / 60);

    restart.hide();

    //Generate a new ground in front of the other one otherwise player would fall(ground has speed)
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
    //Verify if player presses up arrow and Deno is not at sprinting anim to jump
    else if (kb.presses('up') && trex.y >= windowHeight - 110 && canJump == true/*trex.animation.name == 'trexDown'*/) {
      trex.velocity.y = -20;
    }

    //console.log(trex.animation)
    generate_clouds();
    generate_cactuses();

    //If player has already been playing for some time && determined frameRate is reached
    if (score >= 300 && frameCount % 50) {
      //Make game slightly faster the more player plays
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

    //cactuses need to stay in place, otherwise player would collide with them and they would go flying away(no gravity)
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
     //creating clouds as an image because it won't be able to collide with the player
    clouds = createImg("assets/cloud.png");
    clouds.position(windowWidth / 2, random(100, 500));
    clouds.size(90, 40);

    //clouds.position = clouds.position + 10;
    //clouds.velocity.x = 20;
    //clouds.lifetime = 110;

    //cloudsGroup.add(clouds);
  }
}

function generate_cactuses() {

  if (frameCount % 70 == 0) {
    objObstacle1 = new Sprite(windowWidth + 30, windowHeight - 100, 50, 70);

    //setting cactuses weight to 0 because otherwise, it would filp the floor
    objObstacle1.mass = 0;

    objObstacle1.velocity.x = -8;
    objObstacle1.lifetime = 80;

    obstacleGroup.add(objObstacle1);
    //randomize which cactus will be generated
    let choose_cactus = Math.round(random(1, 6));
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
    //objObstacle1.debug = true;
  }
}

//Called when player clicks on button to play again
function reset() {
  //reset Dino's position in case it dies in some weird position
  trex.position.y = 550;
  trex.position.x = 80;

  gameState = "start";

  //texGameOver.destroy();
  restart.visible = false;

  //reset cactuses generation
  obstacleGroup.remove();

  trex.changeAnimation("trexWalk", texTrex);
  score = 0;

  //bg = 156;
}
