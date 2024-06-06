var trex;
var dinossour;
var ground;
var sky;
var obstacle1;
var obstacle2;
var obstacle3;
var obstacle4;
var obstacle5;
var obstacle6;
var collided;
var gameOver;
var chaoDaGambiarra;
var Lua;

var texTrex;
var texGround;
var agachaTrex;
var texDinossour;
var texSky;
var texGameOver;
var texLua;

var skyGroup;
var obstacleGroup;
var dinossourGroup;

var recomecar;

var objObstacle1;

var score = 0;
var maximunScore = 0;
var bg = 156;
var gameState = "start";
var horario = "dia";

var jumpSound;
var collideSound;


function preload(){
    texGround = loadImage("assets/ground2.png");
    texLua = loadImage("assets/LuaTrex.png")
    gameOver = loadImage("assets/gameOver.png")
    collided = loadImage("assets/collide.png")
    texSky = loadImage("assets/cloud.png");
    obstacle1 = loadImage("assets/obstacle1.png");
    obstacle2 = loadImage("assets/obstacle2.png");
    obstacle3 = loadImage("assets/obstacle3.png");
    obstacle4 = loadImage("assets/obstacle4.png");
    obstacle5 = loadImage("assets/obstacle5.png");
    obstacle6 = loadImage("assets/obstacle6.png");

      texTrex = loadAnimation("assets/trex1.png", "assets/trex2.png", "assets/trex3.png", "assets/trex4.png");
      agachaTrex = loadAnimation("assets/TrexDown1.png", "assets/TrexDown2.png");
      texDinossour = loadAnimation("assets/bird1.png", "assets/bird2.png");

      //jumpSound = loadSound("collided.wav");
      //collideSound = loadSound("jump.wav");
      texTrex.playing = true;
      agachaTrex.playing = true;
      texDinossour.playing = true;
    }


    function setup() {
        createCanvas(windowWidth,windowHeight);
      
        texTrex.frameDelay = 4;
          
        trex = createSprite(80, windowHeight-150, 20, 20)
          trex.addAnimation("topTrex",texTrex);
          trex.addAnimation("legalTrex", agachaTrex);
          trex.addImage("falecido", collided);
          trex.scale = 1
      
        ground = createSprite(windowWidth/2,windowHeight-20, windowWidth, 50);
      ground.addImage("chaoFirme", texGround);
      ground.scale = 0.9
      ground.debug = true;

      ground.width = windowWidth;
      ground.heigth = 20;
      //ground.setCollider("rectangle", 0, 10, ground.width, 20);

      chaoDaGambiarra = createSprite(windowWidth/2,windowHeight+150, windowWidth, 50);
      
      Lua = createSprite(windowWidth/2 + 300,windowHeight/2 - 150, 50, 50);
      Lua.addImage("luaCheia", texLua);
      Lua.scale = 0.2
      Lua.visible = false;
      
      skyGroup = new Group()
      obstacleGroup = new Group()
      dinossourGroup = new Group()
      }


      function draw() {
        background(bg); 
      
      ground.velocityX = -100;
      
      
      if(gameState == "start"){

        if(horario == "dia" && frameCount %30 == 0) {
          Lua.visible = false;
      bg = bg - 10;
      setTimeout(()=>{
        if(bg <= 0) {
          horario = "noite";
        }
      },5000)
        }
      
        if(horario == "noite" && frameCount %30 == 0) {
          Lua.visible = true;
          bg = bg + 10;
          setTimeout(()=>{
            if(bg >= 156) {
              horario = "dia";
            }
          },5000)
        }
      
        cloudsney();
        chatoniulda();
        Passaros();
      
        trex.collide(ground);

        score = score + Math.round(getFrameRate()/60);

        if(trex.collide(obstacleGroup)){
         trex.changeImage("falecido", collided);

          texGameOver = createSprite(windowWidth/2, 300, 200, windowWidth)
          texGameOver.addImage("youAreDead", gameOver)

          gameState = "end";
         }
         if(trex.collide(dinossourGroup)){
          trex.changeImage("falecido", collided);

          texGameOver = createSprite(windowWidth/2, 300, 200, windowWidth)
          texGameOver.addImage("youAreDead", gameOver);

          gameState = "end";
        }
        /*
        if(keyDown("up") && trex.y >= windowHeight - 75){
        
          trex.velocityY=-16
  
          jumpSound.play();
        }
        else if(keyDown("down")){
          trex.changeAnimation("legalTrex", agachaTrex);
        }
*/
        document.onkeydown = function(event) {
          if (event.keyCode == 38 && trex.y >= windowHeight - 75) {
            trex.velocityY=-16
  
            //jumpSound.play();
          }
          else if(event.keyCode == 40){
            trex.changeAnimation("legalTrex", agachaTrex);
          }
        };
      }
      
      if(gameState == "end"){

        collideSound.play();

      obstacleGroup.setVelocityXEach(0);
      skyGroup.setVelocityXEach(0);
      dinossourGroup.setVelocityXEach(0);
      obstacleGroup.setLifetimeEach(-1);
      skyGroup.setLifetimeEach(-1);
      dinossourGroup.setLifetimeEach(-1);
      dinossourGroup.setLifetimeEach(-1);

      
      //trex.velocityX = 0;
      //trex.velocityY =-1000;
      trex.velocity.y = 30;
      

      recomecar = createImg("assets/restart.png");
      recomecar.position(windowWidth/2, windowHeight/2);
      recomecar.size(50,50);
      recomecar.mouseClicked(reset);

      gameState = "stop";

      if(score > maximunScore){
        maximunScore=score;
      }
      }
      
      if(gameState == "stop"){
        ground.velocityX = 0;
      }
      
      trex.collide(chaoDaGambiarra);
      
      trex.velocity.y = trex.velocity.y + 1
      
      if(ground.x <= -windowWidth + 500){
        ground.x = ground.width/3
      }
      
      textSize(40)
      fill("white")
      text(score, windowWidth - 1300, windowHeight - 600)
      text("Your maximun score: " + maximunScore, windowWidth - 500,windowHeight - 600)
      
        //drawSprites();
      }


      function keyReleased(){
        if(keyCode == 40){
          trex.changeAnimation("topTrex", texTrex);
        }
      }
      //Tabela ASCII


      function cloudsney() {

        if(frameCount % 20 == 0){
        sky = createSprite(windowWidth + 30, random(100, 500), 100, 100);
        sky.addImage("claison", texSky);

        sky.velocityX = -13;
        sky.lifetime = 110;

        skyGroup.add(sky);
        }
       }


       function chatoniulda() {

        if(frameCount % 35 == 0){

          objObstacle1 = createSprite(windowWidth + 30, windowHeight - 50, 50, 70);

      objObstacle1.velocityX = -20;
      objObstacle1.lifetime = 80;

      obstacleGroup.add(objObstacle1);   
      var nada = Math.round(random(1, 6));
      switch(nada){
        case 1: objObstacle1.addImage("maluquinho", obstacle1);
        break;
        case 2: objObstacle1.addImage("maluquinho", obstacle2);
        break;
        case 3: objObstacle1.addImage("maluquinho", obstacle3);
        break;
        case 4: objObstacle1.addImage("maluquinho", obstacle4);
        break;
        case 5: objObstacle1.addImage("maluquinho", obstacle5);
        break;
        case 6: objObstacle1.addImage("maluquinho", obstacle6);
        break;
      }
      
      
        }
      
       }


       function Passaros() {

        let dinnoPos = [400, 580, 610, 640];

        if(score >= 100){

        if(frameCount % 50 == 0 && score != 0){

          texDinossour.frameDelay = 10;

          dinossour = createSprite(windowWidth + 30, random(dinnoPos), 100, 100);
          dinossour.addAnimation("voando", texDinossour);

          dinossour.velocityX = -25;
        dinossour.lifetime = 80;

        dinossourGroup.add(dinossour);
        }
       }
      }


      function reset(){

        gameState = "start";

        texGameOver.destroy();
        recomecar.hide();

        obstacleGroup.destroyEach();
        skyGroup.destroyEach();
        dinossourGroup.destroyEach();

        trex.y = 550;
        trex.x = 80;
        trex.changeAnimation("topTrex",texTrex);
        score = 0;
      
        bg = 156;
        horario = "dia";
      Lua.visible = false;
       }

       function windowResized() {
        resizeCanvas(windowWidth, windowHeight, true);

        window.location.reload();
      }
