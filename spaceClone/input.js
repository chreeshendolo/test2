console.log( "input.js is up!" );

var Input = function() {
	this.mouseState = {
		left: {
			down: false,
			pos: { x: 0, y: 0 }
		}
	};
	
	this.keyState = {};
	
	this.AImouseState = {
		left: {
			down: false,
			pos: { x: 0, y: 0 }
		}
	};
	
	this.AIkeyState = {};
};

var proto = Input.prototype;

proto.listen = function( canvas ) {
	canvas.addEventListener( "mousedown", function( e ) {
		this.mouseState.left.down = true;
		this.mouseState.left.pos.x = e.offsetX;
		this.mouseState.left.pos.y = e.offsetY;
	}.bind( this ) );
	
	document.addEventListener( "keydown", function( e ) {
		this.keyState[ e.keyCode ] = "down";
	}.bind( this ) );
	
	document.addEventListener( "keyup", function( e ) {
		this.keyState[ e.keyCode ] = "up";
	}.bind( this ) );
}

