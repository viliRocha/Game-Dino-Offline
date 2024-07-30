const savedScore = localStorage.getItem('userRecord');

let trex,
  flyngDino,
  ground,
  clouds,
  moon,

  texTrex,
  trexSprint,
  trexCollide,
  texFlyingDino,

  cloudsGroup,
  obstacleGroup,
  flyingDinoGroup,

  gameOverTxt,

  restart,

  objObstacle1,

  score = 0,
  maximumScore = savedScore ? savedScore : 0,
  gameState = "start",
  bg = 156,
  moonOpacity = 0,
  time = "day",
  canJump = false,

  jumpingSound,
  collideSound;

function preload() {
  //Pterodactylus dinossaur enemy flying animation
  texFlyingDino = loadAnimation("assets/bird1.png", "assets/bird2.webp");

  //Trex animations
  texTrex = loadAnimation("assets/trex1.png", "assets/trex2.png", "assets/trex3.webp", "assets/trex4.webp");
  trexSprint = loadAnimation("assets/TrexDown1.png", "assets/TrexDown2.png");
  trexCollide = loadImage("assets/collide.webp");

  //Player sound effects
  jumpingSound = loadSound("./sound_FX/collided.wav");
  collideSound = loadSound("./sound_FX/jump.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //Setting a speed to the frames of the animations
  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  //Loading the game over text that will apear when player dies
  gameOverTxt = createImg("assets/gameOver.webp");
  gameOverTxt.position(windowWidth / 2 - 254, windowHeight / 2 - 35);
  gameOverTxt.size(450, 45);

  //creating a restart button that will only be shown when player dies
  restart = createImg("assets/restart.png");
  restart.position(windowWidth / 2 - 50, windowHeight / 2 + 25);
  restart.size(50, 50);

  trex = new Sprite(150, windowHeight - 150, 100, 100);
  trex.addAnimation("dead", trexCollide);
  trex.addAnimation("trexWalk", texTrex);
  trex.addAnimation("trexDown", trexSprint);

  trex.animation.offset.y = 15;
  trex.scale = 1;

  //Defining player's weight, player's mass is 0 because otherwise, it would flip the floor
  trex.mass = 0;

  ground = new Sprite(windowWidth / 2, windowHeight - 30, windowWidth, 50);
  ground.image = "assets/ground2.webp";

  ground.width = windowWidth * 7;
  ground.image.offset.y = -30;
  ground.scale = 0.9;

  //Removing friction between Trex and ground
  ground.friction = 0;

  //This way I can set the flyingDinosaurs height as low as I want
  ground.collider ='kinematic';

  //ground.debug = true;

  moon = new Sprite(windowWidth/2 + 300,windowHeight/2 - 120, 50, 50);
  moon.image = "assets/moon.webp";
  moon.scale = 0.15;

  //Defining font style
  textFont('Fira Code', 27);

  cloudsGroup = new Group();
  obstacleGroup = new Group();
  flyingDinoGroup = new Group();
}

function draw() {
  background(bg);

  moon.tint = color(255, 255, 255, moonOpacity);

  //Show player score and score record in screen
  fill("white");
  text(score, windowWidth - 1200, windowHeight - 530);
  text("Maximum score: " + maximumScore, windowWidth - 500, windowHeight - 530);

  //If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y += 1;
  }

  //Give the impression player is moving
  ground.velocity.x = -8;

  //if player is alive
  if (gameState == "start") {
    score += Math.round(getFrameRate() / 60);

    restart.hide();

    gameOverTxt.hide();

    //Generate a new ground in front of the other one otherwise player would fall(ground has speed)
    if (ground.x <= -windowWidth - 2200) {
      ground.x = ground.width / 2;
    }

    if (kb.presses('down')) {
      //   (distance, direction, speed)
      trex.changeAnimation("trexDown", trexSprint);

      canJump = false;
    }
    //Verify if player presses up arrow and Deno is not at sprinting anim to jump
    else if (kb.presses('up') && trex.y >= windowHeight - 110 && canJump == true) {
      trex.velocity.y = -20;

      jumpingSound.play();
    }

    //console.log(trex.animation);
    generate_clouds();
    generate_cactuses();

    //If player has already been playing for some time && determined frameRate is reached
    if (score >= 300 && frameCount % 60 == 0) {
      //Make game slightly faster the more player plays
      trex.velocity.x = trex.velocity.x * 1.6;
      ground.velocity.x = ground.velocity.x * 1.6;
      objObstacle1.velocity.x = objObstacle1.velocity.x * 1.009;

      //Generate Pterodactylus at random heights for player to dodge
      generate_flyingDino();

      //Day and night cycle 
      if (time == "day") {
        //Background will get clearer
        bg -= 25;
        //Moon will start to fade away
        moonOpacity+= 25;
        //It will stay clear for some time...
        setTimeout(() => {
          if (bg <= 0) {
            time = "night";
          }
        }, 4000)
      }
  
      if (time == "night") {
        //Background will get darker
        bg += 25;
        //Moon will get more visible
        moonOpacity -= 25;
        //It will stay dark for some time...
        setTimeout(() => {
          if (bg >= 156) {
            time = "day";
          }
        }, 4000)
      }
    }

    //Trex dies
    if (trex.collides(obstacleGroup) || trex.collides(flyingDinoGroup)) {
      gameOverTxt.show();

      collideSound.play();

      gameState = "end";
    }
  }

  if (gameState == "end") {
    trex.changeAnimation("dead", trexCollide);

    trex.velocity.x = 0;
    ground.velocity.x = 0;

    //obstacles need to stay in place, otherwise player would collide with them and they would go flying away(no gravity)
    obstacleGroup.collider = 'static';

    obstacleGroup.life = Infinity;

    flyingDinoGroup.collider = 'static';

    flyingDinoGroup.life = Infinity;

    cloudsGroup.collider = 'static';

    cloudsGroup.life = Infinity;

    restart.show();

    if (mouse.presses()) {
      reset();
    }

    //Check for new player score record
    if (score > maximumScore) {
      maximumScore = score;

      //Save player maximum score so if the page is reloaded player will still have its score record saved
      localStorage.setItem("userRecord", maximumScore);
    }
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
  if (frameCount % 60 == 0) {
    clouds = new Sprite(windowWidth + 30, random(100, 500), 90, 40);
    clouds.image = "assets/cloud.png";

    //Clouds shouldn't collide with anything
    clouds.collider = 'none';

    clouds.velocity.x = -4;
    //Desapear after the get off screen, so game keeps performance
    clouds.life = 350;

    cloudsGroup.add(clouds);
  }
}

function generate_cactuses() {
  if (frameCount % 70 == 0) {
    objObstacle1 = new Sprite(windowWidth + 30, windowHeight - 100, 50, 70);

    //setting cactuses weight to 0 because otherwise, it would filp the floor
    objObstacle1.mass = 0;

    //This way cactuses can't collide with Pterodactylus but can with the player
    objObstacle1.collider = 'kinematic';

    objObstacle1.velocity.x = -8;
    //Setting life time to cactuses too
    objObstacle1.life = 180;

    obstacleGroup.add(objObstacle1);
    //randomize which cactus will be generated
    let choose_cactus = Math.round(random(1, 6));
    switch (choose_cactus) {
      case 1:
        objObstacle1.image = "assets/obstacle1.png";
        objObstacle1.image.offset.y = 13;
        break;
      case 2:
        objObstacle1.image = "assets/obstacle2.png";
        objObstacle1.image.offset.y = 13;
        break;
      case 3:
        objObstacle1.image = "assets/obstacle3.png";
        objObstacle1.image.offset.y = 13;
        break;
      case 4:
        objObstacle1.image = "assets/obstacle4.png";
        break;
      case 5:
        objObstacle1.image = "assets/obstacle5.png";
        break;
      case 6:
        objObstacle1.image = "assets/obstacle6.png";
        break;
    }
    //objObstacle1.debug = true;
  }
}

function generate_flyingDino() {
  //Possible heihts for flying dino to spawn in
  let flying_dino_pos = [300, 542];
  texFlyingDino.frameDelay = 14;

  flyngDino = new Sprite(windowWidth + 30, random(flying_dino_pos), 50, 50);
  flyngDino.addAnimation("flapping_wings", texFlyingDino);

  //This way flying dinos can't collide with cactuses but can with the player
  flyngDino.collider = 'kinematic';

  flyngDino.velocity.x = -11;
  flyngDino.life = 180;

  //flyngDino.debug = true;

  flyingDinoGroup.add(flyngDino);
}

//Called when player clicks on button to play again
function reset() {
  //reset Dino's position in case it dies in some weird position
  trex.position.y = 550;
  trex.position.x = 80;

  gameState = "start";

  time = "day";
  bg = 156;

  //reset cactuses, clouds and Pterodactylus generation
  obstacleGroup.remove();

  flyingDinoGroup.remove();

  cloudsGroup.remove();

  trex.changeAnimation("trexWalk", texTrex);
  score = 0;
}