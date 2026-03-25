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
		var tagsHTML = '';
		if ( post.tags && post.tags.length ) {
			var tagsArrHTML = [];
			for ( var i = 0; i < post.tags.length; i++ ) {
				tagsArrHTML.push(
					'<a href="' +
					escapeHTML( post.tags[ i ].link ) +
					'" class="wp-feed-display__tag">' +
					escapeHTML( post.tags[ i ].name ) +
					'</a>'
				);
			}
			tagsHTML = '<div class="wp-feed-display__card-tags">' + tagsArrHTML.join( '' ) + '</div>';
		}

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

	function createSlideCardHTML( post, textPosition ) {
		var tagsHTML = '';
		if ( post.tags && post.tags.length ) {
			var tagsArr = post.tags.slice( 0, 3 );
			var tagsArrHTML = [];
			for ( var i = 0; i < tagsArr.length; i++ ) {
				tagsArrHTML.push( '<span class="wp-feed-display__tag">' + escapeHTML( tagsArr[ i ].name ) + '</span>' );
			}
			tagsHTML = '<div class="wp-feed-display__slide-tags">' + tagsArrHTML.join( '' ) + '</div>';
		}

		if ( ! post.thumbnail ) {
			return null;
		}

		var imageHTML = '<div class="wp-feed-display__slide-image"><img src="' +
			escapeHTML( post.thumbnail ) +
			'" alt="' +
			escapeHTML( post.title ) +
			'" loading="lazy" /></div>';

		return (
			'<article class="wp-feed-display__slide-card">' +
			imageHTML +
			'<div class="wp-feed-display__slide-text wp-feed-display__slide-text--' + textPosition + '">' +
			'<h4 class="wp-feed-display__slide-title">' + escapeHTML( post.title ) + '</h4>' +
			tagsHTML +
			'<a href="' + escapeHTML( post.permalink ) + '" class="wp-feed-display__slide-btn">más</a>' +
			'</div>' +
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
		var isSlide = viewMode === 'slide';

		var grid = container.querySelector( isMasonry ? '.wp-feed-display__masonry' : isSplit ? '.wp-feed-display__split' : isSlide ? '.wp-feed-display__slider' : '.wp-feed-display__grid' );
		var sentinel = container.querySelector( '.wp-feed-display__sentinel' );

		if ( ! grid ) return;

		var categories = container.dataset.categories || '';
		var tags = container.dataset.tags || '';
		var perPage = parseInt( container.dataset.perPage, 10 ) || 6;
		var excerptLength = parseInt( container.dataset.excerptLength, 10 ) || 150;

		var page = 1;
		var loading = false;
		var exhausted = false;
		var useAjax = !! AJAX_URL;

		var slidePosts = parseInt( container.dataset.slidePosts, 10 ) || 1;
		var slideInterval = parseInt( container.dataset.slideInterval, 10 ) || 5000;
		var currentSlide = 0;
		var autoSlideTimer = null;
		var allPosts = [];

		function createCardHTML( post ) {
			if ( isMasonry ) {
				return createMasonryCardHTML( post );
			}
			if ( isSplit ) {
				return createSplitCardHTML( post );
			}
			if ( isSlide ) {
				return createSlideCardHTML( post, container.style.getPropertyValue( '--slide-text-pos' ) || 'bottom' );
			}
			return createGridCardHTML( post );
		}

		function initSlider() {
			if ( ! isSlide || allPosts.length === 0 ) return;

			// Filtrar posts sin imagen destacada
			var slidablePosts = allPosts.filter( function ( p ) { return !! p.thumbnail; } );
			if ( slidablePosts.length === 0 ) return;

			var sliderInner = document.createElement( 'div' );
			sliderInner.className = 'wp-feed-display__slider-inner';

			var temp = document.createElement( 'div' );
			slidablePosts.forEach( function ( post ) {
				var html = createCardHTML( post );
				if ( ! html ) return;
				temp.innerHTML = html;
				if ( temp.firstChild ) {
					sliderInner.appendChild( temp.firstChild );
				}
			} );

			if ( ! sliderInner.children.length ) return;
			grid.appendChild( sliderInner );

			var totalCards = sliderInner.children.length;
			var totalSlides = Math.ceil( totalCards / slidePosts );

			var dotsContainer = document.createElement( 'div' );
			dotsContainer.className = 'wp-feed-display__slider-dots';
			for ( var i = 0; i < totalSlides; i++ ) {
				var dot = document.createElement( 'button' );
				dot.className = 'wp-feed-display__slider-dot' + ( i === 0 ? ' active' : '' );
				( function ( index ) {
					dot.addEventListener( 'click', function () {
						goToSlide( index );
					} );
				} )( i );
				dotsContainer.appendChild( dot );
			}
			container.appendChild( dotsContainer );

			var prevBtn = container.querySelector( '.wp-feed-display__slider-prev' );
			var nextBtn = container.querySelector( '.wp-feed-display__slider-next' );

			if ( prevBtn ) {
				prevBtn.addEventListener( 'click', function () {
					prevSlide();
				} );
			}
			if ( nextBtn ) {
				nextBtn.addEventListener( 'click', function () {
					nextSlide();
				} );
			}

			function goToSlide( index ) {
				var cards = sliderInner.querySelectorAll( '.wp-feed-display__slide-card' );
				var total = cards.length;

				cards.forEach( function ( card ) {
					card.classList.remove( 'is-active', 'is-prev', 'is-next' );
				} );

				var start = index * slidePosts;
				for ( var j = start; j < start + slidePosts && j < total; j++ ) {
					cards[ j ].classList.add( 'is-active' );
				}
				if ( start > 0 ) {
					cards[ start - 1 ].classList.add( 'is-prev' );
				}
				if ( start + slidePosts < total ) {
					cards[ start + slidePosts ].classList.add( 'is-next' );
				}

				sliderInner.classList.toggle( 'has-prev', start > 0 );
				sliderInner.classList.toggle( 'has-next', start + slidePosts < total );

				currentSlide = index;

				var dots = dotsContainer.querySelectorAll( '.wp-feed-display__slider-dot' );
				dots.forEach( function ( dot, i ) {
					dot.classList.toggle( 'active', i === currentSlide );
				} );

				resetAutoSlide();
			}

			function nextSlide() {
				var ts = Math.ceil( sliderInner.children.length / slidePosts );
				goToSlide( ( currentSlide + 1 ) % ts );
			}

			function prevSlide() {
				var ts = Math.ceil( sliderInner.children.length / slidePosts );
				goToSlide( ( currentSlide - 1 + ts ) % ts );
			}

			function resetAutoSlide() {
				if ( autoSlideTimer ) {
					clearInterval( autoSlideTimer );
				}
				if ( slideInterval > 0 ) {
					autoSlideTimer = setInterval( nextSlide, slideInterval );
				}
			}

			// Inicializar estado visual del primer slide
			goToSlide( 0 );

			container.addEventListener( 'mouseenter', function () {
				if ( autoSlideTimer ) {
					clearInterval( autoSlideTimer );
					autoSlideTimer = null;
				}
			} );

			container.addEventListener( 'mouseleave', function () {
				resetAutoSlide();
			} );

			if ( sentinel ) {
				sentinel.classList.add( 'is-hidden' );
			}
		}

		function fetchPosts() {
			if ( loading || exhausted ) return;
			loading = true;

			var spinner = sentinel && sentinel.querySelector( '.wp-feed-display__spinner' );
			if ( spinner ) spinner.classList.remove( 'is-hidden' );

			var params = new URLSearchParams( {
				page: String( page ),
				per_page: String( isSlide ? 12 : perPage ),
				excerpt_length: String( excerptLength ),
			} );
			if ( categories ) params.set( 'categories', categories );
			if ( tags ) params.set( 'tags', tags );

			var querySeparator = API_BASE.indexOf( '?' ) === -1 ? '?' : '&';
			var url = API_BASE + querySeparator + params.toString();

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
						loading = false;
						if ( sentinel ) sentinel.classList.add( 'is-hidden' );

						if ( ! isSlide && grid.children.length === 0 ) {
							var emptyMsg = document.createElement( 'div' );
							emptyMsg.className = 'wp-feed-display__loading-end';
							emptyMsg.textContent = 'No se encontraron posts.';
							container.appendChild( emptyMsg );
						}
						return;
					}

					if ( isSlide ) {
						allPosts = posts;
						page++;
						loading = false;
						exhausted = true;
						initSlider();
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
						if ( sentinel ) sentinel.classList.add( 'is-hidden' );
					}
				} )
				.catch( function ( error ) {
					console.error( 'WP Feed Display: Error fetching posts', error );
					if ( sentinel ) sentinel.classList.add( 'is-hidden' );

					var errorMsg = document.createElement( 'div' );
					errorMsg.className = 'wp-feed-display__loading-end';
					errorMsg.textContent = 'Error al cargar los posts.';
					container.appendChild( errorMsg );

					loading = false;
					exhausted = true;
				} );
		}

		if ( isSlide ) {
			fetchPosts();
		} else if ( typeof IntersectionObserver !== 'undefined' && sentinel ) {
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
			fetchPosts();
		} else {
			fetchPosts();
		}
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
