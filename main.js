//### START OF GLOBAL VARIABLES
var CANVAS_GAME_ID			= "canvasGame";
var WORLD_HEIGHT			= 720;
var WORLD_WIDTH				= 1280;
var OK_MIN_SCREEN_RATIO		= 1.33;  
var OK_MAX_SCREEN_RATIO		= 1.35;
var MAX_BODIES				= 10;
//### END OF GLOBAL VARIABLES

var Game = {
	isInitialized:		0,
	gameCanvas:			null,
	ctx:				null,
	gameHeight:			WORLD_HEIGHT,
	gameWidth:			WORLD_WIDTH,
	
	map:	[], //Map is generated in Init() according to mapHeight and mapWidth.
			//0, 1, 2 --- Empty, Player, Snake
	mapX:		0,
	mapY:		0,
	mapHeight:	30, //Map height in squares (one square is 32*32 pixels).
	mapWidth:	40, //Map width in squares. If you change mapHeight or mapWidth, make sure to change WORLD_HEIGHT and WORLD_WIDTH respectively as well.
	
	playerX:	0,
	playerY:	0, //Player starts in top left
	headX:		7,
	headY:		9, //Snake head starts in bottom right
	bodies:		[],
	gameTimer:	null,
	movInput:	0,
	snakeAIFlag:0,
	
//### START OF GAME OBJECT FUNCTIONS
	Init: function() {
		Game.gameCanvas = document.getElementById(CANVAS_GAME_ID);
		Game.ctx = Game.gameCanvas.getContext("2d");
		//Map initialisation
		for (i = 0; i < Game.mapHeight; i++) { //Create as many rows as is the map's height
			Game.map.push([]);
			
			for (j = 0; j < Game.mapWidth; j++) { //Inside each row, create as many empty squares as is the map's width
				Game.map[i].push(0);
			}
		}
		//Player initialisation
		Game.map[Game.playerY][Game.playerX] = 1;
		
		//Snake Init
		for( var m = 0; m < MAX_BODIES; m++ ) {
			if( m == 0 ) {
				Game.bodies[m] = new Body(m, Game.headX, Game.headY);
			} else {
				Game.bodies[m] = new Body(m, Game.bodies[m-1].x-1, Game.bodies[m-1].y);
			}
		}
		Game.bodies[0].isAlive = 1;
		Game.bodies[1].isAlive = 1;
		Game.bodies[2].isAlive = 1;
		Game.map[Game.bodies[0].y][Game.bodies[0].x] = 2;
		Game.map[Game.bodies[1].y][Game.bodies[1].x] = 2;
		Game.map[Game.bodies[2].y][Game.bodies[2].x] = 2;
		
		Game.isInitialized = 1;
	},
	
	DrawScreen: function() {
		Game.ctx.fillStyle	= "#FFF";
        	Game.ctx.fillRect(0, 0, Game.gameWidth, Game.gameHeight);
		for( var i = 0; i < Game.mapHeight; i++ ) {
			for( var j = 0; j < Game.mapWidth; j++ ) {
				//BACKGROUND
				if( Game.map[i][j] === 0 ) {
					Game.ctx.fillStyle = "#000";
					Game.ctx.fillRect(Game.mapX, Game.mapY, 32, 32);
				}
				//PLAYER
				if( Game.map[i][j] === 1 ) {
					Game.ctx.fillStyle = "#FF00FF";
					Game.ctx.fillRect(Game.playerX + Game.mapX-j, Game.playerY + Game.mapY-i, 32, 32);
				}
				//BODIES
				if( Game.map[i][j] === 2 ) {
					Game.ctx.fillStyle = "#00FFFF";
					Game.ctx.fillRect(Game.mapX, Game.mapY, 32, 32);
				}
				
				Game.mapX += 32;
			}
			Game.mapX = 0;
			Game.mapY += 32;
		}
		Game.mapX = 0;
		Game.mapY = 0;
	},
	
	ProcessInputDown: function(event) {
		switch( event.keyCode ) {
		//MOVEMENT
			//W -- Up
			case 87:
				Game.movInput = 0;
				break;
			//A -- Left
			case 65:
				Game.movInput = 1;
				break;
			//S -- Down
			case 83:
				Game.movInput = 2;
				break;
			//D -- Right
			case 68:
				Game.movInput = 3;
				break;
			default: break;
		}
	},
	
	BoundsCheck: function(dir) {
		//If there is a bounds error, undo the movement
		if( dir === 0 ) { 	//Bounds check Y
			if( Game.playerY < 0 ) {
				Game.playerY = 0;
			} else if( Game.playerY > Game.mapHeight-1) { //If player is trying to move out of bounds (vertically), stop it
				Game.playerY = Game.mapHeight-1;
			}
		} else {			//Bounds check X
			if( Game.playerX < 0 ) {
				Game.playerX = 0;
			} else if( Game.playerX > Game.mapWidth-1 ) { //If player is trying to move out of bounds (horizontally), stop it
				Game.playerX = Game.mapWidth-1;
			}
		}
	},
	
	CollisionCheck: function(dir) {
		//If there is a collision, undo the movement
		switch( dir ) {
			case 0: //Above
				if( Game.map[Game.playerY][Game.playerX] === 2 ) {
					Game.playerY += 1;
				}
				break;
			case 1: //Below
				if( Game.map[Game.playerY][Game.playerX] === 2 ) {
					Game.playerY -= 1;
				}
				break;
			case 2: //Left
				if( Game.map[Game.playerY][Game.playerX] === 2 ) {
					Game.playerX += 1;
				}
				break;
			case 3: //Right
				if( Game.map[Game.playerY][Game.playerX] === 2 ) {
					Game.playerX -= 1;		
				}
				break;
			default: console.log("ERROR: CollisionCheck - dir out of range"); break;
		}
	},
	
	SnakeCollisionCheck: function(dir) {
		//If there is a collision, undo the movement
		switch( dir ) {
			case 0: //Above
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headY += 1;
				}
				break;
			case 1: //Below
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headY -= 1;
				}
				break;
			case 2: //Left
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headX += 1;
				}
				break;
			case 3: //Right
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headX -= 1;		
				}
				break;
			default: console.log("ERROR: CollisionCheck - dir out of range"); break;
		}
	},
	
	MoveActors: function() {
		//PLAYER MOVEMENT
		switch( Game.movInput ) {
			//W -- Up
			case 0:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerY -= 1;
				Game.BoundsCheck(0);
				Game.CollisionCheck(0);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//A -- Left
			case 1:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerX -= 1;
				Game.BoundsCheck(1);
				Game.CollisionCheck(2);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//S -- Down
			case 2:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerY += 1;
				Game.BoundsCheck(0);
				Game.CollisionCheck(1);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//D -- Right
			case 3:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerX += 1;
				Game.BoundsCheck(1);
				Game.CollisionCheck(3);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			default: console.log("ERROR: MoveActors - movInput Out of Bounds"); break;
		}
		//HEAD MOVEMENT
		if( Game.snakeAIFlag === 0 ) { 				//Search X First
			if( Game.playerX > Game.headX ) {			//Player is to the right
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX += 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(3);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerX < Game.headX ) {	//Player is to the left
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX -= 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(2);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerY > Game.headY ) {	//Player is above
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY += 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(0);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerY < Game.headY ) {	//Player is below
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY -= 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(1);
				Game.map[Game.headY][Game.headX] = 2;
			}
		} else {									//Search Y First
			if( Game.playerY > Game.headY ) {			//Player is above
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY += 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(0);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerY < Game.headY ) {	//Player is below
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY -= 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(1);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerX > Game.headX ) {	//Player is to the right
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX += 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(3);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.playerX < Game.headX ) {	//Player is to the left
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX -= 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(2);
				Game.map[Game.headY][Game.headX] = 2;
			}
		}
		
		//BODY MOVEMENT
		for( var i=0; i < Game.bodies.length; i++ ) {
			if( Game.bodies[i].isAlive === 1 ) {
				Game.bodies[i].move();
			}
		}
	},
	
	Update: function() {
		//Set Gamespeed
		if( Game.gameTimer == null ) {
			Game.gameTimer = setInterval(Game.MoveActors, 500);
		}
		
		Game.DrawScreen();
	}
