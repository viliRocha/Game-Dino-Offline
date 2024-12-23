// this will load from localStorage if it exists, otherwise it will load 0 as the default value
const savedScore = localStorage.getItem('userRecord') || 0;

// this is a giant list of all the variables used in the sketch, let's make this smaller
let trex,
    flyingDino,
    ground,
    clouds,
    moon,

    texGround,
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
  game_velocity = -8,
  time = "day",
  canJump = true,
  onGround = true,

  jumpingSound,
  collideSound,
  pointsSound;

function preload() {
  // Ground image gets preloaded because of its file size
  texGround = loadImage("/assets/ground2.webp");

  //Pterodactylus dinossaur enemy flying animation
  texFlyingDino = loadAnimation("/assets/bird1.png", "/assets/bird2.webp");

  //Trex animations
  texTrex = loadAnimation("/assets/trex1.png", "/assets/trex2.webp", "/assets/trex3.webp");
  trexSprint = loadAnimation("/assets/TrexDown1.png", "/assets/TrexDown2.png");
  trexCollide = loadImage("/assets/collide.webp");

  //Player sound effects
  jumpingSound = loadSound("/sounds/jump.wav");
  collideSound = loadSound("/sounds/collided.wav");
  pointsSound = loadSound("/sounds/point.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //Setting a speed to the frames of the animations
  texTrex.frameDelay = 5;
  trexSprint.frameDelay = 10;

  // Loading the game over text that will appear when player dies
  gameOverTxt = createImg("/assets/gameOver.webp", "Game Over");
  gameOverTxt.position(windowWidth / 2 - 254, windowHeight / 2 - 35);
  gameOverTxt.size(450, 45);

  // Creating a restart button that will only be shown when player dies
  restart = createImg("/assets/restart.png", "Restart");
  restart.position(windowWidth / 2 - 50, windowHeight / 2 + 25);
  restart.size(50, 50);


  moon = new Sprite(windowWidth / 2 + 300, -100, 50, 50);
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

  ground.image = texGround;
  ground.width = windowWidth * 7;
  ground.image.offset.y = -30;
  ground.scale = 0.9;

  //Removing friction between Trex and ground
  ground.friction = 0;

  //ground.setCollider('rectangle', 0, 0, ground.width, ground.height); // Sets the collider to the same proportions of the image

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
  text("Maximum score: " + maximumScore, windowWidth - 500, windowHeight / 2 - 130);//MaxScore goes before scrore beacuse it will not blink
  fill(255, 255, 255, textColor);
  text(score, windowWidth / 2 - 500, windowHeight / 2 - 130);

  //If player is already up in the air it can't jump
  if (!trex.collides(ground)) {
    trex.velocity.y += 1;
  }

  // there was a bug that happens for a fraction of a second when a new floor is rendered, which causes the player to cross the floor
  onGround = Math.round(trex.y + trex.height / 2) >= Math.round(ground.y - ground.height);
  // ground y: 754 trex y: 783

  //if player is alive
  if (gameState === "start") {
    score += Math.round(getFrameRate() / 60);

    restart.hide();
    gameOverTxt.hide();

    flyingDinoGroup.forEach(bird => {
      bird.animation.playing = true;
    });

    //Give the impression player is moving
    ground.velocity.x = game_velocity;

    //console.log(ground.position.x)

    //Generate a new ground in front of the other one otherwise player would fall(ground has speed)
    if (ground.position.x <= -4200) {
      ground.x = ground.width / 2;
    }
    //
    if (kb.presses('down')) {
      //   (distance, direction, speed)
      trex.changeAnimation("trexDown", trexSprint);
      trex.animation.offset.y = 15;

      canJump = false;
    }
    else if (kb.presses('up') && canJump === true && onGround) { //Verify if player presses up arrow and Deno is not at sprinting anim to jump
      trex.velocity.y = -20;

      jumpingSound.play();
    }

    //console.log(trex.animation);
    if (frameCount % 60 == 0) {
      generate_clouds();
    }

    //For every 500 more points the player makes the score will blink
    if (score % 500 === 0) {
      pointsSound.play();

      blink_text();

      //Make game slightly faster the more player plays
      game_velocity -= 1.5;
      //frameRate(120); // Defining the frame rate to 120 FPS(only works on stronger hardware)
    }

    //If player has already been playing for some time && determined frameRate is reached
    if (frameCount % 70 === 0) {
      
      if (score <= 300 || score % 3 === 0) {
        generate_cactuses();
      }
      else {
        //Generate Pterodactylus at random heights for player to dodge
        generate_flyingDino();

        // Day and night cycle 
        time: {
          if (day) {
            //Background will get clearer
            bg -= 25;
            //Moon will start to fade away
            moonOpacity += 25;
            if ((moon.y < -50)) {
              moon.velocity.y += 1;
            }
            //It will stay clear for some time...
            setTimeout(() => {
              if (bg <= 0) {
                day = false;
              }
            }, 8000);
            // if it's day, then the function ends here, there is no need to continue
            break time;
          }
          // if it's night, then the function continues and the code inside the if statement isn't executed
          //Background will get darker
          bg += 25;
          //Moon will get more visible
          moonOpacity -= 25;
          if ((moon.y > windowHeight + 100)) {
            moon.y = -1000;
          }

          //It will stay dark for some time...
          setTimeout(() => {
            if (bg >= 156) {
              day = true;
            }
          }, 8000);
        }
      }
    }

    //Trex dies
    if (trex.collides(obstacleGroup) || trex.collides(flyingDinoGroup)) {
      gameOverTxt.show();

      collideSound.play();

      gameState = "end";
    }
  }
  else if (gameState === "end") {
    trex.changeAnimation("dead", trexCollide);

    trex.velocity.x = 0;
    ground.velocity.x = 0;

    moon.velocity.y = 0;

    //obstacles need to stay in place, otherwise player would collide with them and they would go flying away(no gravity)
    obstacleGroup.collider = 'static';

    obstacleGroup.life = Infinity;

    flyingDinoGroup.collider = 'static';

    flyingDinoGroup.life = Infinity;

    //  Make so their animation stops in the correct frame
    flyingDinoGroup.forEach(bird => {
      bird.animation.playing = false;// Stops in the current frame
    });

    cloudsGroup.collider = 'static';

    cloudsGroup.life = Infinity;

    restart.show();

    document.body.addEventListener("click", () => {
      //reset Dino's position in case it dies in some weird position
      trex.position.x = 150;
      trex.position.y = windowHeight - 150;

      gameState = "start";

      time = "day";
      bg = 156;
      moonOpacity = 0;

      //Reset moon's and ground's position
      moon.position.y = -100;

      ground.position.x = 0;

      //reset cactuses, clouds and Pterodactylus generation
      obstacleGroup.remove();

      flyingDinoGroup.remove();

      cloudsGroup.remove();

      trex.changeAnimation("trexWalk", texTrex);
      score = 0;

      //Reset the game's speed too
      game_velocity = -8;
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

//Make the score text start to blink and stop it after 5 times
function blink_text() {
  let i = 0;

  if (i < 6) {
    const intervalId = setInterval(() => {
      textColor = (textColor === 255) ? 0 : 255;
      i++;

      // Verifies if 'i' reached it's limit
      if (i >= 6) {
        clearInterval(intervalId); // Clears the interval
        i = 0; // Resets 'i'
      }
    }, 300);
  }
}

function generate_clouds() {
  //
  clouds = new Sprite(windowWidth + 30, random(windowHeight / 2 - 200, windowHeight - 150), 90, 40);
  clouds.image = "/assets/cloud.png";

  //Clouds shouldn't collide with anything
  clouds.collider = 'none';

  //Clouds are a little slower than the rest of the sprites to make a paralax effect in the background
  clouds.velocity.x = game_velocity / 2;
  //Desapear after the get off screen, so game keeps performance
  clouds.life = 500;

  cloudsGroup.add(clouds);
}

function generate_cactuses() {
  //
  objObstacle1 = new Sprite(windowWidth + 30, windowHeight - 100, 50, 70);

  //setting cactuses weight to 0 because otherwise, it would filp the floor
  objObstacle1.mass = 0;

  //This way cactuses can't collide with Pterodactylus but can with the player
  objObstacle1.collider = 'kinematic';

  objObstacle1.velocity.x = game_velocity;
  //Setting life time to cactuses too
  objObstacle1.life = 300;

  obstacleGroup.add(objObstacle1);
  //randomize which cactus will be generated
  const rng = Math.round(random(1, 6));
  // set image
  objObstacle1.image = `/assets/obstacle${rng}.png`;
  objObstacle1.image.offset.y = rng <= 3 ? 13 : 0;
  //objObstacle1.debug = true;
}

function generate_flyingDino() {
  texFlyingDino.frameDelay = 14;

  //Possible heihts for flying dino to spawn in
  flyingDino = new Sprite(windowWidth + 30, random(windowHeight - 80, windowHeight - 230), 50, 50);
  flyingDino.addAnimation("flapping_wings", texFlyingDino);

  //This way flying dinos can't collide with cactuses but can with the player
  flyingDino.collider = 'kinematic';

  flyingDino.velocity.x = game_velocity;
  flyingDino.life = 300;

  //flyingDino.debug = true;

  flyingDinoGroup.add(flyingDino);
}