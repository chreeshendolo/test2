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
	player.render();
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
			"ship0.png",
			"thrust.png",
			"bullet.png",
			"alien0.png",
			"explosion.png",
			"chassis-0.png",
			"wing-a.png",
			"cannon-3.png",
			"thruster-0.png",
			"thruster-1.png",
			"thruster-2.png",
			"gun-0.png",
			"gun-1.png",
			"gun-2.png",
			"test.png",
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
		shift = input.keyState[ 16 ],
		bs = input.keyState[ 8 ];
		
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
	
	if ( space ) {
		if ( space == "down" ) { 
			ship.shoot();
		}
		else {
			input.keyState[ 32 ] = false;
		}
	}
	
	
	
	if ( u ) {
		if ( u == "down" ) {
			menu.nav( "u" );
		}
		input.keyState[ 38 ] = false;
	}
	
	if ( da ) {
		if ( da == "down" ) {
			menu.nav( "da" );
		}
		input.keyState[ 40 ] = false;
	}
	
	if ( shift ) {
		if ( shift == "down" ) {
			menu.nav( "choose" );
		}
		input.keyState[ 16 ] = false;
	}
	
	if ( bs ) {
		if ( bs == "down" ) {
			menu.nav( "back" );;
		}
		input.keyState[ 8 ] = false;
	}
}


var menu = {
	tree: [],
	current: -1,
	category: null,
	nav: function( key ) {
		var list = listTest;
		
		if ( key == "choose" ) {
			this.tree.push( this.current );
			this.current = -1;
		}
		
		if ( key == "back" ) {
			if ( this.tree[ this.tree.length - 1 ] == "list" ) {
				this.tree.pop();
			}
			this.tree.pop();
			this.current = -1;
		}
		
		if ( this.tree.length ) {
			for( var i = 0; i < this.tree.length; ++i ) {
				list = list[ this.tree[ i ] ];
			}
		}
		
		if ( list.list ) { 
			this.tree.push( "list" )
			list = list.list;
		}
		
		
		if ( this.current == -1 ) {
			this.current = 0;
		}
		else {
			if ( key == "da" ) {
				menu.current = menu.current < list.length - 1 ? ++menu.current : 0;
			}
			else if ( key == "u" ) {
				menu.current = menu.current > 0 ? --menu.current : list.length - 1;
			}
		}
		
		var info = list[ menu.current ];
		if ( info ) {
			this.category = info.name;
			
			console.log( info.name );
		}
		else { 
			console.log( list )
			player.parts[ list.type ] = list.name;
			console.log( player )
		}
	}
}

var listTest = 	[
		{
			name: "Chassis",
			type: "chassis",
			list: [
				{
					name: "chassis0",
					type: "chassis",
					connectors: {
						wingl: {
							x: 0,
							y: 16
						},
						wingr: {
							x: 12,
							y: 16
						},
						front: {
							x: 6,
							y: 6,
						}
					},
					spriteData: {
						sprite: "chassis-0",
						w: 12,
						h: 32,
						index: 0
					}
				},
				{
					name: "chassis1",
					type: "chassis",
					connectors: {
						wingl: {
							x: 0,
							y: 16
						},
						wingr: {
							x: 12,
							y: 16
						},
						front: {
							x: 6,
							y: 6,
						}
					},
					spriteData: {
						sprite: "chassis-0",
						w: 12,
						h: 32,
						index: 0
					}
				},
			],
		},
		{
			name: "Wings",
			type: "wing",
			list: [
				{
					name: "winga",
					type: "wing",
					connectors: {
						main: {
							size: 4,
							x: 10,
							y: 12
						},
						slot0: {
							size: 0,
							x: 6,
							y: 10
						},
						slot1: {
							size: 1,
							x: 5,
							y: 16
						},
						slot2: {
							size: 1,
							x: 2,
							y: 24
						}
					},
					spriteData: {
						sprite: "wing-a",
						w: 11,
						h: 28,
						index: 0
					}
				},
				{
					name: "Razor-B",
					connectors: {
						main: {
							size: 4,
							x: 10,
							y: 12
						},
						slot0: {
							size: 0,
							x: 6,
							y: 10
						},
						slot1: {
							size: 1,
							x: 5,
							y: 16
						},
						slot2: {
							size: 1,
							x: 2,
							y: 24
						}
					},
					spriteData: {
						sprite: "wing-a",
						w: 11,
						h: 28,
						index: 0
					}
				}
			],
		}
]



