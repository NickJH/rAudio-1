$( window ).on( 'resize', () => { // portrait / landscape
	displayBars();
	if ( G.playback ) {
		displayPlayback();
		setTimeout( renderPlayback, 50 );
		setButtonControl()
	} else if ( G.library ) {
		if ( G.librarylist ) {
			setTimeout( () => {
				if ( $( '.licover' ).length ) {
					$( '#lib-list p' ).css( 'min-height', ( $( '#bar-top' ).is( ':visible' ) ? 40 : 0 ) +'px' );
					$( '.liinfo' ).css( 'width', ( document.body.clientWidth - $( '.licoverimg img' ).width() - 50 ) +'px' );
				} else {
					$( '#lib-list p' ).css( 'min-height', window.innerHeight - ( $( '#bar-top' ).is( ':visible' ) ? 130 : 90 ) +'px' );
				}
			}, 0 );
		}
	} else {
		if ( G.playlist && !G.savedlist && !G.savedplaylist ) {
			setTimeout( () => {
				setTitleWidth();
				setPlaylistScroll()
				$( '#pl-list p' ).css( 'min-height', window.innerHeight - ( $( '#bar-top' ).is( ':visible' ) ? 277 : 237 ) +'px' );
			}, 0 );
		}
	}
} );
// active / inactive window /////////
var active = 1;
connect = () => {
	if ( !active ) {
		active = 1;
		pushstream.connect();
	}
}
disconnect = () => {
	if ( active ) {
		active = 0;
		pushstream.disconnect();
	}
}
document.addEventListener( 'visibilitychange', () => document.hidden ? disconnect() : connect() ); // invisible
window.onpagehide = window.onblur = disconnect; // invisible + visible but not active
window.onpageshow = window.onfocus = connect;
////////////////////////////////////
var pushstream = new PushStream( {
	  modes                                 : 'websocket'
	, timeout                               : 5000
	, reconnectOnChannelUnavailableInterval : 5000
} );
var streams = [ 'airplay', 'bookmark', 'coverart', 'display', 'relays', 'mpdplayer', 'mpdradio', 'mpdupdate',
	'notify', 'option', 'order', 'playlist', 'reload', 'spotify', 'volume', 'webradio' ];
