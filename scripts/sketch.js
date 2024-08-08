// this will load from localStorage if it exists, otherwise it will load 0 as the default value
const savedScore = localStorage.getItem('userRecord') || 0;

// this is a giant list of all the variables used in the sketch, let's make this smaller
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
    textColor = 255,
    time = "day",
    canJump = true,

    jumpingSound,
    collideSound,
    pointsSound,
    onGround = true;

function preload() {
  //Pterodactylus dinossaur enemy flying animation
  texFlyingDino = loadAnimation("/assets/bird1.png", "/assets/bird2.webp");

  //Trex animations
  texTrex = loadAnimation("/assets/trex1.png", "/assets/trex2.webp", "/assets/trex3.webp");
  trexSprint = loadAnimation("/assets/TrexDown1.png", "/assets/TrexDown2.png");
  trexCollide = loadImage("/assets/collide.webp");

  //Player sound effects
  jumpingSound = loadSound("/sounds/jump.wav");
  collideSound = loadSound("/sounds/collided.wav");
  pointsSound = loadSound("/sounds/point.wav")
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //Setting a speed to the frames of the animations
  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  //Loading the game over text that will apear when player dies
  gameOverTxt = createImg("/assets/gameOver.webp");
  gameOverTxt.position(windowWidth / 2 - 254, windowHeight / 2 - 35);
  gameOverTxt.size(450, 45);

  //creating a restart button that will only be shown when player dies
  restart = createImg("/assets/restart.png");
  restart.position(windowWidth / 2 - 50, windowHeight / 2 + 25);
  restart.size(50, 50);

  moon = new Sprite(windowWidth/2 + 300, -100, 50, 50);
  moon.image = "/assets/moon.webp";
  moon.scale = 0.20;
  moon.collider = 'none';

  trex = new Sprite(150, windowHeight - 150, 100, 100);
  trex.addAnimation("dead", trexCollide);
  trex.addAnimation("trexDown", trexSprint);
  trex.addAnimation("trexWalk", texTrex);

  trex.scale = 1;

  //Defining player's weight, player's mass is 0 because otherwise, it would flip the floor
  trex.mass = 0;

  ground = new Sprite(windowWidth / 2, windowHeight - 30, windowWidth, 50);
  ground.image = "/assets/ground2.webp";

  ground.width = windowWidth * 7;
  ground.image.offset.y = -30;
  ground.scale = 0.9;

  //Removing friction between Trex and ground
  ground.friction = 0;

  //This way I can set the flyingDinosaurs height as low as I want
  ground.collider = 'kinematic';

  //ground.debug = true;

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
  text("Maximum score: " + maximumScore, windowWidth - 500, windowHeight - 530);//MaxScore goes before scrore beacuse it will not blink
  fill(255, 255, 255, textColor);
  text(score, windowWidth - 1200, windowHeight - 530);

  //If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y += 1;
  }

  if (score % 200 == 0) {
    pointsSound.play();

    blink_text();
  }

  // existe um bug que acontece por uma fração de segundo quando um novo chão é renderizado, que o player atravessa o chão
  onGround = Math.round(trex.y) >= Math.round(ground.y - ground.height) - 30;
  // ground y: 754 trex y: 783

  //if player is alive
  if (gameState == "start") {
    score += Math.round(getFrameRate() / 60);

    restart.hide();
    gameOverTxt.hide();

    //Give the impression player is moving
    // my idea: make the ground animation move and not the object itself
    ground.velocity.x = -8;

    //Generate a new ground in front of the other one otherwise player would fall(ground has speed)
    // with my idea, the ground animation moves and not the object itself, so this wouldn't be necessary
    if (ground.x <= -windowWidth - 2200) {
      ground.x = ground.width / 2;
    }
    //
    if (kb.presses('down')) {
      //   (distance, direction, speed)
      trex.changeAnimation("trexDown", trexSprint);
      trex.animation.offset.y = 15;

      canJump = false;
    }
    else if (kb.presses('up') && canJump == true && onGround) { //Verify if player presses up arrow and Deno is not at sprinting anim to jump
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

      // Day and night cycle 
      time: {
        if (day) {
          //Background will get clearer
          bg -= 25;
          //Moon will start to fade away
          moonOpacity += 25;
          if((moon.y < -50)) {
            moon.velocity.y += 2;
          }
          //It will stay clear for some time...
          setTimeout(() => {
            if (bg <= 0) {
                day = false;
            }
          }, 8000)
          // if it's day, then the function ends here, there is no need to continue
          break time;
        }
        // if it's night, then the function continues and the code inside the if statement isn't executed
        //Background will get darker
        bg += 25;
        //Moon will get more visible
        moonOpacity -= 25;
        if((moon.y > windowHeight + 100)) {
          moon.y = -100;
        }

        //It will stay dark for some time...
        setTimeout(() => {
          if (bg >= 156) {
            day = true;
          }
        }, 8000)
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
    // bug da lua, continua andando mesmo o jogo tendo acabado ou resetado, sua posição não é resetada
    trex.changeAnimation("dead", trexCollide);

    trex.velocity.x = 0;
    ground.velocity.x = 0;
    moon.velocity.y = 0;

    //obstacles need to stay in place, otherwise player would collide with them and they would go flying away(no gravity)
    obstacleGroup.collider = 'static';

    obstacleGroup.life = Infinity;

    flyingDinoGroup.collider = 'static';

    flyingDinoGroup.life = Infinity;

    cloudsGroup.collider = 'static';

    cloudsGroup.life = Infinity;

    restart.show();

    document.body.addEventListener("click", () => {
      //reset Dino's position in case it dies in some weird position
      trex.position.y = 550;
      trex.position.x = 80;

      gameState = "start";

      time = "day";
      bg = 156;
      moonOpacity = 0;

      //reset cactuses, clouds and Pterodactylus generation
      obstacleGroup.remove();

      flyingDinoGroup.remove();

      cloudsGroup.remove();

      trex.changeAnimation("trexWalk", texTrex);
      score = 0;
    })

    maximumScore = score > maximumScore ? score : maximumScore;

    //Save player maximum score so if the page is reloaded player will still have its score record saved
    localStorage.setItem("userRecord", maximumScore);
  }
}

//Check if Down arrow was released
document.body.addEventListener("keyup", e => {
  if (e.key != "ArrowDown" && e.key != "s") { return }
  // if the arrow pressed is down or s:
  trex.changeAnimation("trexWalk", texTrex);
  trex.animation.offset.y = 0;
  canJump = true;
});

//Make the score text blink
function blink_text() {
  textColor = (textColor === 255) ? 0 : 255;
  /*
  if (frameCount % 60 == 0) {
    textColor = 0; // Set text color to black
  } 
  else if (frameCount % 30 == 0) {
    textColor = 255; // Set text color to white
  }
  */
}

function generate_clouds() {
  if (frameCount % 60 != 0) { return }
  //
  clouds = new Sprite(windowWidth + 30, random(100, 500), 90, 40);
  clouds.image = "/assets/cloud.png";

  //Clouds shouldn't collide with anything
  clouds.collider = 'none';

  clouds.velocity.x = -4;
  //Desapear after the get off screen, so game keeps performance
  clouds.life = 350;

  cloudsGroup.add(clouds);
}

function generate_cactuses() {
  if (frameCount % 70 != 0) { return }
  //
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
  const rng = Math.round(random(1, 6));
  // set image
  objObstacle1.image = `/assets/obstacle${rng}.png`;
  objObstacle1.image.offset.y = rng <= 3 ? 13 : 0;
  //objObstacle1.debug = true;
}

function generate_flyingDino() {
  //Possible heihts for flying dino to spawn in
  texFlyingDino.frameDelay = 14;

  flyngDino = new Sprite(windowWidth + 30, random(300, 542), 50, 50);
  flyngDino.addAnimation("flapping_wings", texFlyingDino);

  //This way flying dinos can't collide with cactuses but can with the player
  flyngDino.collider = 'kinematic';

  flyngDino.velocity.x = -11;
  flyngDino.life = 180;

  //flyngDino.debug = true;

  flyingDinoGroup.add(flyngDino);
}