var player = {
	x: 100,
	y: 100,
	parts: {
		chassis: "chassis1",
		wingl: "winga",
		wingr: "winga",
		slotMain: "cannon3",
		thruster0l: "gun0",
		thruster0r: "thruster0",
		thruster1l: "thruster1",
		thruster1r: "thruster2",
		thruster2l: "gun2",
		thruster2r: "gun2",
	}
}

player.assemble = function( part ) {
	// this.parts[ part.type ]
}

player.render = function() {
	var pChassis = assemblies[ this.parts.chassis ];
	var chassis = {
		x: this.x,
		y: this.y,
		w: pChassis.spriteData.w,
		h: pChassis.spriteData.h,
		spriteData: pChassis.spriteData
	}

	var pWingl = assemblies[ this.parts.wingl ];
	var wingl = {
		x: chassis.x - pChassis.connectors.wingl.x - pWingl.connectors.main.x,
		y: chassis.y + pChassis.connectors.wingl.y - pWingl.connectors.main.y,
		w: pWingl.spriteData.w,
		h: pWingl.spriteData.h,
		spriteData: pWingl.spriteData
	}
	
	var pWingr = assemblies[ this.parts.wingr ];
	var wingr = {
		x: chassis.x + pChassis.connectors.wingr.x - ( pWingr.spriteData.w - pWingl.connectors.main.x ),
		y: chassis.y + pChassis.connectors.wingr.y - pWingr.connectors.main.y,
		w: pWingr.spriteData.w,
		h: pWingr.spriteData.h,
		spriteData: pWingr.spriteData,
		flip: true
	}
	
	var pSlotMain = assemblies[ this.parts.slotMain ];
	var slotMain = {
		x: chassis.x + pChassis.connectors.front.x - pSlotMain.connectors.main.x,
		y: chassis.y + pChassis.connectors.front.y - pSlotMain.connectors.main.y,
		w: pSlotMain.spriteData.w,
		h: pSlotMain.spriteData.h,
		spriteData: pSlotMain.spriteData
	}
	
	var pThruster0l = assemblies[ this.parts.thruster0l ];
	var thruster0l = {
		x: wingl.x + pWingl.connectors.slot0.x - pThruster0l.connectors.main.x,
		y: wingl.y + pWingl.connectors.slot0.y - pThruster0l.connectors.main.y,
		w: pThruster0l.spriteData.w,
		h: pThruster0l.spriteData.h,
		spriteData: pThruster0l.spriteData
	}
	
	var pThruster0r = assemblies[ this.parts.thruster0r ];
	var thruster0r = {
		x: wingr.x + ( pWingr.spriteData.w - pWingr.connectors.slot0.x ) - ( pThruster0r.spriteData.w - pThruster0r.connectors.main.x ),
		y: wingr.y + pWingr.connectors.slot0.y - pThruster0r.connectors.main.y,
		w: pThruster0r.spriteData.w,
		h: pThruster0r.spriteData.h,
		spriteData: pThruster0r.spriteData,
		flip: true
	}
	
	var pThruster1l = assemblies[ this.parts.thruster1l ];
	var thruster1l = {
		x: wingl.x + pWingl.connectors.slot1.x - pThruster1l.connectors.main.x,
		y: wingl.y + pWingl.connectors.slot1.y - pThruster1l.connectors.main.y,
		w: pThruster1l.spriteData.w,
		h: pThruster1l.spriteData.h,
		spriteData: pThruster1l.spriteData
	}
	
	var pThruster1r = assemblies[ this.parts.thruster1r ];
	var thruster1r = {
		x: wingr.x + ( pWingr.spriteData.w - pWingr.connectors.slot1.x ) - ( pThruster1r.spriteData.w - pThruster1r.connectors.main.x ),
		y: wingr.y + pWingr.connectors.slot1.y - pThruster1r.connectors.main.y,
		w: pThruster1r.spriteData.w,
		h: pThruster1r.spriteData.h,
		spriteData: pThruster1r.spriteData,
		flip: true
	}
	
	var pThruster2l = assemblies[ this.parts.thruster2l ];
	var thruster2l = {
		x: wingl.x + pWingl.connectors.slot2.x - pThruster2l.connectors.main.x,
		y: wingl.y + pWingl.connectors.slot2.y - pThruster2l.connectors.main.y,
		w: pThruster2l.spriteData.w,
		h: pThruster2l.spriteData.h,
		spriteData: pThruster2l.spriteData
	}
	
	var pThruster2r = assemblies[ this.parts.thruster2r ];
	var thruster2r = {
		x: wingr.x + ( pWingr.spriteData.w - pWingr.connectors.slot2.x ) - ( pThruster2r.spriteData.w - pThruster2r.connectors.main.x ),
		y: wingr.y + pWingr.connectors.slot2.y - pThruster2r.connectors.main.y,
		w: pThruster2r.spriteData.w,
		h: pThruster2r.spriteData.h,
		spriteData: pThruster2r.spriteData,
		flip: true
	}
	
	render.createRender( thruster2r );
	render.createRender( thruster2l );
	render.createRender( thruster1r );
	render.createRender( thruster1l );
	render.createRender( thruster0r );
	render.createRender( thruster0l );
	render.createRender( wingl );
	render.createRender( wingr );
	render.createRender( chassis );
	render.createRender( slotMain );
}

