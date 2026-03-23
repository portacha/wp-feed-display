( function () {
	'use strict';

	const API_BASE =
		( typeof wpFeedDisplay !== 'undefined' && wpFeedDisplay.apiBase ) ||
		( typeof wpApiSettings !== 'undefined' && wpApiSettings.root + 'wp-feed-display/v1/posts' ) ||
		'/wp-json/wp-feed-display/v1/posts';

	function createCardHTML( post ) {
		const tagsHTML =
			post.tags && post.tags.length
				? '<div class="wp-feed-display__card-tags">' +
				  post.tags
						.map(
							( tag ) =>
								'<a href="' +
								escapeHTML( tag.link ) +
								'" class="wp-feed-display__tag">' +
								escapeHTML( tag.name ) +
								'</a>'
						)
						.join( '' ) +
				  '</div>'
				: '';

		const imageHTML = post.thumbnail
			? '<div class="wp-feed-display__card-image"><img src="' +
			  escapeHTML( post.thumbnail ) +
			  '" alt="' +
			  escapeHTML( post.title ) +
			  '" loading="lazy" /></div>'
			: '';

		return (
			'<article class="wp-feed-display__card">' +
			imageHTML +
			'<div class="wp-feed-display__card-content">' +
			'<h4 class="wp-feed-display__card-title"><a href="' +
			escapeHTML( post.permalink ) +
			'">' +
			escapeHTML( post.title ) +
			'</a></h4>' +
			'<div class="wp-feed-display__card-excerpt"><p>' +
			escapeHTML( post.excerpt ) +
			'</p></div>' +
			tagsHTML +
			'</div>' +
			'</article>'
		);
	}

	function escapeHTML( str ) {
		if ( ! str ) return '';
		var div = document.createElement( 'div' );
		div.appendChild( document.createTextNode( str ) );
		return div.innerHTML;
	}

	function initFeed( container ) {
		var grid = container.querySelector( '.wp-feed-display__grid' );
		var sentinel = container.querySelector( '.wp-feed-display__sentinel' );

		if ( ! grid || ! sentinel ) return;

		var categories = container.dataset.categories || '';
		var tags = container.dataset.tags || '';
		var perPage = parseInt( container.dataset.perPage, 10 ) || 6;

		var page = 1;
		var loading = false;
		var exhausted = false;

		function fetchPosts() {
			if ( loading || exhausted ) return;
			loading = true;

			var spinner = sentinel.querySelector( '.wp-feed-display__spinner' );
			if ( spinner ) spinner.classList.remove( 'is-hidden' );

			var params = new URLSearchParams( {
				page: String( page ),
				per_page: String( perPage ),
			} );
			if ( categories ) params.set( 'categories', categories );
			if ( tags ) params.set( 'tags', tags );

			var url = API_BASE + ( API_BASE.indexOf( '?' ) > -1 ? '&' : '?' ) + params.toString();

			fetch( url, {
				headers: { 'X-WP-Nonce': ( typeof wpFeedDisplay !== 'undefined' && wpFeedDisplay.nonce ) || '' },
			} )
				.then( function ( response ) {
					if ( ! response.ok ) {
						throw new Error( 'HTTP ' + response.status + ': ' + response.statusText );
					}
					return response.json();
				} )
				.then( function ( posts ) {
					if ( ! posts || posts.length === 0 ) {
						exhausted = true;
						sentinel.classList.add( 'is-hidden' );

						if ( grid.children.length === 0 ) {
							var emptyMsg = document.createElement( 'div' );
							emptyMsg.className = 'wp-feed-display__loading-end';
							emptyMsg.textContent = 'No se encontraron posts.';
							container.appendChild( emptyMsg );
						}
						return;
					}

					var fragment = document.createDocumentFragment();
					var temp = document.createElement( 'div' );

					posts.forEach( function ( post ) {
						temp.innerHTML = createCardHTML( post );
						if ( temp.firstChild ) {
							fragment.appendChild( temp.firstChild );
						}
					} );

					grid.appendChild( fragment );
					page++;
					loading = false;

					if ( posts.length < perPage ) {
						exhausted = true;
						sentinel.classList.add( 'is-hidden' );
					}
				} )
				.catch( function ( error ) {
					console.error( 'WP Feed Display: Error fetching posts', error );
					sentinel.classList.add( 'is-hidden' );

					var errorMsg = document.createElement( 'div' );
					errorMsg.className = 'wp-feed-display__loading-end';
					errorMsg.textContent = 'Error al cargar los posts.';
					container.appendChild( errorMsg );

					loading = false;
					exhausted = true;
				} );
		}

		if ( typeof IntersectionObserver !== 'undefined' ) {
			var observer = new IntersectionObserver(
				function ( entries ) {
					entries.forEach( function ( entry ) {
						if ( entry.isIntersecting ) {
							fetchPosts();
						}
					} );
				},
				{ rootMargin: '200px 0px' }
			);

			observer.observe( sentinel );
		}

		fetchPosts();
	}

	function init() {
		var containers = document.querySelectorAll( '.wp-feed-display' );
		containers.forEach( initFeed );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
