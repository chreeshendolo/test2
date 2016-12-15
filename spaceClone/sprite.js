console.log( "sprite.js is up!" );

var Sprite = function() {
	this.queue = [];
	this.cache = {};
	this.count = 0;
	this.folderPath = "";
}

var proto = Sprite.prototype;

proto.queuePath = function( path ) {
	if ( Array.isArray( path ) ) {
		Array.prototype.push.apply( this.queue, path );
	}
	else {
		this.queue.push( path )
	}
}

proto.setSpriteFolder = function( folder ) {
	this.folderPath = folder;
}

proto.loadSprites = function( callback ) {
	var queueLength = this.queue.length;
	
	if ( !queueLength ) {
		callback();
		return;
	}
	
	for ( var i = 0; i < queueLength; ++i ) {
		var path = this.queue[ i ],
			img = new Image(),
			that = this;
		
		img.addEventListener( "load", function() {
			++that.count;
			if ( that.count == that.queue.length ) {
				callback();
			}
		}, false );
		
		img.addEventListener( "error", function() {
			++that.count;
			console.debug( this + " image error." );
			if ( that.count == that.queue.length ) {
				callback();
			}
		}, false );
		
		img.src = this.folderPath + path;
		path = path.split( '.' )[ 0 ];
		this.cache[ path ] = img;
	}
}

proto.getSprite = function( spriteName ) {
	return this.cache[ spriteName ];
}

proto.getAllSprites = function() {
	return this.cache;
}