var assemblies = {
	chassis0: {
		connectors: {
			wingl: {
				x: 0,
				y: 16
			},
			wingr: {
				x: 12,
				y: 16
			},
			front: {
				x: 6,
				y: 6,
			}
		},
		spriteData: {
			sprite: "chassis-0",
			w: 12,
			h: 32,
			index: 0
		}
	},
	chassis1: {
		connectors: {
			wingl: {
				x: 0,
				y: 16
			},
			wingr: {
				x: 12,
				y: 16
			},
			front: {
				x: 6,
				y: 6,
			}
		},
		spriteData: {
			sprite: "test",
			w: 12,
			h: 32,
			index: 0
		}
	},
	cannon3: {
		connectors: {
			main: {
				x: 4,
				y: 13
			}
		},
		spriteData: {
			sprite: "cannon-3",
			w: 8,
			h: 14,
			index: 0
		}
	},
	winga: {
		connectors: {
			main: {
				size: 4,
				x: 10,
				y: 12
			},
			slot0: {
				size: 0,
				x: 6,
				y: 10
			},
			slot1: {
				size: 1,
				x: 5,
				y: 16
			},
			slot2: {
				size: 1,
				x: 2,
				y: 24
			}
		},
		spriteData: {
			sprite: "wing-a",
			w: 11,
			h: 28,
			index: 0
		}
	},
	thruster0: {
		connectors: {
			main: {
				size: 0,
				x: 2,
				y: 3
			}
		},
		spriteData: {
			sprite: "thruster-0",
			w: 4,
			h: 4,
			index: 0
		}
	},
	thruster1: {
		connectors: {
			main: {
				size: 1,
				x: 5,
				y: 4
			}
		},
		spriteData: {
			sprite: "thruster-1",
			w: 5,
			h: 6,
			index: 0
		}
	},
	thruster2: {
		connectors: {
			main: {
				size: 2,
				x: 5,
				y: 4
			}
		},
		spriteData: {
			sprite: "thruster-2",
			w: 7,
			h: 6,
			index: 0
		}
	},
	gun0: {
		connectors: {
			main: {
				size: 0,
				x: 4,
				y: 5
			}
		},
		spriteData: {
			sprite: "gun-0",
			w: 5,
			h: 7,
			index: 0
		}
	},
	gun1: {
		connectors: {
			main: {
				size: 1,
				x: 6,
				y: 6
			}
		},
		spriteData: {
			sprite: "gun-1",
			w: 5,
			h: 9,
			index: 0
		}
	},
	gun2: {
		connectors: {
			main: {
				size: 2,
				x: 7,
				y: 6
			}
		},
		spriteData: {
			sprite: "gun-2",
			w: 7,
			h: 10,
			index: 0
		}
	}
}













var ship = {};
ship.w = 40;
ship.h = 39;
ship.x = stage.w * .5 - ship.w * .5;
ship.y = stage.h - ship.h - 8;
ship.speed = .2;
ship.sprite = "ship0";
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
				rndr.y = ship.y + ship.h * .5 + 12,
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
				rndr.y = ship.y + ship.h * .5 + 12,
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
