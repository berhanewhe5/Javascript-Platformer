"use strict";

//Game Objects
let player;
let sword;
let level1Ground;
let level2Ground;
let level3Ground;
let background;
let spike1;
let spike2;
let spike3;
let spike4;
let spike5;
let spike6;
let fireball;
let dragon;

//UI Screens
let mainMenuCanvas;
let levelCompleteCanvas;
let gameCompleteCanvas;
let gameOverCanvas;

//Game Conditions
let level = 1;
let gameComplete;
let changeLevel = false;
let startPressed = false;
let showLoseScreen = false;
let dragonDeath = false;

//Player Movement
let moveRight = false;
let moveLeft = false;
let movementSpeed = 5;
let jumping = false;
let jumpHeight = 120;
let jumpSpeed = 12;
let currentY = 440;
let time = 1;
let onGroundHeight = true;
let grounded = true;
let falling = false;

//Dragon Fireballs
let fireballSpeed = 10;
let fireballActive = false;
let fireballInterval;
//Pits
let xMaxCollision;
let xMinCollision;
let inPit = false;

//Sword
let swordAttackActive = false;

//Sprites
let playerSprite = "images/PlayerMovement/PlayerMovement.0003.png";
let swordSprite = "images/PlayerAttack/SwordAnimation.0001.png";

//Preloading images into game

let playerMovementSprites = [];
let playerJumpSprite = new Image();
let playerFallSprite = new Image();
let playerAttackSprites = [];
let swordAttackSprites = [];

function startGame()
{
    //Initialize Animations

    playerMovementSprites.length = 9;
    for (let i = 0 ; i<playerMovementSprites.length; i++)
    {
        playerMovementSprites[i] = new Image();
        playerMovementSprites[i].src = "images/PlayerMovement/PlayerMovement.000"+(i+1).toString()+".png";
    }
    playerJumpSprite.src = "images/PlayerMovement/PlayerJump.png";
    playerFallSprite.src = "images/PlayerMovement/PlayerFall.png";

    playerAttackSprites.length = 4;
    for (let i = 0 ; i<playerAttackSprites.length; i++)
    {
        playerAttackSprites[i] = new Image();
        playerAttackSprites[i].src = "images/PlayerAttack/PlayerAttack.000"+(i+1).toString()+".png";
    }

    swordAttackSprites.length = 4;
    for (let i = 0 ; i<swordAttackSprites.length; i++)
    {
        swordAttackSprites[i] = new Image();
        swordAttackSprites[i].src = "images/PlayerAttack/SwordAnimation.000"+(i+1).toString()+".png";
    }

    //Initialize Game Objects
    player = new Component(64.1, 100, playerSprite, 640, 440, "player");
    sword = new Component(141,100, swordSprite, 1085-35,440,"sword");
    level1Ground = new Component (4667,720,"images/Level1Ground.png",0,100,"image");
    level2Ground = new Component (4667,720,"images/Level2Ground.png",0,100,"image");
    level3Ground = new Component (6000,720,"images/Level3Ground.png",0,100,"image");
    gameCompleteCanvas = new Component(1280, 720,"images/Game Complete.png",0,0,"image");
    levelCompleteCanvas = new Component(1280, 720,"images/Level Complete.png",0,0,"image");
    gameOverCanvas = new Component(1280, 720,"images/Game Over.png",0,0,"image");
    mainMenuCanvas = new Component(1280, 720,"images/Main menu.png",0,0,"image");
    background = new Component(1280,720,"SkyBlue",0,0);
    if(level === 1){
        spike1 = new Component(90,24, "images/Spike.png", 640+615, 520, "image");
        spike2 = new Component(90,24, "images/Spike.png", 640+2025, 520, "image");
        spike3 = new Component(90,24, "images/Spike.png", 640+2790, 520, "image");
        dragon = new Component(90,88,"images/Dragon.png", 640 +3365+500, 440,"image");
    }
    else if(level === 2){
        spike1 = new Component(90,24, "images/Spike.png", 640+575, 520, "image");
        spike2 = new Component(90,24, "images/Spike.png", 640+1455, 520, "image");
        spike3 = new Component(90,24, "images/Spike.png", 640+2465, 520, "image");
        spike4 = new Component(90,24, "images/Spike.png", 640+3240, 520, "image");
        dragon = new Component(90,88,"images/Dragon.png", 640 +3365+500, 440,"image");
    }
    else if(level === 3){
        spike1 = new Component(90,24, "images/Spike.png", 640+300, 520, "image");
        spike2 = new Component(90,24, "images/Spike.png", 640+1470, 520, "image");
        spike3 = new Component(90,24, "images/Spike.png", 640+2405, 520, "image");
        spike4 = new Component(90,24, "images/Spike.png", 640+2940, 520, "image");
        spike5 = new Component(90,24, "images/Spike.png", 640+3160, 520, "image");
        spike6 = new Component(90,24, "images/Spike.png", 640+3725, 520, "image");
        dragon = new Component(90,88,"images/Dragon.png", 640 +4698+500, 440,"image");
    }
    InitializeFireball();
    fireball = new Component (60,24,"images/Fireball.png",1280,485,"image");
    spawnFireball();
    fireballInterval = setInterval(spawnFireball, getRandomInterval());
    //Initialize Variables
    moveLeft = false;
    moveRight = false;
    falling = false;
    grounded = true;
    inPit = false;
    showLoseScreen = false;
    r=0; //Sword Animation Loop Variable

    //Load Game
    window.addEventListener('keydown', handleKeyStartGame);
    GameArea.start();

    
}

