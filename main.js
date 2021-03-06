/*
TODO:
1. Make it so the snake has a list of food dropped and he goes to them until there is no food left.
	- Make a food class (to store x and y position, and is alive)
	- Max amount of food on board
	- Init the array in init
	- foodX and foodY will likely be removed entirely and reworked with a check to the list
2. Make it so rations can spawn in first row and column.
	- The issue is some sort of infinite loop issue with Math.random
3. Add UI
	- Display Score
	- Display Food Held
	- Display Gamespeed
4. Make snake also have bounds limits
	- currently if player reaches top or bottom, because of how movement works, it breaks.
5. Fix snake collapsing in on itself, make it so it can't do that.
6. Perhaps make it so if snake eats food, he pauses for one tick (allows the player to gain distance)
7. Make player die if he collides with snake
8. Make start screen/instructions
9. Make gameover screen with restart
*/

//### START OF GLOBAL VARIABLES
var CANVAS_GAME_ID			= "canvasGame";
var WORLD_HEIGHT			= 960;  //Should be divisible by 32
var WORLD_WIDTH				= 1280; //Should be divisible by 32
var OK_MIN_SCREEN_RATIO		= 1.33;  
var OK_MAX_SCREEN_RATIO		= 1.35;
var MAX_BODIES				= 100;
var MAX_FOOD				= 10;
//### END OF GLOBAL VARIABLES

