( function () {
	'use strict';

	var AJAX_URL = ( typeof wpFeedDisplay !== 'undefined' && wpFeedDisplay.ajaxUrl ) || '';
	var REST_URL = ( typeof wpFeedDisplay !== 'undefined' && wpFeedDisplay.restUrl ) || '';

	var API_BASE = AJAX_URL
		? AJAX_URL + '?action=wpfd_get_posts'
		: REST_URL || '/wp-json/wp-feed-display/v1/posts';

	function escapeHTML( str ) {
		if ( ! str ) return '';
		var div = document.createElement( 'div' );
		div.appendChild( document.createTextNode( str ) );
		return div.innerHTML;
	}

	function createGridCardHTML( post ) {
		var tagsHTML =
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

		var imageHTML = post.thumbnail
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
			'<h4 class="wp-feed-display__card-title">' + escapeHTML( post.title ) + '</h4>' +
			'<div class="wp-feed-display__card-excerpt"><p>' + escapeHTML( post.excerpt ) + '</p></div>' +
			tagsHTML +
			'<a href="' + escapeHTML( post.permalink ) + '" class="wp-feed-display__card-btn">más</a>' +
			'</div>' +
			'</article>'
		);
	}

	function createSplitCardHTML( post ) {
		var categoryHTML = post.category
			? '<span class="wp-feed-display__split-category">' +
			  '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">' +
			  '<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>' +
			  '</svg>' +
			  escapeHTML( post.category ) +
			  '</span>'
			: '';

		var imageHTML = post.thumbnail
			? '<div class="wp-feed-display__split-image"><img src="' +
			  escapeHTML( post.thumbnail ) +
			  '" alt="' +
			  escapeHTML( post.title ) +
			  '" loading="lazy" /></div>'
			: '';

		return (
			'<article class="wp-feed-display__split-card">' +
			imageHTML +
			'<div class="wp-feed-display__split-content">' +
			categoryHTML +
			'<h4 class="wp-feed-display__split-title">' + escapeHTML( post.title ) + '</h4>' +
			'<div class="wp-feed-display__split-excerpt"><p>' + escapeHTML( post.excerpt ) + '</p></div>' +
			'<a href="' + escapeHTML( post.permalink ) + '" class="wp-feed-display__split-btn">más</a>' +
			'</div>' +
			'</article>'
		);
	}

	function createMasonryCardHTML( post ) {
		var categoryHTML = post.category
			? '<span class="wp-feed-display__masonry-category">' +
			  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
			  '<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>' +
			  '</svg>' +
			  escapeHTML( post.category ) +
			  '</span>'
			: '';

		var imageHTML = post.thumbnail
			? '<div class="wp-feed-display__masonry-image"><img src="' +
			  escapeHTML( post.thumbnail ) +
			  '" alt="' +
			  escapeHTML( post.title ) +
			  '" loading="lazy" /></div>' +
			  '<a href="' + escapeHTML( post.permalink ) + '" class="wp-feed-display__masonry-overlay">' +
			  '<div class="wp-feed-display__masonry-content">' +
			  categoryHTML +
			  '<h4 class="wp-feed-display__masonry-title">' +
			  escapeHTML( post.title ) +
			  '</h4>' +
			  '<span class="wp-feed-display__masonry-btn">más</span>' +
			  '</div></a>'
			: '';

		return (
			'<article class="wp-feed-display__masonry-item">' +
			imageHTML +
			'</article>'
		);
	}

	function parsePosts( data, useAjax ) {
		if ( useAjax && data && data.success && Array.isArray( data.data ) ) {
			return data.data;
		}
		if ( Array.isArray( data ) ) {
			return data;
		}
		return [];
	}

	function initFeed( container ) {
		var viewMode = container.dataset.viewMode || 'grid';
		var isMasonry = viewMode === 'masonry';
		var isSplit = viewMode === 'split';

		var grid = container.querySelector( isMasonry ? '.wp-feed-display__masonry' : isSplit ? '.wp-feed-display__split' : '.wp-feed-display__grid' );
		var sentinel = container.querySelector( '.wp-feed-display__sentinel' );

		if ( ! grid || ! sentinel ) return;

		var categories = container.dataset.categories || '';
		var tags = container.dataset.tags || '';
		var perPage = parseInt( container.dataset.perPage, 10 ) || 6;
		var excerptLength = parseInt( container.dataset.excerptLength, 10 ) || 150;

		var page = 1;
		var loading = false;
		var exhausted = false;
		var useAjax = !! AJAX_URL;

		function createCardHTML( post ) {
			if ( isMasonry ) {
				return createMasonryCardHTML( post );
			}
			if ( isSplit ) {
				return createSplitCardHTML( post );
			}
			return createGridCardHTML( post );
		}

		function fetchPosts() {
			if ( loading || exhausted ) return;
			loading = true;

			var spinner = sentinel.querySelector( '.wp-feed-display__spinner' );
			if ( spinner ) spinner.classList.remove( 'is-hidden' );

			var params = new URLSearchParams( {
				page: String( page ),
				per_page: String( perPage ),
				excerpt_length: String( excerptLength ),
			} );
			if ( categories ) params.set( 'categories', categories );
			if ( tags ) params.set( 'tags', tags );

			var url = API_BASE + '&' + params.toString();

			fetch( url )
				.then( function ( response ) {
					if ( ! response.ok ) {
						throw new Error( 'HTTP ' + response.status + ': ' + response.statusText );
					}
					return response.json();
				} )
				.then( function ( data ) {
					var posts = parsePosts( data, useAjax );

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
		document.querySelectorAll( '.wp-feed-display' ).forEach( initFeed );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
