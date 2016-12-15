console.log("index.js is up!")

var rng = function( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

var sprite = new Sprite();
var render = new Render();
var input = new Input();

var lastTime = 0;
var loop = function( t ) {
	requestAnimationFrame( loop );
	
	var dt = t - lastTime;
	lastTime = t;
	keyboardState.update();
	
	alienManager.update( dt || 0 );
	
	ship.update( dt || 0 );
	
	effects.update( dt || 0 );
	
	space.update();
	
	collide.update();
	
	effects.render();
	render.createRender( ship.thrusters.getRender() );
	render.createRender( ship.getRender() );
	alienManager.render();
	space.render();
	render.createRender( { fillColor: stage.bgc, x: stage.x, y: stage.y, w: stage.w, h: stage.h } );
	
	render.update();
}

var collide = {};
collide.update = function() {
	for ( var i = ship.bullets.length - 1; i >= 0; --i ) {
		var bullet = ship.bullets[ i ];
		for ( var j = alienManager.aliens.length - 1; j >= 0; --j ) {
			var alien = alienManager.aliens[ j ];
			if ( aabb( bullet, alien ) ) {
				bullet.collide();
				alien.collide();
			}
		}

	}
}

var effects = {};
effects.active = [];
effects.effect = function() {
	this.x;
	this.y;
	this.w;
	this.h;
}
effects.effect.prototype.update = function( dt ) {
	this.ttl -= dt;
};

effects.effect.prototype.getRender = function() {
	return { x: this.x, y: this.y, w: this.w, h: this.h, spriteData: this.spriteData };
}


effects.types = {
	explosion: {
		ttl: 100,
		w: 8,
		h: 8,
		spriteData: {
			sprite: "explosion",
			w: 8,
			h: 8
		}
	}
};

effects.spawnEffect = function( obj, type ) {
	var effect = effects.types[ type ];
	var effectObj = new effects.effect();
	for ( var key in effect ) {
		effectObj[ key ] = effect[ key ];
	}
	
	effectObj.x = obj.x;
	effectObj.y = obj.y;
	
	effects.active.push( effectObj );
}

effects.update = function( dt ) {
	for ( var i = effects.active.length - 1; i >= 0; --i ) {
		var effect = effects.active[ i ];
		effect.update( dt );
		if ( effect.ttl <= 0 ) effects.active.splice( i, 1 );
	}
}

effects.render = function() {
	for ( var i = effects.active.length - 1; i >= 0; --i ) {
		var effect = effects.active[ i ];

		render.createRender( effect.getRender() );

	}
}

var aabb = function( a, b ) {
	return ( a.x + a.w >= b.x && a.x <= b.x + b.w && a.y + a.h >= b.y && a.y <= b.y + b.h );
	
}

sprite.setSpriteFolder("sprites/");
var sprites = [ 
			"ship.png",
			"thrust.png",
			"bullet.png",
			"alien0.png",
			"explosion.png"
		];
sprite.queuePath( sprites );
sprite.loadSprites( loop );

var stage = document.createElement( "canvas" ),
	ctx = stage.getContext( "2d" );

stage.w = 640;
stage.h = 480;
stage.x = 0;
stage.y = 0;
stage.width = stage.w;
stage.height = stage.h;
stage.bgc = "rgb( 0, 0, 0 )";

document.body.appendChild( stage );

input.listen( stage );

var keyboardState = {
	keys: [],
	limit: 9
}

keyboardState.update = function() {

	var l = input.keyState[ 37 ],
		u = input.keyState[ 38 ],
		r = input.keyState[ 39 ],
		da = input.keyState[ 40 ],
		a = input.keyState[ 65 ],
		w = input.keyState[ 87 ],
		d = input.keyState[ 68 ],
		s = input.keyState[ 83 ],
		space = input.keyState[ 32 ],
		shift = input.keyState[ 16 ];
		
	if ( /*l || u || r || da ||*/ a || w || d || s ) {
		
		var both = false;
		if ( a == "down" && d == "down" ) both = true;
		
		if ( a ) {
			if ( a == "down" && !both ) { 
				ship.thrusters.right = true;
				ship.velocity.accelerate = true;
				ship.velocity.heading = 180;
			}
			else {
				ship.thrusters.right = false;
				ship.velocity.accelerate = false;
				input.keyState[ 65 ] = false;
			}
		}
		
		if ( w ) {

		}
		
		if ( d ) {
			if ( d == "down" && !both ) { 
				ship.thrusters.left = true;
				ship.velocity.accelerate = true;
				ship.velocity.heading = 90;
			}
			else {
				ship.thrusters.left = false;
				ship.velocity.accelerate = false;
				input.keyState[ 68 ] = false;
			}
		}
		
		if ( s ) {

		}
		
		// input.keyState[ 37 ] = false;
		// input.keyState[ 38 ] = false;
		// input.keyState[ 39 ] = false;
		// input.keyState[ 40 ] = false;
		// input.keyState[ 65 ] = false;
		// input.keyState[ 87 ] = false;
		// input.keyState[ 68 ] = false;
		// input.keyState[ 83 ] = false;

	}
	
	if ( shift ) {

		input.keyState[ 16 ] = false;
	}
	
	if ( space ) {
		if ( space == "down" ) { 
			ship.shoot();
		}
		else {
			input.keyState[ 32 ] = false;
		}
	}
}





var ship = {};
ship.w = 32;
ship.h = 32;
ship.x = stage.w * .5 - ship.w * .5;
ship.y = stage.h - ship.h - 8;
ship.speed = .2;
ship.sprite = "ship";
ship.attack = { 
	speed: 500,
	damage: 1
}
ship.canShoot = false;
ship.coolDown = ship.attack.speed;
ship.velocity = {
	heading: 90,
	accelerate: false,
	value: 0,
	max: 3
}

ship.thrusters = {
		left: false,
		right: false,
		index: 0,
		getRender: function() {
			var rndr = {};
			this.index != 3 ? this.index += 1 : this.index = 0;
			
			if ( this.right ) {
				rndr.y = ship.y + ship.h * .5 - 2,
				rndr.x = ship.x + ship.w - 3,
				rndr.w = 8,
				rndr.h = 4,
				rndr.spriteData = {
					sprite: "thrust",
					w: 8,
					h: 6,
					index: this.index
				}
			}
			if ( this.left ) {
				rndr.y = ship.y + ship.h * .5 - 2,
				rndr.x = ship.x - 5,
				rndr.w = 8,
				rndr.h = 4,
				rndr.flip = true,
				rndr.spriteData = {
					sprite: "thrust",
					w: 8,
					h: 6,
					index: this.index
				}
			}
			return rndr;
		}
	};
ship.bullets = [];
ship.bullet = function() {
	this.w = 6;
	this.h = 8;
	this.x = ship.x + ship.w * .5 - this.w * .5;
	this.y = ship.y;
	this.speed = 4;
	this.sprite = "bullet";
	this.dead = false;
}

ship.bullet.prototype.getRender = function() {
	return { x: this.x, y: this.y, w: this.w, h: this.h, spriteData: { w: this.w, h: this.h, sprite: this.sprite } };
}

ship.bullet.prototype.update = function() {
	this.y >= 0 ? this.y -= this.speed : this.dead = true;
}

ship.bullet.prototype.collide = function() {
	this.dead = true;
	effects.spawnEffect( this, "explosion" );
}

ship.shoot = function() {
	if ( ship.canShoot ) {
		ship.canShoot = false;
		ship.bullets.push( new ship.bullet() );
	}
}


ship.getRender = function() {
	for ( var i = ship.bullets.length -1; i >= 0; --i ) {
		var bullet = ship.bullets[ i ];
		render.createRender( bullet.getRender() );
	}
	return { x: this.x, y: this.y, w: this.w, h: this.h, spriteData: { w: this.w, h: this.h, sprite: this.sprite } };
};

ship.update = function( dt ) {

	if ( ship.coolDown > 0 ) ship.coolDown -= dt;
	if ( ship.coolDown <= 0 ) { 
		ship.canShoot = true;
		ship.coolDown = ship.attack.speed;
	}
	
	var v = ship.velocity;
	
	if ( ship.thrusters.left && ship.thrusters.right ) v.accelerate = false;
	
	if ( v.accelerate ) {
		if ( ship.thrusters.left ) {
			v.value += ship.speed;
			if ( v.value > v.max ) v.value = v.max;	
		}
		if ( ship.thrusters.right ) {
			v.value -= ship.speed;
			if ( v.value < v.max * -1 ) v.value = v.max * -1;	
		}
	}
	else {
		if ( v.value < 0 ) v.value += .1;
		if ( v.value > 0 ) v.value -= .1;
	}
	
	
	ship.x += v.value;
	
	for ( var i = ship.bullets.length - 1; i >= 0; --i ) {
		var bullet = ship.bullets[ i ];
		if ( bullet.dead ) {
			ship.bullets.splice( i, 1 );
		}
		else {
			bullet.update();
		}
	}
}

var alienManager = {};
alienManager.aliens = [];
alienManager.alien = function() {
	this.x;
	this.y;
	this.w;
	this.h;
	this.dead = false;
	this.animate = {
		delay: 500,
		countDown: 100,
		index: -1
	}
}
alienManager.update = function( dt ) {
	for ( var i = this.aliens.length - 1; i >= 0; --i ) {
		var alien = this.aliens[ i ];
		alien.update( dt );

		if ( alien.dead ) this.aliens.splice( i, 1 );
	}
}
alienManager.render = function() {
	for ( var i = this.aliens.length - 1; i >= 0; --i ) {
		var alien = this.aliens[ i ];
		render.createRender( alien.getRender() );
	}
}

alienManager.alien.prototype.update = function( dt ) {
	this.animate.countDown -= dt;
	if ( this.animate.countDown <= 0 ) {
		this.animate.index != 3 ? ++this.animate.index : this.animate.index = 0;
		this.animate.countDown = this.animate.delay;
		this.spriteData.index = this.animate.index;
	}
	this[ this.pattern ]();
	if ( this.HP <= 0 ) {
		this.dead = true;
		++counter;
		for ( var i = counter; i >= 0; --i ) {
			alienManager.spawnAlien( "grog" );			
		}
	}
}
var counter = 0;
alienManager.alien.prototype.getRender = function() {
	return { x: this.x, y: this.y, w: this.w, h: this.h, spriteData: this.spriteData };
}

alienManager.alien.prototype.collide = function() {
	this.HP -= 1;
	this.y -= 1;
}

alienManager.alien.prototype.fall = function() {
	this.y += this.speed;
}
alienManager.spawnAlien = function( type ) {
	var alien = new alienManager.alien();
	var obj = alienData[ type ];
	for ( var key in obj ) {
		alien[ key ] = obj[ key ];
	}
	
	alien.x = rng( 2, stage.w - alien.w * .5 );
	alien.y = -alien.h;
	
	alienManager.aliens.push( alien );
}

var alienData = {};
alienData.grog = {};
alienData.grog.name = "Grog";
alienData.grog.HP = 6;
alienData.grog.speed = .5;
alienData.grog.spriteData = {
	sprite: "alien0",
	w: 32,
	h: 32,
	index: 0
};

alienData.grog.pattern = "fall";
alienData.grog.w = alienData.grog.spriteData.w;
alienData.grog.h = alienData.grog.spriteData.h;

alienManager.spawnAlien( "grog" );

var space = {};
space.stars = [];
space.star = function() {
	this.x = rng( 0, stage.w - 1 );
	this.y = rng( 0, stage.h - 1 );
	this.w = rng( 1, 4 );
	this.h = this.w;
	this.speed = 1;
}

space.spawnStars = function( n ) {
	while( --n ) {
		space.stars.push( new space.star() );
	}
}

space.update = function() {
	
	for ( var i = space.stars.length - 1; i >= 0; --i ) {
		var star = space.stars[ i ];
		star.update();
	}
}

space.render = function() {
	for ( var i = space.stars.length - 1; i >= 0; --i ) {
		var star = space.stars[ i ];
		render.createRender( star.getRender() );
	}

}

space.star.prototype.getRender = function() {
	return { x: this.x, y: this.y, w: this.w, h: this.h, fillColor: "white" };
}

space.star.prototype.update = function() {
	this.y <= stage.h ? this.y += this.speed : this.y = 0;
}


space.spawnStars( 50 );