let GameArea = {
    canvas: document.createElement("canvas"),
    start: function(){
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(GameArea.interval);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "Game-Window";

        //Put the canvas underneath the Game title
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        let h1Element = document.querySelector("h1.Game-Title");
        h1Element.insertAdjacentElement("afterend",this.canvas);
    },
    clear: function(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
}

//Create Game Components

function Component(width,height,source,x,y,type){
    this.type = type;
    if(type === "image")
    {
        this.image = new Image();
        this.image.src = source;
    }
    else if(type === "player")
    {
        this.image = new Image();
        this.image.src = playerSprite;
    }
    else if(type === "sword")
    {
        this.image = new Image();
        this.image.src = swordSprite;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.scaleX = 1;
    this.update = function(){
        let ctx = GameArea.context;
        ctx.save();

        if(this.scaleX === -1)
        {
            ctx.translate(this.x+this.width+player.x,0);
            ctx.scale(-1,1);
        }

        //Images and Animated Images
        if(type === "image")
        {
            ctx.drawImage(this.image, this.x, this.y, this.width,this.height);
        }
        else if(type === "player")
        {
            this.image.src = playerSprite;
            ctx.drawImage(this.image, this.x, this.y, this.width,this.height);
        }
        else if(type === "sword")
        {
            this.image.src = swordSprite;
            ctx.drawImage(this.image, this.x, this.y, this.width,this.height);
        }
        else{
            ctx.fillStyle = source;
            ctx.fillRect(this.x, this.y, this.width,this.height)
        }

        ctx.restore();
    }

}
function updateGameArea(){
    GameArea.clear();
    console.log(spike1.x);
    //Initialize Movement Variables
    let gravity = 2;
    //Player Movement

    //Player Running
    if(!swordAttackActive)
    {
        if(moveRight)
        {
            player.scaleX = 1;
            if(player.x !== 1230)
            {
                if(level === 1)
                {
                    if(level1Ground.x>-1000)
                    {
                        if(player.x<640)
                        {
                            player.x +=movementSpeed
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                    else{
                        if(level1Ground.x<-3360)
                        {
                            player.x += movementSpeed;
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                }
                else if(level === 2)
                {
                    if(level2Ground.x>-1000)
                    {
                        if(player.x<640)
                        {
                            player.x +=movementSpeed
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                    else{
                        if(level2Ground.x<-3360)
                        {
                            player.x += movementSpeed;
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                } 
                else if(level === 3)
                {
                    if(level3Ground.x>-1000)
                    {
                        if(player.x<640)
                        {
                            player.x +=movementSpeed
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                    else{
                        if(level3Ground.x<-4705)
                        {
                            player.x += movementSpeed;
                        }
                        else{
                            moveGroundRight();
                        }
                    }
                }   
            }
        }
        if(moveLeft)
        {
            if(player.x !== -15)
            {
                player.scaleX = -1;
                if(level === 1)
                {
                    if(level1Ground.x<-1000)
                    {
                        if(player.x<640)
                        {
                            moveGroundLeft();
                        }
                        else{
                            player.x -= movementSpeed;
                        }
                    }
                    else{
                        if(level1Ground.x===0)
                        {
                            player.x -= movementSpeed;
                        }
                        else{
                            moveGroundLeft();
                        }
                    }
                }  
                else if(level === 2)
                {
                    if(level2Ground.x<-1000)
                    {
                        if(player.x<640)
                        {
                            moveGroundLeft();
                        }
                        else{
                            player.x -= movementSpeed;
                        }
                    }
                    else{
                        if(level2Ground.x===0)
                        {
                            player.x -= movementSpeed;
                        }
                        else{
                            moveGroundLeft();
                        }
                    }
                }   
                else if(level === 3)
                {
                    if(level3Ground.x<-1000)
                    {
                        if(player.x<640)
                        {
                            moveGroundLeft();
                        }
                        else{
                            player.x -= movementSpeed;
                        }
                    }
                    else{
                        if(level3Ground.x===0)
                        {
                            player.x -= movementSpeed;
                        }
                        else{
                            moveGroundLeft();
                        }
                    }
                }   
            }
        }
    }

    //Jumping
    
    if(player.y < currentY-jumpHeight && onGroundHeight === false)
    {
        jumping = false;
    }

    if(onGroundHeight === false || grounded === false)
    {
        if(showLoseScreen === false)
        {
            player.y += gravity*time;
            time += .1;
        }

        if(player.y>920)
        {
            showLoseScreen = true;
            time = 0;
            player.y = 440;
        }

        if(player.y >= currentY && grounded && inPit === false)
        {
            player.y = currentY;
            onGroundHeight = true;
            time = 1;
        }
    }

    if(jumping === true)
    {
        player.y -= jumpSpeed;
        onGroundHeight = false;
    }

    //See if player is grounded
    if(player.y-3 < currentY)
    {
        inPit = false;
    }
    else{
        falling = true;
        inPit = true;
    }

    //X coordinates for holes and spikes
    if(level === 1)
    {
        //Level 1 holes
        if(level1Ground.x <= -60 && level1Ground.x >= -130)
        {
            grounded = false;
            xMaxCollision = -65;
            xMinCollision = -125;
        }
        else if (level1Ground.x <= -1130 && level1Ground.x >= -1195)
        {
            grounded = false;
            xMaxCollision = -1135;
            xMinCollision = -1190;
        }
        else if (level1Ground.x <= -1715 && level1Ground.x >= -1805)
        {
            grounded = false;
            xMaxCollision = -1720;
            xMinCollision = -1800;
        }
        else if (level1Ground.x <= -2345 && level1Ground.x >= -2420)
        {
            grounded = false;
            xMaxCollision = -2350;
            xMinCollision = -2415;
        }
        else{
            grounded = true;
        }
        
        //Level 1 spikes
        if((spike1.x >= 570 && spike1.x <= 680) || (spike2.x >= 570 && spike2.x <= 680) || (spike3.x >= 570 && spike3.x <= 680))
        {
            if(player.y > currentY-3 && player.y > 418)
            {
                showLoseScreen = true;
            }
        }
        
    }
    else if(level === 2)
    {
        //Level 2 holes
        if (level2Ground.x <= -115 && level2Ground.x >= -175)
        {
            grounded = false;
            xMaxCollision = -120;
            xMinCollision = -170;
        }
        else if (level2Ground.x <= -1035 && level2Ground.x >= -1100)
        {
            grounded = false;
            xMaxCollision = -1040;
            xMinCollision = -1095;
        }
        else if (level2Ground.x <= -1835 && level2Ground.x >= -1930)
        {
            grounded = false;
            xMaxCollision = -1840;
            xMinCollision = -1925;
        }
        else if (level2Ground.x <= -2165 && level2Ground.x >= -2265)
        {
            grounded = false;
            xMaxCollision = -2170;
            xMinCollision = -2260;
        }
        else if (level2Ground.x <= -2845 && level2Ground.x >= -2910)
        {
            grounded = false;
            xMaxCollision = -2850;
            xMinCollision = -2905;
        }
        else {
            grounded = true;
        }

        //Level 2 spikes
        if((spike1.x >= 570 && spike1.x <= 680) || (spike2.x >= 570 && spike2.x <= 680) || (spike3.x >= 570 && spike3.x <= 680) || (spike4.x >= 570 && spike4.x <= 680))
        {
            if(player.y > currentY-3 && player.y > 418)
            {
                showLoseScreen = true;
            }
        }
        
    }
    else if(level === 3)
    {
        //Level 3 holes
        if (level3Ground.x <= -650 && level3Ground.x >= -740)
        {
            grounded = false;
            xMaxCollision = -655;
            xMinCollision = -735;
        }
        else if (level3Ground.x <= -1175 && level3Ground.x >= -1265)
        {
            grounded = false;
            xMaxCollision = -1180;
            xMinCollision = -1260;
        }
        else if (level3Ground.x <= -1605 && level3Ground.x >= -1700)
        {
            grounded = false;
            xMaxCollision = -1610;
            xMinCollision = -1695;
        }
        else if (level3Ground.x <= -2040 && level3Ground.x >= -2160)
        {
            grounded = false;
            xMaxCollision = -2045;
            xMinCollision = -2155;
        }
        else if (level3Ground.x <= -2670 && level3Ground.x >= -2775)
        {
            grounded = false;
            xMaxCollision = -2675;
            xMinCollision = -2770;
        }
        else if (level3Ground.x <= -3310 && level3Ground.x >= -3425)
        {
            grounded = false;
            xMaxCollision = -3315;
            xMinCollision = -3420;
        }
        else if (level3Ground.x <= -3875 && level3Ground.x >= -3940)
        {
            grounded = false;
            xMaxCollision = -3880;
            xMinCollision = -3935;
        }
        else if (level3Ground.x <= -4520 && level3Ground.x >= -450)
        {
            grounded = false;
            xMaxCollision = -4525;
            xMinCollision = -4585;
        }

        else {
            grounded = true;
        }

        //Level 3 spikes
        if((spike1.x >= 570 && spike1.x <= 680) || (spike2.x >= 570 && spike2.x <= 680) || (spike3.x >= 570 && spike3.x <= 680) || (spike4.x >= 570 && spike4.x <= 680) || (spike5.x >= 570 && spike5.x <= 680) || (spike6.x >= 570 && spike6.x <= 680))
        {
            if(player.y > currentY-3 && player.y > 418)
            {
                showLoseScreen = true;
            }
        }
    }

    //Stop player from falling through ground
    if(grounded && (player.y-3 > currentY))
    {
        player.y =currentY;
        falling = false;
        onGroundHeight = true;
        time = 1;
    }

    //Move Fireball

    if(fireballActive)
    {
        fireball.x-=fireballSpeed;
        let FireballCollisionMax = player.x+30;
        let FireballCollisionMin = player.x-70;

        if(player.y>389.2 && fireball.x > FireballCollisionMin && fireball.x < FireballCollisionMax && inPit === false)
        {
            showLoseScreen = true;
            fireballActive = false;
            fireball.x = 1280;
        }

    }

    //Activate Sword Attack
    if(player.x === 1085)
    {
        swordAttackActive = true;
    }
    else{
        swordAttackActive = false;
    }
    //Update Game Objects
    background.update();
    if(level === 1)
    {
        level1Ground.update();
        spike1.update();
        spike2.update();
        spike3.update();
    }
    else if(level === 2)
    {
        level2Ground.update();
        spike1.update();
        spike2.update();
        spike3.update();
        spike4.update();
    }
    else if(level === 3)
    {
        level3Ground.update();
        spike1.update();
        spike2.update();
        spike3.update();
        spike4.update();
        spike5.update();
        spike6.update();
    }
    
    dragon.update();
    fireball.update();

    player.update();
    if(swordAttackActive)
    {
        sword.update();
    }

    if(showLoseScreen)
    {
        gameOverCanvas.update();
    }
    if(changeLevel)
    {
        levelCompleteCanvas.update();
    }
    if(gameComplete)
    {
        gameCompleteCanvas.update();
    }
    if(startPressed === false)
    {
        mainMenuCanvas.update()
    }
    //Game Context
    let ctx = GameArea.context;

    if(!swordAttackActive)
    {
        AnimateMovement();
    }
    else{
        AnimateAttack();
    }

    //Play the dragon's death
    if(dragonDeath)
    {
        dragon.y +=10;
        if(dragon.y>720)
        {
            nextLevel();
            dragon.y = 440;
            dragonDeath = false;
        }
    }
}

function moveGroundLeft()
{
    if(grounded === false && player.y-3>currentY)
    {
        if(level === 1)
        {
            if(level1Ground.x <= xMaxCollision)
            {
                level1Ground.x += movementSpeed;
                spike1.x += movementSpeed;
                spike2.x += movementSpeed;
                spike3.x += movementSpeed;
                dragon.x+=movementSpeed;
                fireball.x+=movementSpeed;
            }
        }
        else if(level === 2)
        {
            if(level2Ground.x <= xMaxCollision)
            {
                level2Ground.x += movementSpeed;
                spike1.x += movementSpeed;
                spike2.x += movementSpeed;
                spike3.x += movementSpeed;
                spike4.x += movementSpeed;
                dragon.x+=movementSpeed;
                fireball.x+=movementSpeed;
            }
        }
        else if(level === 3)
        {
            if(level3Ground.x <= xMaxCollision)
            {
                level3Ground.x += movementSpeed;
                spike1.x += movementSpeed;
                spike2.x += movementSpeed;
                spike3.x += movementSpeed;
                spike4.x += movementSpeed;
                spike5.x += movementSpeed;
                spike6.x += movementSpeed;
                dragon.x+=movementSpeed;
                fireball.x+=movementSpeed;
            }
        }
    }
    else{
        if(level === 1)
        {
            level1Ground.x += movementSpeed;
            spike1.x += movementSpeed;
            spike2.x += movementSpeed;
            spike3.x += movementSpeed;
            dragon.x+=movementSpeed;
            fireball.x+=movementSpeed;
        }
        else if(level === 2)
        {
            level2Ground.x += movementSpeed;
            spike1.x += movementSpeed;
            spike2.x += movementSpeed;
            spike3.x += movementSpeed;
            spike4.x += movementSpeed;
            dragon.x+=movementSpeed;
            fireball.x+=movementSpeed;
        }
        else if(level === 3)
        {
            level3Ground.x += movementSpeed;
            spike1.x += movementSpeed;
            spike2.x += movementSpeed;
            spike3.x += movementSpeed;
            spike4.x += movementSpeed;
            spike5.x += movementSpeed;
            spike6.x += movementSpeed;
            dragon.x+=movementSpeed;
            fireball.x+=movementSpeed;
        }
    }
}

function moveGroundRight()
{
    if(grounded === false && player.y-3>currentY)
    {
        if(level === 1)
        {
            if(level1Ground.x >= xMinCollision)
            {
                level1Ground.x -= movementSpeed;
                spike1.x -= movementSpeed;
                spike2.x -= movementSpeed;
                spike3.x -= movementSpeed;
                dragon.x-=movementSpeed;
                fireball.x-=movementSpeed;
            }
        }   
        else if(level === 2)
        {
            if(level2Ground.x >= xMinCollision)
            {
                level2Ground.x -= movementSpeed;
                spike1.x -= movementSpeed;
                spike2.x -= movementSpeed;
                spike3.x -= movementSpeed;
                spike4.x -= movementSpeed;
                dragon.x-=movementSpeed;
                fireball.x-=movementSpeed;
            }
        } 
        else if(level === 3)
        {
            if(level3Ground.x >= xMinCollision)
            {
                level3Ground.x -= movementSpeed;
                spike1.x -= movementSpeed;
                spike2.x -= movementSpeed;
                spike3.x -= movementSpeed;
                spike4.x -= movementSpeed;
                spike5.x -= movementSpeed;
                spike6.x -= movementSpeed;
                dragon.x-=movementSpeed;
                fireball.x-=movementSpeed;
            }
        } 
    }
    else{
        if(level === 1)
        {
            level1Ground.x -= movementSpeed;
            spike1.x -= movementSpeed;
            spike2.x -= movementSpeed;
            spike3.x -= movementSpeed;
            dragon.x-=movementSpeed;
            fireball.x-=movementSpeed;
        }
        else if(level === 2)
        {
            level2Ground.x -= movementSpeed;
            spike1.x -= movementSpeed;
            spike2.x -= movementSpeed;
            spike3.x -= movementSpeed;
            spike4.x -= movementSpeed;
            dragon.x-=movementSpeed;
            fireball.x-=movementSpeed;
        }
        else if(level === 3)
        {
            level3Ground.x -= movementSpeed;
            spike1.x -= movementSpeed;
            spike2.x -= movementSpeed;
            spike3.x -= movementSpeed;
            spike4.x -= movementSpeed;
            spike5.x -= movementSpeed;
            spike6.x -= movementSpeed;
            dragon.x-=movementSpeed;
            fireball.x-=movementSpeed;
        }
    }

}

function nextLevel()
{
    if(level !== 3)
    {
        player.x = 640;
        level++;
        startGame();
        changeLevel = true;
    }
    else{
        gameComplete = true;
    }
}

function handleKeyMoveOn(event)
{
    let key = event.keyCode;

    if(!changeLevel)
    {
        if(key === 37)
        {
            moveLeft = true;
        }
        else if(key === 39)
        {
            moveRight = true;
        }
    }
}

function handleKeyMoveOff(event)
{
    let key = event.keyCode;

    if(!changeLevel)
    {
        if(key === 37)
        {
            moveLeft = false;
        }
        else if(key === 39)
        {
            moveRight = false;
        }
    }
}

function handleKeyJumping(event)
{
    let key = event.keyCode;
    if(!changeLevel){
        if(key === 32 && !jumping && onGroundHeight && grounded){
            currentY = player.y;
            jumping = true;
        }
        
    }
    else{
        changeLevel = false;
    }
}
function handleKeyStartGame(event){
    let key = event.keyCode;

    if(key === 80){
        if(startPressed === false)
        {
            startPressed = true;
            window.addEventListener('keydown', handleKeyMoveOn);
            window.addEventListener('keydown', handleRestartGame);
            window.addEventListener('keyup', handleKeyMoveOff);
            window.addEventListener('keydown', handleKeyJumping);

        }
    }
}

function handleRestartGame(event){
    let key = event.keyCode;
    if(key === 82 && showLoseScreen)
    {
        startGame();
    }
}

//Animation variables
let i = 0;
let r = 0;
let waitTime = 2;

function AnimateMovement()
{
    if(jumping)
    {
        playerSprite = playerJumpSprite.src;
    }
    else if(falling)
    {
        playerSprite = playerFallSprite.src;
    }
    else if(moveLeft || moveRight)
    {
        playerSprite = playerMovementSprites[i].src;
        if(waitTime === 0)
        {
            playerSprite = playerMovementSprites[i % playerMovementSprites.length].src;
            i = (i+1)% playerMovementSprites.length;
            waitTime=2;

        }
        else{
            waitTime --;
        }
        
    }
    else{
        playerSprite = "images/PlayerMovement/PlayerMovement.0003.png"
    }
}

function AnimateAttack()
{
    player.x = 1085
    player.y = 440;

    if(waitTime === 0)
    {
        if(r===3)
        {
            dragonDeath = true;
        }
        else{
            r++;
        }
        playerSprite = playerAttackSprites[r].src;
        swordSprite = swordAttackSprites[r].src;

        waitTime=2;
    }
    else{
        waitTime--;
    }
}
function spawnFireball()
{
    if(fireball.x<0 || fireballActive === false)
    {
        if(dragon.x > 1270)
        {
            fireball.x = player.x+700;
        }
        else{
            fireball.x = dragon.x;
        }
    }
}

function InitializeFireball()
{
    fireballActive = true;
    if(level === 1)
    {
        fireballSpeed = 10;
    }
    else if(level === 2)
    {
        fireballSpeed = 11;
    }
    else if(level === 3)
    {
        fireballSpeed = 12;
    }
    clearInterval(fireballInterval);
}

function getRandomInterval()
{
    // Random interval between 5 to 6 seconds
    return Math.floor(Math.random() * (6000 -5000 + 1) +5000)
}