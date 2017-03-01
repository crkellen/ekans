function Body(id, x, y) {
	this.id		= id; //Position in Array
	this.x		= x;
	this.y		= y;
	this.prevX = this.x;
	this.prevY = this.y;
	
	this.isAlive = 0; //Start Dead
};

//FUNCTIONS
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