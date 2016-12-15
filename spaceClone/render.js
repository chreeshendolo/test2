console.log( "render.js" );

var Render = function() {
	this.renders = [];
};

var proto = Render.prototype;

proto.createRender = function( render ) {
	if ( Array.isArray( render ) ) {
		Array.prototype.push.apply( this.renders, render );
	}
	else {
		this.renders.push( render )
	}
	
};

proto.update = function() {
	for( var i = this.renders.length - 1; i >= 0; --i ) {
		var render = this.renders[ i ];
		
		var spo = ( sprite ) ? sprite : null;
		
		var	t = render.txt,
			s = render.s,
			f = render.font,
			fc = render.fillColor,
			sc = render.strokeColor,
			r = render.r || 0,
			rx = render.x,
			ry = render.y,
			rw = render.w,
			rh = render.h,
			rwh = rw * .5,
			rhh = rh * .5,
			sp = render.spriteData,
			spi = render.spIndex,
			flip = render.flip;

		ctx.save();
		ctx.translate( rx + rwh, ry + rhh );
		//r = Math.PI / 2;
		if ( flip ) ctx.scale( -1, 1 );
		
		ctx.rotate( r );
		
		if( fc && !f ) {
			ctx.fillStyle = fc;
			ctx.fillRect( -rwh, -rhh, rw, rh );
		}
		
		if( t ) {
			ctx.font = f;
			ctx.fillStyle = fc;
			ctx.fillText( t, -rwh, -rhh );
		}
		
		if( sc ) {
			ctx.strokeStyle = sc;
			ctx.strokeRect( -rwh, -rhh, rw, rh );
		}
		
		if( spo && sp ) {
			var img = sp.sprite,
				index = sp.index || 0,
				w = rw,
				h = rh;
			img = spo.getSprite( img );
			var sx = ( index * sp.w % img.width ),
				sy = Math.floor( index * sp.w / img.width ) * sp.h,
				sw = sp.w,
				sh = sp.h;
			ctx.drawImage( img, sx, sy, sw, sh, -( w * .5 ), -( h * .5 ), w, h );
		}
		
		ctx.restore();
		
		this.renders.splice( i, 1 );
	};
}