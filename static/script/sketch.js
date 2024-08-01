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
    maximumScore = savedScore,
    endGame = false,
    bg = 156,
    moonOpacity = 0,
    time = "day",
    canJump = true,

    jumpingSound,
    collideSound,
    onGround = true;

function preload() {
  // Pterodactylus dinossaur enemy flying animation
  texFlyingDino = loadAnimation("/assets/bird1.png", "/assets/bird2.webp");

  // Trex animations
  texTrex = loadAnimation("/assets/trex1.png", "/assets/trex2.png", "/assets/trex3.webp", "/assets/trex4.webp");
  trexSprint = loadAnimation("/assets/TrexDown1.png", "/assets/TrexDown2.png");
  trexCollide = loadImage("/assets/collide.webp");

  // Player sound effects
  jumpingSound = loadSound("/sounds/collided.wav");
  collideSound = loadSound("/sounds/jump.wav");
}

function setup() {
  /*let canvas = document.createElement('canvas');
  canvas.width = windowWidth;
  canvas.height = windowHeight;

  let ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, windowWidth, windowHeight);*/
  createCanvas(windowWidth, windowHeight);

  //Setting a speed to the frames of the animations
  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  // Loading the game over text that will apear when player dies
  gameOverTxt = createImg("/assets/gameOver.webp");
  gameOverTxt.position(windowWidth / 2 - 254, windowHeight / 2 - 35);
  gameOverTxt.size(450, 45);

  // reating a restart button that will only be shown when player dies
  restart = createImg("/assets/restart.png");
  restart.position(windowWidth / 2 - 50, windowHeight / 2 + 25);
  restart.size(50, 50);

  trex = new Sprite(150, windowHeight - 150, 100, 100);
  trex.addAnimation("dead", trexCollide);
  trex.addAnimation("trexDown", trexSprint);
  trex.addAnimation("trexWalk", texTrex);

  trex.scale = 1;
  // this is just for testing, remove when done (just mark as a comment)
  //trex.collider = 'kinematic';

  // Defining player's weight, player's mass is 0 because otherwise, it would flip the floor
  trex.mass = 0;

  ground = new Sprite(windowWidth / 2, windowHeight - 30, windowWidth, 50);
  ground.image = "/assets/ground2.webp";

  ground.width = windowWidth * 7;
  ground.image.offset.y = -30;
  ground.scale = 0.9;

  // Removing friction between Trex and ground
  ground.friction = 0;

  // This way I can set the flyingDinosaurs height as low as I want
  ground.collider = 'kinematic';

  // ground.debug = true;

  moon = new Sprite(windowWidth/2 + 300,windowHeight/2 - 120, 50, 50);
  moon.image = "/assets/moon.webp";
  moon.scale = 0.15;
  moon.collider = 'none';

  // Defining font style
  textFont('Fira Code', 27);

  cloudsGroup = new Group();
  obstacleGroup = new Group();
  flyingDinoGroup = new Group();
}

function draw() {
  background(bg);

  moon.tint = color(255, 255, 255, moonOpacity);

  // Show player score and score record in screen
  fill("white");
  text(score, windowWidth - 1200, windowHeight - 530);
  text("Maximum score: " + maximumScore, windowWidth - 500, windowHeight - 530);

  // If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y += 1;
  }

  // Give the impression player is moving
  // my idea: make the ground animation move and not the object itself
  ground.velocity.x = -8;

  // existe um bug que acontece por uma fração de segundo quando um novo chão é renderizado, que o player atravessa o chão
  onGround = Math.round(trex.y) >= Math.round(ground.y - ground.height) - 30;
  // ground y: 754 trex y: 783

  //if player is alive
  if (!endGame) {
    score += Math.round(getFrameRate() / 60);

    restart.hide();
    gameOverTxt.hide();

    // Generate a new ground in front of the other one otherwise player would fall(ground has speed)
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
    } else if (kb.presses('up') && canJump == true && onGround) { //Verify if player presses up arrow and Deno is not at sprinting anim to jump
      trex.velocity.y = -20;

      jumpingSound.play();
    }

    // console.log(trex.animation);
    generate_clouds();
    generate_cactuses();

    // If player has already been playing for some time && determined frameRate is reached
    if (score >= 300 && frameCount % 60 == 0) {
      //Make game slightly faster the more player plays
      trex.velocity.x = trex.velocity.x * 1.6;
      ground.velocity.x = ground.velocity.x * 1.6;
      objObstacle1.velocity.x = objObstacle1.velocity.x * 1.009;

      // Generate Pterodactylus at random heights for player to dodge
      generate_flyingDino();

      // Day and night cycle 
      dayTime: {
        //Day and night cycle 
        if (day) {
          //Background will get clearer
          bg -= 25;
          //Moon will start to fade away
          moonOpacity+= 25;
          //It will stay clear for some time...
          setTimeout(() => {
            if (bg <= 0) {
              day = false;
            }
          }, 4000)

          break dayTime;
        }
    
        //Background will get darker
        bg += 25;
        //Moon will get more visible
        moonOpacity -= 25;
        //It will stay dark for some time...
        setTimeout(() => {
          if (bg >= 156) {
            day = true;
          }
        }, 4000)
      }
    }

    // Trex dies
    if (trex.collides(obstacleGroup) || trex.collides(flyingDinoGroup)) {
      gameOverTxt.show();

      collideSound.play();

      endGame = true;
    }
    return
  }
  // bug da lua, continua andando mesmo o jogo tendo acabado ou resetado, sua posição não é resetada
  trex.changeAnimation("dead", trexCollide);

  trex.velocity.x = ground.velocity.x = 0;

  // obstacles need to stay in place, otherwise player would collide with them and they would go flying away(no gravity)
  obstacleGroup.collider = flyingDinoGroup.collider = cloudsGroup.collider = 'static';

  obstacleGroup.life = flyingDinoGroup.life = cloudsGroup.life = Infinity;

  restart.show();

  document.body.addEventListener("click",  restartGame)
  document.body.addEventListener("keydown", restartGame)

  maximumScore = score > maximumScore ? score : maximumScore;

  // Save player maximum score so if the page is reloaded player will still have its score record saved
  localStorage.setItem("userRecord", maximumScore); 
}

// Check if Down arrow was released
document.body.addEventListener("keyup", e => {
  if (e.key != "ArrowDown" && e.key != "s") { return }
  // if the arrow pressed is down or s:
  trex.changeAnimation("trexWalk", texTrex);
  trex.animation.offset.y = 0;
  canJump = true;
});

function restartGame() {
  if (!endGame) { return }
  // reset Dino's position in case it dies in some weird position
  trex.position.y = 550;
  trex.position.x = 80;

  endGame = false;

  time = "day";
  bg = 156;
  moonOpacity = 0;

  // reset cactuses, clouds and Pterodactylus generation
  obstacleGroup.remove();

  flyingDinoGroup.remove();

  cloudsGroup.remove();

  trex.changeAnimation("trexWalk", texTrex);
  score = 0;
  canJump = true;
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

  // setting cactuses weight to 0 because otherwise, it would filp the floor
  objObstacle1.mass = 0;

  // This way cactuses can't collide with Pterodactylus but can with the player
  objObstacle1.collider = 'kinematic';

  objObstacle1.velocity.x = -8;
  // Setting life time to cactuses too
  objObstacle1.life = 180;

  obstacleGroup.add(objObstacle1);
  // randomize which cactus will be generated
  let rng = Math.round(random(1, 6));
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