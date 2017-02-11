function Body(id, x, y) {
	this.id		= id; //Position in Array
	this.x		= x;
	this.y		= y;
	this.prevX = this.x;
	this.prevY = this.y;
	
	this.isAlive = 0; //Start Dead
};

//FUNCTIONS
Body.prototype.drawSelf = function(ctx) {
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(this.x-16, this.y-16, 32, 32);
};

Body.prototype.spawn = function() {
	
};

Body.prototype.move = function() {
	this.prevX = this.x;
	this.prevY = this.y;
	if( this.id == 0 ) {
		this.x = Game.headX;
		this.y = Game.headY;
	} else {
		Game.map[this.y][this.x] = 0;
		this.x = Game.bodies[this.id-1].prevX;
		this.y = Game.bodies[this.id-1].prevY;
		Game.map[this.y][this.x] = 2;
	}
};

Body.prototype.isColliding = function(x, y, object) {
	if( object === "player" ) {
		return !( x+32 < this.x || this.x+32 < x || y+32 < this.y || this.y+32 < y);
	}
};