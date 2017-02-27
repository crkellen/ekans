function classFood(number) {
	this.foodNumber =	number; //Position in the array
	this.foodX =	0;
	this.foodY =	0;
	this.isAlive =	0;
}

//FUNCTIONS
classFood.prototype.ChangeState = function() {
	this.isAlive++;
	if (this.isAlive > 1) {
		isAlive = 0;
	}
}

classFood.prototype.DropCoordinates = function(newX, newY) {
	this.foodX = newX;
	this.foodY = newY;
}