//### END OF GAME OBJECT FUNCTIONS
};

//### START OF GLOBAL FUNCTIONS
//EVENT HANDLERS
window.addEventListener("resize", doResize, false);
window.addEventListener("keydown", doKeydown, false);

function doResize() {
	var canvas1 = document.getElementById(CANVAS_GAME_ID);
	
	// Size things
	UpdateCanvas(canvas1);

	if ( Game.isInitialized != 0 ) {
		Game.Update();
	}
};

function UpdateCanvas(canvas) {
    var tempDisplay = canvas.style.display;
    canvas.style.display = "block";
   
	canvas.width = WORLD_WIDTH;   // World Coordinate system size should NOT change
	canvas.height = WORLD_HEIGHT; // just the viewing size of it (i.e. style)
	
    var rect = canvas.getBoundingClientRect();

	var gameWidth = window.innerWidth;
	var gameHeight = window.innerHeight - rect.top; 
	var scaleToFitX = gameWidth / canvas.width;  
	var scaleToFitY = gameHeight / canvas.height;

	var currentScreenRatio = gameWidth / gameHeight;
	var optimalRatio = Math.min(scaleToFitX, scaleToFitY);

	canvas.style.position = "fixed";
	
	if ( currentScreenRatio >= OK_MIN_SCREEN_RATIO && currentScreenRatio <= OK_MAX_SCREEN_RATIO ) {
		canvas.style.width = gameWidth + "px";
		canvas.style.height = gameHeight + "px";
		canvas.style.left = 0 + "px";
	} else {
		canvas.style.width = canvas.width * optimalRatio + "px";
		canvas.style.height = canvas.height * optimalRatio + "px";
		canvas.style.left = ( (gameWidth - (canvas.width * optimalRatio)) / 2 ) + "px";

	}
    
    canvas.style.display = tempDisplay;
};

function doKeydown(e) {
	if( Game.isInitialized === 1 ) {
		Game.ProcessInputDown(e);
	} else {
		return;
	}
};

window.onload = function() {
	Game.Init();
	doResize();
	// Start Game Loop
	runGame();
};

function runGame() {
	if( Game.isInitialized === 1 ) {
		Game.Update();
	}
	requestAnimationFrame(runGame);
};
//### END OF GLOBAL FUNCTIONS
