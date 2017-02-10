//### START OF GLOBAL VARIABLES
var CANVAS_GAME_ID			= "canvasGame";
var WORLD_HEIGHT			= 720;
var WORLD_WIDTH				= 1280;
var OK_MIN_SCREEN_RATIO		= 1.33;  
var OK_MAX_SCREEN_RATIO		= 1.35;
//### END OF GLOBAL VARIABLES

var Game = {
	isInitialized:		0,
	gameCanvas:			null,
	ctx:				null,
	gameHeight:			WORLD_HEIGHT,
	gameWidth:			WORLD_WIDTH,
	
	map:	//Map is size 10
	[		//We will limit each array to size 10
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0]
	],		//0, 1, 2 --- Empty, Player, Snake
	mapX:	0,
	mapY:	0,
	
	playerX:	0,
	playerY:	0, //Player starts in top left
	headX:		9,
	headY:		9, //Snake head starts in bottom right
	
//### START OF GAME OBJECT FUNCTIONS
	Init: function() {
		Game.gameCanvas = document.getElementById(CANVAS_GAME_ID);
		Game.ctx = Game.gameCanvas.getContext("2d");
		
		Game.map[Game.playerY][Game.playerX] = 1;
		
		Game.isInitialized = 1;
	},
	
	DrawScreen: function() {
		Game.ctx.fillStyle	= "#FFF";
        Game.ctx.fillRect(0, 0, Game.gameWidth, Game.gameHeight);
		for( var i = 0; i < 10; i++ ) {
			for( var j = 0; j < 10; j++ ) {
				if( Game.map[i][j] === 0 ) {
					this.ctx.fillStyle = "#000";
					Game.ctx.fillRect(Game.mapX, Game.mapY, 32, 32);
				}
				if( Game.map[i][j] === 1 ) {
					Game.ctx.fillStyle = "#FF00FF";
					Game.ctx.fillRect(Game.playerX + Game.mapX-j, Game.playerY + Game.mapY-i, 32, 32);
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
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerY -= 1;
				Game.BoundsCheck(0);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//A -- Left
			case 65:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerX -= 1;
				Game.BoundsCheck(1);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//S -- Down
			case 83:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerY += 1;
				Game.BoundsCheck(0);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			//D -- Right
			case 68:
				Game.map[Game.playerY][Game.playerX] = 0;
				Game.playerX += 1;
				Game.BoundsCheck(1);
				Game.map[Game.playerY][Game.playerX] = 1;
				break;
			default: break;
		}
	},
	
	BoundsCheck: function(dir) {
		if( dir === 0 ) { 	//Bounds check Y
			if( Game.playerY < 0 ) {
				Game.playerY = 0;
			} else if( Game.playerY > 9 ) {
				Game.playerY = 9;
			}
		} else {			//Bounds check X
			if( Game.playerX < 0 ) {
				Game.playerX = 0;
			} else if( Game.playerX > 9 ) {
				Game.playerX = 9;
			}
		}
	},
	
	Update: function() {
		
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