( function ( ctx ) {
	"use strict";

	function Deck( data ) {
		if ( !( this instanceof Deck ) ) return new Deck( data );

		if ( data && data.slides ) data.slides = data.slides.map( function ( s ) {
			if ( typeOf( s ) !== 'Slide' ) return ctx.Slide( s );
			else return s;
		} );

		ctx.SObject.call( this, data || Deck.default, Deck.modelname );

		this.activeSlideI = ko.observable( 0 );

		this.defaultHeader = ko.observable( '' );
		this.defaultFooter = ko.observable( '' );

		// auto-save start
		// this.autoSave = ko.observable( true );
		// this.isChanged = false;
		//
		// var setAutoSave = function setAutoSaveInterval( interval ) {
		// 	return setInterval( function () {
		// 		if ( this.isChanged ) this.save();
		// 	}.bind( this ), interval );
		// }.bind( this, 10 * 1000 );
		//
		// this.autoSaveInterval = setAutoSave();
		//
		// this.autoSave.subscribe( function ( newVal ) {
		// 	if ( newVal ) this.autoSaveInterval = this.autoSaveInterval || setAutoSave();
		// 	else clearInterval( this.autoSaveInterval );
		// }.bind( this ) );
		// auto-save end
	};

	Object.defineProperty( Deck, 'default', {
		enumerable: true,
		get: function () {
			return {
				reveal: {
					config: {
						transition: 'default',
						loop: false,
						controls: true,
						autoSlide: 0
					},
					// init: {},
					theme: ''
				},
				title: '',
				slides: [ ctx.Slide() ]
			};
		}
	} );

	Object.defineProperty( Deck, 'options', {
		enumerable: true,
		get: function () {
			return {
				transition: [ "none", "fade", "slide", "convex", "concave", "zoom", "default" ],
				theme: [ "black", "white", "league", "beige", "sky", "night", "serif", "simple", "solarized" ]
			};
		}
	} );

	Deck.modelname = 'deck';

	Deck.prototype = Object.create( ctx.SObject.prototype, {} );
	Deck.prototype.constructor = Deck;

	Deck.prototype.addSlide = function addSlide( data ) {
		data = data || Object.assign( ctx.Slide.default, {
			header: {
				text: this.defaultHeader(),
				enabled: true
			},
			footer: {
				text: [ this.defaultFooter(), '' ],
				enabled: true
			}
		} );
		this.data.slides.push( ctx.Slide( data ) );
	};

	Deck.prototype.getSlide = function getSlide( i ) {
		if ( i === null || i === undefined ) i = this.activeSlideI();
		return this.data.slides()[ i ];
	};

	Deck.prototype.getContentsHTML = function getContentsHTML() {
		var slides = this.data.slides();
		return "<div class='deck-contents'>\n" +
			slides.map( function ( s ) {
				return s.getContentsHTML() || '';
			} ).filter( function ( v ) {
				return v
			} ).join( "\n" ) +
			"\n</div>";
	};

	Deck.prototype.getFooter = function getFooter( j ) {
		var j = typeOf( j ) === 'number' ? j : this.activeSlideI();
		var all = this.data.slides();
		var excluded = all.reduce( function ( carry, s, i ) {
			if ( !s.data.footer.enabled() ) carry.push( i );
			return carry;
		}, [] );
		all = all.length;
		j++;
		excluded.map( function ( i ) {
			if ( i < j ) j--;
		} );
		excluded = excluded.length;
		return 'Слайд ' + ( j ) + '/' + ( all - excluded );
	};

	Deck.prototype.removeSlide = function removeSlide( i ) {
		this.data.slides.splice( i, 1 );
		var l = this.data.slides().length;
		var i = this.activeSlideI();
		if ( i >= l ) this.activeSlideI( l - 1 );
	};

	Deck.prototype.moveSlide = function moveSlide( i, up ) {
		var slides = this.data.slides;
		var s = slides.splice( i, 1 )[ 0 ];
		slides.splice( i + ( up ? -1 : 1 ), 0, s );
	};

	Deck.prototype.toJS = function toJS() {
		var r = ctx.SObject.prototype.toJS.call( this );
		r.slides = r.slides.map( function ( s ) {
			return s.toJS();
		} );
		return r;
	};

	Deck.prototype.save = function save() {
		var start = Date.now();

		var interval = null;
		var saveicon = ctx.$( '#save-icon' );
		if ( saveicon ) {
			saveicon.addClass( "animated fadeOut" );
			interval = setInterval( function () {
				saveicon.removeClass( "animated fadeOut" );
				saveicon.addClass( "animated fadeOut" );
			}, 1000 );
		};

		var slides = this.data.slides();
		slides.map( function ( s, i ) {
			if ( s.data.footer.enabled() ) {
				s.data.footer.text()[ 1 ] = this.getFooter( i );
			}
		}.bind( this ) );

		return ctx.SObject.prototype.save.call( this ).then( function () {
			this.isChanged = false;
		}.bind( this ) ).catch( alert.bind( null ) ).then( function () {
			var diff = Date.now() - start;
			setTimeout( function () {
				saveicon.removeClass( "animated fadeOut" );
				clearInterval( interval );
			}, diff < 1000 ? 1000 - diff : 0 );
		} );
	};

	Deck.prototype.open = function open( how ) {
		return this.save().then( function () {
			switch ( how ) {
				case 'html':
					how = '/decks/' + this._id + '.html';
					break;
				case 'pdf':
					how = '/api/deck/pdf/' + this._id;
					break;
				default:
					how = null;
			}
			if ( how ) {
				var win = ctx.open( how, '_blank' );
				if ( win ) win.focus();
				else alert( 'Please allow popups for this site' );
			}
		}.bind( this ) );
	};

	Deck.load = function load( id ) {
		return ctx.Server.get( '/api/' + Deck.modelname + "/" + id ).then( function ( data ) {
			var deck = data.result;
			return Deck( deck );
		} );
	};

	ctx.Deck = Deck;

	ctx._vm.init.push( Deck.load( "57710f53a3b504f6166e7441" ).then( function ( deck ) {
		ctx._vm.deck = ko.observable( deck );
	} ).catch( function ( e ) {
		ctx._vm.deck = ko.observable( Deck() );
	} ) )

} )( window );