var Game = {
	isInitialized:		0,
	gameCanvas:			null,
	ctx:				null,
	gameHeight:			WORLD_HEIGHT,
	gameWidth:			WORLD_WIDTH,
	
	map:	[], //Map is generated in Init() according to mapHeight and mapWidth.
				//0, 1, 2, 3, 4 --- Empty, Player, Snake, Food, Ration
	mapX:		0, //Drawing variable
	mapY:		0, //Drawing variable
	mapHeight:	0, //Map height in squares (one square is 32*32 pixels).
	mapWidth:	0, //Map width in squares. 0 at first, will be calculated based on WORLD_HEIGHT and WORLD_WIDTH.
	
	playerX:	0,
	playerY:	0, //Player starts in top left
	headX:		0,
	headY:		0, //Snake head starts in bottom right, location is calculated inside Init() once the map size is initialised
	bodies:		[],
	food:		[],
	snakeTargets:	[],
	snakeSize:	2, //Snake starts at size 3
	gameTimer:	null,
	movInput:	0,
	snakeAIFlag:0,
	
	dropFood:	0, //Either 0 or 3, player replaces their position with dropFood
	foodFlag:	0, //Either 0 or 1, If food exists, foodFlag = 1
	foodX:		0,
	foodY:		0,
	foodHeld:	1, //Amount of food player currently has, player gets more food by picking up rations
	rationExists:	0, //Either 0 or 1, If ration exists, rationExists = 1
	
	gameSpeed:	0, //How often the game updates (this number is the index of gameSpeeds[], and that's where the game will get its update delay in milliseconds), defaults to slowest speed
	gameSpeeds:	[500, 350, 200, 100], //Different delays between game updates (in milliseconds), smaller number = faster game, numbers should be in decreasing order
	gameSpeedChangedFlag:	true, //A flag that's required for when the game's speed changes (when true, the game changes the update speed on the next Update() call)
	
//### START OF GAME OBJECT FUNCTIONS
	Init: function() {
		Game.gameCanvas = document.getElementById(CANVAS_GAME_ID);
		Game.ctx = Game.gameCanvas.getContext("2d");
		
		//Map Initialisation
		Game.mapHeight = (WORLD_HEIGHT / 32);
		Game.mapWidth = (WORLD_WIDTH / 32);
		
		for (i = 0; i < Game.mapHeight; i++) { //Create as many rows as is the map's height
			Game.map.push([]);
			
			for (j = 0; j < Game.mapWidth; j++) { //Inside each row, create as many empty squares as is the map's width
				Game.map[i].push(0);
			}
		}
		
		//Player initialisation
		Game.map[Game.playerY][Game.playerX] = 1;
		
		/*
			[
			[0,0,0,0,0,0,...0],
			[0,0,0,0,0,0,...0],
			...,
			[0,0,0,0,0,0,...0]
			]
		*/

		//Food Init
		for( let n = 0; n < MAX_FOOD; n++ ) {
			Game.food[n] = new Food(n, 0, 0);
		}
		
		//Snake Init
		Game.headX = Game.mapWidth - 1; //Snake starts at bottom right corner
		Game.headY = Game.mapHeight - 1;
		for( var m = 0; m < MAX_BODIES; m++ ) {
			if( m == 0 ) {
				Game.bodies[m] = new Body(m, Game.headX, Game.headY);
			} else {
				Game.bodies[m] = new Body(m, Game.bodies[m-1].x+1, Game.bodies[m-1].y);
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
				//FOOD
				if( Game.map[i][j] === 3 ) {
					Game.ctx.fillStyle = "#FF0000";
					Game.ctx.fillRect(Game.mapX, Game.mapY, 32, 32);
				}
				//RATIONS
				if( Game.map[i][j] === 4 ) {
					Game.ctx.fillStyle = "#5500FF";
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
			case 38: //Using switch-case fall-through we can have both WASD as well as the Arrow keys working (WASD codes above, Arrow key codes below)
				Game.movInput = 0;
				break;
			//A -- Left
			case 65:
			case 37:
				Game.movInput = 1;
				break;
			//S -- Down
			case 83:
			case 40:
				Game.movInput = 2;
				break;
			//D -- Right
			case 68:
			case 39:
				Game.movInput = 3;
				break;
			case 82: //R -- Changes the game speed
				Game.ChangeGameSpeed();
				break;
			case 70: //F -- Drops a food
				if( Game.foodHeld > 0 ) {
					Game.dropFood = 3; //3 is the map code for Food
					Game.foodFlag = 1;
					for( let i = 0; i < Game.food.length; i++ ) {
						if( Game.food[i].isAlive === 0 ) {
							Game.foodHeld--;
							Game.food[i].x = Game.playerX;
							Game.food[i].y = Game.playerY;
							Game.snakeTargets.push(Game.food[i])
							Game.food[i].isAlive = 1;
							Game.foodX = Game.snakeTargets[0].x;
							Game.foodY = Game.snakeTargets[0].y;
							return;
						}
					}
				}
				break;
			default: break;
		}
	},
	
	BoundsCheck: function(dir) {
		//If there is a bounds error, undo the movement
		if( dir === 0 ) { 	//Bounds check Y
			if( Game.playerY < 0 ) {
				Game.playerY = 0;
			} else if( Game.playerY > Game.mapHeight - 1) {
				Game.playerY = Game.mapHeight - 1;
			}
		} else {			//Bounds check X
			if( Game.playerX < 0 ) {
				Game.playerX = 0;
			} else if( Game.playerX > Game.mapWidth - 1) {
				Game.playerX = Game.mapWidth - 1;
			}
		}
	},
	
	CollisionCheck: function(dir) {
		//If there is a collision, undo the movement --- If map = 2
		//If there is a ration, add 1 to amount of food held --- If map = 4
		
		//Collision Check --- Snake
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
		
		//Ration Check
		if( Game.map[Game.playerY][Game.playerX] === 4 ) {
			Game.foodHeld++;
			Game.rationExists = 0;
		}
	},
	
	SnakeCollisionCheck: function(dir) {
		//If there is a collision: if player, undo the movement, if food, eat food
			//#OPTIMIZATION: Could move the food and ration checks to a separate function.
				//Switch statement is really only needed for the replacement collision.
				//However this entire thing is pretty temporary since we shouldn't undo the collision for anything but the walls
				//Which the snake can't path into anyway.
				//Although to implement the snake pausing for one movement after eating, the direction would be useful.
				//Still this could be in a new function with a switch statement for it.
				//This new function would just be called during movement
		switch( dir ) {
			case 0: //Above
			//PLAYER
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headY += 1;
					return;
				}
			//FOOD
				if( Game.map[Game.headY][Game.headX] === 3 ) {
					Game.snakeTargets.shift();
					if( Game.snakeTargets.length !== 0 ) {
						Game.foodX = Game.snakeTargets[0].x;
						Game.foodY = Game.snakeTargets[0].y;
					} else {
						Game.foodX = 0;
						Game.foodY = 0;
						Game.foodFlag = 0;
					}
					Game.GrowSnake();
					return;
				}
			//RATION
				if( Game.map[Game.headY][Game.headX] === 4 ) {
					Game.rationExists = 0;
					return;
				}
				break;
			case 1: //Below
			//PLAYER
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headY -= 1;
					return;
				}
			//FOOD
				if( Game.map[Game.headY][Game.headX] === 3 ) {
					Game.snakeTargets.shift();
					if( Game.snakeTargets.length !== 0 ) {
						Game.foodX = Game.snakeTargets[0].x;
						Game.foodY = Game.snakeTargets[0].y;
					} else {
						Game.foodX = 0;
						Game.foodY = 0;
						Game.foodFlag = 0;
					}
					Game.GrowSnake();
					return;
				}
			//RATION
				if( Game.map[Game.headY][Game.headX] === 4 ) {
					Game.rationExists = 0;
					return;
				}
				break;
			case 2: //Left
			//PLAYER
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headX += 1;
					return;
				}
			//FOOD
				if( Game.map[Game.headY][Game.headX] === 3 ) {
					Game.snakeTargets.shift();
					if( Game.snakeTargets.length !== 0 ) {
						Game.foodX = Game.snakeTargets[0].x;
						Game.foodY = Game.snakeTargets[0].y;
					} else {
						Game.foodX = 0;
						Game.foodY = 0;
						Game.foodFlag = 0;
					}
					Game.GrowSnake();
					return;
				}
			//RATION
				if( Game.map[Game.headY][Game.headX] === 4 ) {
					Game.rationExists = 0;
					return;
				}
				break;
			case 3: //Right
			//PLAYER
				if( Game.map[Game.headY][Game.headX] === 1 ) {
					Game.headX -= 1;
					return;					
				}
			//FOOD
				if( Game.map[Game.headY][Game.headX] === 3 ) {
					Game.snakeTargets.shift();
					if( Game.snakeTargets.length !== 0 ) {
						Game.foodX = Game.snakeTargets[0].x;
						Game.foodY = Game.snakeTargets[0].y;
					} else {
						Game.foodX = 0;
						Game.foodY = 0;
						Game.foodFlag = 0;
					}
					Game.GrowSnake();
					return;					
				}
			//RATION
				if( Game.map[Game.headY][Game.headX] === 4 ) {
					Game.rationExists = 0;
					return;
				}
				break;
			default: console.log("ERROR: CollisionCheck - dir out of range"); break;
		}
	},
	
	SpawnRation: function() {
		while( Game.rationExists === 0 ) {
			//#TODO: Fix this not spawning at first row and column
			var rX = Math.floor((Math.random() * Game.mapWidth) + 1);
			var rY = Math.floor((Math.random() * Game.mapHeight) + 1);
			if( Game.map[rY][rX] === 0 ) {
				Game.map[rY][rX] = 4;
				Game.rationExists = 1;
			}
		}
	},
	
	MoveActors: function() {
		//PLAYER MOVEMENT
		switch( Game.movInput ) {
			//W -- Up
			case 0:
				Game.map[Game.playerY][Game.playerX] = Game.dropFood;
				Game.playerY -= 1;
				Game.BoundsCheck(0);
				Game.CollisionCheck(0);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//A -- Left
			case 1:
				Game.map[Game.playerY][Game.playerX] = Game.dropFood;
				Game.playerX -= 1;
				Game.BoundsCheck(1);
				Game.CollisionCheck(2);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//S -- Down
			case 2:
				Game.map[Game.playerY][Game.playerX] = Game.dropFood;
				Game.playerY += 1;
				Game.BoundsCheck(0);
				Game.CollisionCheck(1);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//D -- Right
			case 3:
				Game.map[Game.playerY][Game.playerX] = Game.dropFood;
				Game.playerX += 1;
				Game.BoundsCheck(1);
				Game.CollisionCheck(3);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			default: console.log("ERROR: MoveActors - movInput Out of Bounds"); break;
		}
		Game.dropFood = 0;
		
		//HEAD MOVEMENT
		if( Game.foodFlag === 1 ) {
			Game.MoveSnakeHeadTowardsFood();
		} else {
			Game.MoveSnakeHeadTowardsPlayer();
		}
		
		//BODY MOVEMENT
		for( var i=0; i < Game.bodies.length; i++ ) {
			if( Game.bodies[i].isAlive === 1 ) {
				Game.bodies[i].move();
			}
		}

		//RATION EXISTS CHECK AND SPAWN
		if( Game.rationExists === 0 ) {
			Game.SpawnRation();
		}
	},
	
	MoveSnakeHeadTowardsPlayer: function() {
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
	},
	
	MoveSnakeHeadTowardsFood: function() {
		if( Game.snakeAIFlag === 0 ) { 				//Search X First
			if( Game.foodX > Game.headX ) {			//Player is to the right
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX += 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(3);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodX < Game.headX ) {	//Player is to the left
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX -= 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(2);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodY > Game.headY ) {	//Player is above
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY += 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(0);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodY < Game.headY ) {	//Player is below
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY -= 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(1);
				Game.map[Game.headY][Game.headX] = 2;
			}
		} else {									//Search Y First
			if( Game.foodY > Game.headY ) {			//Player is above
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY += 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(0);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodY < Game.headY ) {	//Player is below
				Game.map[Game.headY][Game.headX] = 0;
				Game.headY -= 1;
				Game.snakeAIFlag = 0;
				Game.SnakeCollisionCheck(1);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodX > Game.headX ) {	//Player is to the right
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX += 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(3);
				Game.map[Game.headY][Game.headX] = 2;
			} else if( Game.foodX < Game.headX ) {	//Player is to the left
				Game.map[Game.headY][Game.headX] = 0;
				Game.headX -= 1;
				Game.snakeAIFlag = 1;
				Game.SnakeCollisionCheck(2);
				Game.map[Game.headY][Game.headX] = 2;
			}
		}
	},
	
	GrowSnake: function() {
		Game.snakeSize++;
		Game.bodies[Game.snakeSize].x = Game.bodies[Game.snakeSize-1].x-1;
		Game.bodies[Game.snakeSize].y = Game.bodies[Game.snakeSize-1].y-1;
		Game.map[Game.bodies[Game.snakeSize].y][Game.bodies[Game.snakeSize].x] = 2;
		Game.bodies[Game.snakeSize].isAlive = 1;
	},
	
	ChangeGameSpeed: function() {
		if(Game.gameSpeed < (Game.gameSpeeds.length - 1)) { //If game is not at the fastest setting...
			Game.gameSpeed = Game.gameSpeed + 1; //then make it even faster.
			Game.gameSpeedChangedFlag = true;
		} else if (Game.gameSpeed == (Game.gameSpeeds.length - 1)) { //If game is at the fastest setting...
			Game.gameSpeed = 0; //then revert back to the slowest setting.
			Game.gameSpeedChangedFlag = true;
		} else {
			console.log("ERROR: ChangeGameSpeed() - Game.gameSpeed out of bounds.");
		}
		//#TODO: Remove debugs
		console.log("DEBUG: Game speed is " + Game.gameSpeed);
	},
	
	Update: function() {
		//SET GAMESPEED
		if (Game.gameSpeedChangedFlag) {
			clearInterval(Game.gameTimer);
			Game.gameTimer = setInterval(Game.MoveActors, Game.gameSpeeds[Game.gameSpeed]); //Have the game update according to Game.gameSpeeds[Game.gameSpeed] AKA the current speed setting
			Game.gameSpeedChangedFlag = false;
		}
		
		//UPDATE SCREEN
		Game.DrawScreen();
	}
//### END OF GAME OBJECT FUNCTIONS
};

//### START OF GLOBAL FUNCTIONS

function doResize() {
	var canvas = document.getElementById(CANVAS_GAME_ID);
	
	// Size things
	UpdateCanvas(canvas);

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
	//EVENT HANDLERS
	window.addEventListener("resize", doResize, false);
	window.addEventListener("keydown", doKeydown, false);
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