if ( !G.localhost ) streams.push( 'vumeter' );
streams.forEach( stream => {
	pushstream.addChannel( stream );
} );
pushstream.connect();
pushstream.onstatuschange = status => { // 0 - disconnected; 1 - reconnect; 2 - connected
	if ( status === 2 && G.disconnected ) { // suppress on 1st load
		statusRefresh();
	} else if ( status === 0 ) {
		G.disconnected = 1;
		clearIntervalAll();
		hideGuide();
		if ( $( '#infoIcon' ).hasClass( 'fa-relays' ) ) $( '#infoX' ).click();
	}
}
pushstream.onmessage = ( data, id, channel ) => {
	switch( channel ) {
		case 'airplay':   psAirplay( data );   break;
		case 'bookmark':  psBookmark( data );  break;
		case 'coverart':  psCoverart( data );  break;
		case 'display':   psDisplay( data );   break;
		case 'relays':    psRelays( data );    break;
		case 'mpdplayer': psMpdPlayer( data ); break;
		case 'mpdradio':  psMpdRadio( data );  break;
		case 'mpdupdate': psMpdUpdate( data ); break;
		case 'notify':    psNotify( data );    break;
		case 'option':    psOption( data );    break;
		case 'order':     psOrder( data );     break;
		case 'playlist':  psPlaylist( data );  break;
		case 'reload':    psReload( data );    break;
		case 'restore':   psRestore( data );   break;
		case 'spotify':   psSpotify( data );   break;
		case 'volume':    psVolume( data );    break;
		case 'vumeter':   psVUmeter( data );   break;
		case 'webradio':  psWebradio( data );  break;
	}
}
function psAirplay( data ) {
	$.each( data, function( key, value ) {
		G.status[ key ] = value;
	} );
	if ( !$( '#playback' ).hasClass( 'fa-airplay' ) ) displayBottom();
	renderPlayback();
	clearTimeout( G.debounce );
}
function psBookmark( data ) {
	if ( G.bookmarkedit ) return
	
	clearTimeout( G.debounce );
	G.debounce = setTimeout( function() {
		if ( 'html' in data ) {
			$( '#lib-mode-list' ).append( data.html );
		} else {
			var $bookmark = $( '.lib-mode' ).filter( function() {
				return $( this ).find( '.lipath' ) === data.path;
			} );
			if ( data.type === 'delete' ) {
				$bookmark.remove();
			} else {
				$bookmark.find( '.bklabel' ).text( data.name );
			}
		}
		if ( 'order' in data ) G.display.order = data.order;
	}, G.debouncems );
}
function psCoverart( data ) {
	clearTimeout( G.timeoutCover );
	var src = data.url;
	var url = decodeURIComponent( data.url );
	var path = url.substr( 0, url.lastIndexOf( '/' ) );
	switch( data.type ) {
		case 'bookmark':
			var $this = $( '.bookmark' ).filter( function() {
				return $( this ).find( '.lipath' ).text() === path;
			} );
			var $img = $this.find( 'img' );
			var src = '/mnt/MPD/'+ src;
			if ( $img.length ) {
				$img.attr( 'src', src  );
			} else {
				$this.find( '.fa-bookmark' ).remove();
				$this.find( '.divbklabel' ).remove();
				$this.find( '.lipath' ).after( '<img class="bkcoverart" src="'+ src +'">' );
				$( '.mode-bookmark img' ).css( 'opacity', '' );
			}
			break;
		case 'coverart':
			var urlhead = url.slice( 0, 9 );
			var coverpath, covername, currentpath, currentname, cd, name;
			if ( urlhead === '/mnt/MPD/' ) { // /mnt/MPD/path/cover.jpg > path
				coverpath = url.substr( 0, url.lastIndexOf( '/' ) ).slice( 9 );
			} else if ( urlhead === '/data/shm' ) { // /data/shm/online-ArtistNameTitleName.1234567890.png > ArtistNameTitleName
				covername = url.split( '-' ).pop().split( '.' ).shift();
			} else { // /data/audiocd/DISCID.jpg > DISCID
				covername = url.split( '/' ).pop().split( '.' ).shift();
				cd = 1;
			}
			if ( G.playback ) {
				if ( G.status.coverart === url ) break;
				
				G.status.coverart = url;
				renderPlaybackCoverart();
				if ( 'Album' in data ) { // with webradio
					G.status.Album = data.Album;
					renderPlaybackTitles();
				}
			} else if ( G.library ) {
				if ( $( '.licover' ).length ) {
					currentpath = $( '.licover .lipath' ).text();
					name = $( '.licover .liartist' ).text() + $( '.licover .lialbum' ).text();
					currentname = name.replace( /[ "`?/#&'"']/g, '' );
					if ( coverpath === currentpath || covername === currentname ) {
						$( '#liimg' ).attr( 'src', url );
						$( '.licover .coveredit' ).remove();
						$( '.licoverimg ' ).css( 'opacity', '' );
					}
				} else {
					$( '#lib-list li' ).filter( function() {
						return $( this ).find( '.lipath' ).text() === coverpath
					} ).find( '.lib-icon' ).replaceWith( '<img class="iconthumb lib-icon" src="'+ url +'" data-target="#menu-folder">' );
				}
			} else {
				if ( !$( '#pl-index' ).hasClass( 'hide' ) ) return
				
				if ( !cd ) {
					var $li = G.savedplaylist ? $( '#pl-savedlist li' ) : $( '#pl-list li' );
					var lipath;
					var $litarget = $li.filter( function() {
						lipath = $( this ).find( '.lipath' ).text()
						return lipath.substr( 0, lipath.lastIndexOf( '/' ) ) === coverpath;
					} );
				} else {
					var $litarget = $( '#pl-list li' ).filter( function() {
						return $( this ).find( '.lipath' ).text().slice( 0, 4 ) === 'cdda';
					} );
				}
				$litarget.each( function() {
					$( this ).find( '.pl-icon' ).replaceWith( '<img class="iconthumb pl-icon" src="'+ url +'">' );
				} );
			}
			break;
		case 'webradio':
			G.status.stationcover = src;
			if ( G.playback ) {
				$( '#vu' ).addClass( 'hide' );
				$( '#coverart' )
					.attr( 'src', src )
					.css( 'opacity', '' )
					.removeClass( 'hide' );
			} else if ( G.playlist ) {
				$( '#playlist' ).click();
			}
			if ( G.librarylist && G.mode === 'webradio' ) {
				var srcnoext = src.slice( 0, -15 );
				var srcthumb = srcnoext +'-thumb'+ src.slice( -15 );
				var $el = webradioIcon( srcnoext );
				$el.replaceWith( '<img class="lazyload iconthumb lib-icon loaded" data-target="#menu-webradio" data-ll-status="loaded" src="'+ srcthumb +'">' );
			}
			break;
		case 'webradioreset':
			G.status.stationcover = '';
			if ( G.playback ) {
				coverartDefault();
			} else if ( G.playlist ) {
				$( '#playlist' ).click();
			}
			if ( G.mode === 'webradio' ) {
				var $el = webradioIcon( src );
				$el.replaceWith( '<i class="fa fa-webradio lib-icon" data-target="#menu-webradio"></i>' );
			}
			break;
	}
	bannerHide();
}
function psDisplay( data ) {
	if ( 'updateaddons' in data ) {
		G.status.updateaddons = data.updateaddons ? true : false;
		setButtonUpdateAddons();
		return
	}
	
	var hidecover = G.display.hidecover;
	$.each( data, function( key, val ) {
		G.display[ key ] = val;
	} );
	G.coverdefault = G.display.novu && !G.display.vumeter ? G.coverart : G.covervu;
	displayBars();
	if ( G.playback ) {
		setButtonControl();
		displayPlayback();
		renderPlayback();
	} else if ( G.library ) {
		if ( !G.librarylist ) {
			renderLibrary();
		} else if ( $( '.licover' ).length ) {
			if ( hidecover && !G.display.hidecover ) {
				var query = G.query[ G.query.length - 1 ];
				list( query, function( data ) {
					data.path = query.path;
					data.modetitle = query.modetitle;
					renderLibraryList( data );
				}, 'json' );
			} else {
				setTrackCoverart();
			}
		} else if ( G.albumlist && G.albumbyartist !== G.display.albumbyartist ) {
			G.query = [];
			$( '#mode-album' ).click();
		}
	}
}
function psMpdPlayer( data ) {
	if ( data.state === 'play' && [ 'radioparadise', 'radiofrance' ].indexOf( data.icon ) !== -1 ) return
	
	clearTimeout( G.debounce );
	G.debounce = setTimeout( function() {
		var playlistlength = G.status.playlistlength;
		if ( !data.control && data.volume == -1 ) { // fix - upmpdcli missing values on stop/pause
			delete data.control;
			delete data.volume;
		}
		$.each( data, function( key, value ) {
			G.status[ key ] = value;
		} );
		if ( !$( '#playback' ).hasClass( 'fa-'+ G.status.player ) ) displayBottom();
		setButtonControl();
		if ( G.playback ) {
			displayPlayback();
			renderPlayback();
		} else if ( G.playlist ) {
			setPlaylistScroll();
		}
		bannerHide();
	}, G.debouncems );
}
function psMpdRadio( data ) {
	$.each( data, function( key, value ) {
		G.status[ key ] = value;
	} );
	if ( G.playback ) {
		setButtonControl();
		renderPlaybackTitles();
		renderPlaybackCoverart();
		renderPlaybackTime();
	} else if ( G.playlist ) {
		setPlaylistScroll();
	}
}	
function psMpdUpdate( data ) {
	var $elupdate = $( '#library, #button-library, #i-update, #ti-update' );
	$( '#i-update, #ti-update' ).addClass( 'hide' );
	if ( typeof data === 'number' ) {
		G.status.updating_db = true;
		if ( $( '#bar-top' ).is( ':visible' ) ) {
			if ( !G.localhost ) $( '#library, #button-library' ).addClass( 'blink' );
		} else {
			if ( !G.localhost ) $( '#button-library' ).addClass( 'blink' );
			var prefix = $( '#time-knob' ).is( ':visible' ) ? 'ti' : 'i';
			$( '#'+ prefix +'-update' ).removeClass( 'hide' );
		}
	} else {
		G.status.updating_db = false;
		$( '#li-count' ).html( data.song.toLocaleString() );
		G.status.counts = data;
		$.each( data, function( key, val ) {
			$( '#mode-'+ key ).find( 'grl' ).text( val ? val.toLocaleString() : '' );
		} );
		if ( G.library ) {
			if ( G.mode === 'webradio' ) {
				data.webradio ? $( '#mode-webradio' ).click() : $( '#button-library' ).click();
			} else {
				$( '.lib-icon.blink' ).removeClass( 'blink' );
				var query = G.query[ G.query.length - 1 ];
				if ( query ) {
					list( query, function( data ) {
						data.path = query.path;
						data.modetitle = query.modetitle;
						renderLibraryList( data );
					}, 'json' );
				}
			}
		} else if ( G.playlist && !G.savedlist ) {
			$( '#playlist' ).click();
		}
		setTimeout( function() {
			$( '#library, #button-library, .lib-icon.blink' ).removeClass( 'blink' );
			banner( 'Library Update', 'Done', 'library' );
		}, 2000 );
	}
}
function psNotify( data ) {
	banner( data.title, data.text, data.icon, data.delay );
	if ( 'power' in data ) {
		if ( data.power === 'off' ) {
			$( '#loader' ).addClass( 'splash' );
			setTimeout( bannerHide, 10000 );
		}
		loader();
	} else if ( data.text === 'Change track ...' ) { // audiocd
		clearIntervalAll();
	}
}
function psOption( data ) {
	if ( G.local ) return
	
	var option = Object.keys( data )[ 0 ];
	G.status[ option ] = Object.values( data )[ 0 ];
	setButtonOptions();
}
function psOrder( data ) {
	if ( G.local ) return
	
	G.display.order = data;
	orderLibrary();
}
function psPlaylist( data ) {
	if ( G.local ) return
	
	clearTimeout( G.debounce );
	G.debounce = setTimeout( function() {
		if ( data == -1 ) {
			if ( G.playback ) {
				getPlaybackStatus();
			} else if ( G.playlist ) {
				renderPlaylist( -1 );
			}
		} else if ( 'autoplaycd' in data ) {
			G.autoplaycd = 1;
			setTimeout( function() { delete G.autoplaycd }, 5000 );
		} else if ( 'html' in data ) {
			if ( G.playback ) {
				getPlaybackStatus();
			} else if ( G.playlist ) {
				if ( !G.plremove ) renderPlaylist( data );
			}
		} else if ( data.playlist === 'save' ) {
			if ( G.savedlist ) $( '#button-pl-open' ).click();
		} else {
			var name = $( '#pl-path .lipath' ).text();
			if ( G.savedplaylist && data.playlist === name ) renderSavedPlaylist( name );
		}
	}, G.debouncems );
}
function psRelays( response ) { // on receive broadcast
	clearInterval( G.intRelaysTimer );
	if ( 'on' in response ) {
		$( '#device'+ response.on ).removeClass( 'gr' );
	} else if ( 'off' in response ) {
		$( '#device'+ response.off ).addClass( 'gr' );
	} else if ( 'done' in response ) {
		$( '#infoX' ).click();
	}
	if ( !( 'state' in response ) ) return
		
	var state = response.state;
	if ( state === 'RESET' ) {
		$( '#infoX' ).click();
	} else if ( state === 'IDLE' ) {
		info( {
			  icon        : 'relays'
			, title       : 'GPIO Relays Countdown'
			, message     : '<div class="msg-l"><img class="stopwatch" src="/assets/img/stopwatch.svg"></div>'
							+'<div class="msg-r wh">60</div>'
			, buttonlabel : '<i class="fa fa-relays"></i>Off'
			, buttoncolor : red
			, button      : function() {
				bash( '/srv/http/bash/relays.sh' );
			}
			, oklabel     : '<i class="fa fa-set0"></i>Reset'
			, ok          : function() {
				bash( [ 'relaystimerreset' ] );
				banner( 'GPIO Relays', 'Reset to '+ response.timer +'', 'relays' );
			}
		} );
		var delay = 59;
		G.intRelaysTimer = setInterval( function() {
			if ( delay ) {
				$( '.infomessage .wh' ).text( delay-- );
			} else {
				G.status.relayson = false;
				clearInterval( G.intRelaysTimer );
				$( '#relays' ).removeClass( 'on' );
				$( '#i-relays, #ti-relays' ).addClass( 'hide' );
			}
		}, 1000 );
	} else {
		G.status.relayson = state;
		var devices = '';
		$.each( response.order, function( i, val ) {
			if ( i === 0 ) {
				var color = state ? '' : 'class="gr"';
			} else {
				var color = state ? 'class="gr"' : '';
			}
			devices += '<a id="device'+ ( i + 1 ) +'" '+ color +'>'+ val +'</a><br>';
		} );
		if ( $( '#infoOverlay' ).hasClass( 'hide' ) ) {
			info( {
				  icon       : 'relays'
				, title      : 'GPIO Relays '+ ( state ? 'ON' : 'OFF' )
				, message    : '<div class="msg-l"><img class="stopwatch" src="/assets/img/stopwatch.svg"></div>'
							  +'<div class="msg-r">'+ devices +'</div>'
				, okno       : 1
				, beforeshow : function() {
					$( '#infoX' ).addClass( 'hide' );
				}
			} );
		} else {
			$( '#infoTitle' ).text( 'GPIO Relays '+ ( state ? 'ON' : 'OFF' ) );
			$( '.infobtn' ).addClass( 'hide' );
			$( '.infofooter wh' ).html( devices );
		}
	}
}
function psReload( data ) {
	location.href = '/';
}
function psRestore( data ) {
	if ( data.restore === 'done' ) {
		banner( 'Restore Settings', 'Done', 'sd' );
		setTimeout( function() {
			location.href = '/';
		}, 2000 );
	} else {
		loader();
		banner( 'Restore Settings', 'Restart '+ data.restore +' ...', 'sd blink', -1 );
	}
}
function psSpotify( data ) {
	if ( G.status.player !== 'spotify' ) {
		G.status.player = 'spotify';
		displayBottom();
	}
	if ( !G.playback ) return
	
	if ( 'pause' in data ) {
		G.status.state = 'pause'
		G.status.elapsed = data.pause;
	} else {
		$.each( data, function( key, value ) {
			G.status[ key ] = value;
		} );
	}
	if ( !$( '#playback' ).hasClass( 'fa-spotify' ) ) displayBottom();
	renderPlayback();
	setButtonControl();
}
function psVolume( data ) {
	if ( data.type === 'disable' ) {
		$( '#volume-knob, #vol-group i' ).toggleClass( 'disable', data.val );
		return
	}
	
	clearTimeout( G.debounce );
	G.debounce = setTimeout( function() {
		var vol = data.val;
		var mute = data.type === 'mute';
		if ( mute ) {
			G.status.volumemute = vol;
			vol = 0;
		} else {
			G.status.volumemute = 0;
		}
		if ( $( '#volume-knob' ).is( ':visible' ) ) {
			$volumeRS.setValue( vol );
			mute ? volColorMute() : volColorUnmute();
		} else {
			$( '#volume-bar' ).css( 'width',  vol +'%' )
			$( '#volume-text' )
				.text( mute ? data.val : vol )
				.toggleClass( 'bl', mute );
			var prefix = $( '#time-knob' ).is( ':visible' ) ? 'ti' : 'i';
			$( '#'+ prefix +'-mute' ).toggleClass( 'hide', !mute );
		}
	}, G.debouncems );
}
function psVUmeter( data ) {
	$( '#vuneedle' ).css( 'transform', 'rotate( '+ data.val +'deg )' ); // 0-100 : 0-42 degree
}
function psWebradio( data ) {
	$( '#mode-webradio grl' ).text( data )
	if ( G.librarylist ) $( '#mode-webradio grl' ).click();
	if ( G.playlist && !G.local ) getPlaylist();
}
function webradioIcon( srcnoext ) {
	var radiourl = decodeURIComponent( srcnoext )
					.split( '/' ).pop()
					.replace( /\|/g, '/' );
	return $( '#lib-list li' ).filter( function() {
		return $( this ).find( '.lipath' ).text() === radiourl;
	} ).find( '.lib-icon' );
}

