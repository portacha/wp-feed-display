import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	Spinner,
	Placeholder,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

const DEFAULT_ATTRS = {
	viewMode: 'grid',
	backgroundColor: '#ffffff',
	textColor: '#333333',
	accentColor: '#0073aa',
	categories: '',
	tags: '',
	postsPerPage: 6,
	excerptLength: 150,
	gridColumns: 3,
	gridButtonBg: '#0073aa',
	gridButtonText: '#ffffff',
	splitColumns: 2,
	masonryColumns: 4,
	masonryGap: 8,
	masonryPadding: 0,
	masonryOverlayBg: '#000000',
	masonryOverlayOpacity: 50,
	masonryTextColor: '#ffffff',
	masonryTextSize: 100,
	masonryButtonBg: '#ffffff',
	masonryButtonText: '#000000',
	slidePosts: 1,
	slideInterval: 5000,
	slideTextPosition: 'bottom',
	slideBg: '#000000',
	slideTextColor: '#ffffff',
	slideAccentColor: '#0073aa',
	slideButtonBg: '#ffffff',
	slideButtonText: '#000000',
	slideArrowBg: 'rgba(0,0,0,0.45)',
	slideArrowColor: '#ffffff',
	slideArrowShape: 'circle',
};

export default function Edit( { attributes, setAttributes } ) {
	const {
		viewMode = DEFAULT_ATTRS.viewMode,
		backgroundColor = DEFAULT_ATTRS.backgroundColor,
		textColor = DEFAULT_ATTRS.textColor,
		accentColor = DEFAULT_ATTRS.accentColor,
		categories = DEFAULT_ATTRS.categories,
		tags = DEFAULT_ATTRS.tags,
		postsPerPage = DEFAULT_ATTRS.postsPerPage,
		excerptLength = DEFAULT_ATTRS.excerptLength,
		gridColumns = DEFAULT_ATTRS.gridColumns,
		gridButtonBg = DEFAULT_ATTRS.gridButtonBg,
		gridButtonText = DEFAULT_ATTRS.gridButtonText,
		splitColumns = DEFAULT_ATTRS.splitColumns,
		masonryColumns = DEFAULT_ATTRS.masonryColumns,
		masonryGap = DEFAULT_ATTRS.masonryGap,
		masonryPadding = DEFAULT_ATTRS.masonryPadding,
		masonryOverlayBg = DEFAULT_ATTRS.masonryOverlayBg,
		masonryOverlayOpacity = DEFAULT_ATTRS.masonryOverlayOpacity,
		masonryTextColor = DEFAULT_ATTRS.masonryTextColor,
		masonryTextSize = DEFAULT_ATTRS.masonryTextSize,
		masonryButtonBg = DEFAULT_ATTRS.masonryButtonBg,
		masonryButtonText = DEFAULT_ATTRS.masonryButtonText,
		slidePosts = DEFAULT_ATTRS.slidePosts,
		slideInterval = DEFAULT_ATTRS.slideInterval,
		slideTextPosition = DEFAULT_ATTRS.slideTextPosition,
		slideBg = DEFAULT_ATTRS.slideBg,
		slideTextColor = DEFAULT_ATTRS.slideTextColor,
		slideAccentColor = DEFAULT_ATTRS.slideAccentColor,
		slideButtonBg = DEFAULT_ATTRS.slideButtonBg,
		slideButtonText = DEFAULT_ATTRS.slideButtonText,
		slideArrowBg = DEFAULT_ATTRS.slideArrowBg,
		slideArrowColor = DEFAULT_ATTRS.slideArrowColor,
		slideArrowShape = DEFAULT_ATTRS.slideArrowShape,
	} = attributes;

	const isMasonry = viewMode === 'masonry';
	const isSplit = viewMode === 'split';
	const isGrid = viewMode === 'grid';
	const isSlide = viewMode === 'slide';

	const blockProps = useBlockProps( {
		className: isMasonry ? 'wp-feed-display wp-feed-display--masonry' : isSplit ? 'wp-feed-display wp-feed-display--split' : isSlide ? 'wp-feed-display wp-feed-display--slide' : 'wp-feed-display',
		style: {
			'--feed-bg': backgroundColor,
			'--feed-text': textColor,
			'--feed-accent': accentColor,
			'--grid-cols': gridColumns,
			'--grid-button-bg': gridButtonBg,
			'--grid-button-text': gridButtonText,
			'--split-cols': splitColumns,
			'--masonry-cols': masonryColumns,
			'--masonry-gap': masonryGap + 'px',
			'--masonry-padding': masonryPadding + 'px',
			'--masonry-overlay-bg': masonryOverlayBg,
			'--masonry-overlay-opacity': masonryOverlayOpacity / 100,
			'--masonry-text-color': masonryTextColor,
			'--masonry-text-size': masonryTextSize + '%',
			'--masonry-button-bg': masonryButtonBg,
			'--masonry-button-text': masonryButtonText,
			'--slide-posts': slidePosts,
			'--slide-interval': slideInterval + 'ms',
			'--slide-text-pos': slideTextPosition,
			'--slide-bg': slideBg,
			'--slide-text': slideTextColor,
			'--slide-accent': slideAccentColor,
			'--slide-btn-bg': slideButtonBg,
			'--slide-btn-text': slideButtonText,
			'--slide-arrow-bg': slideArrowShape === 'minimal' ? 'transparent' : slideArrowBg,
			'--slide-arrow-color': slideArrowColor,
			'--slide-arrow-radius': ( { circle: '50%', square: '6px', rounded: '16px', minimal: '50%' } )[ slideArrowShape ] || '50%',
			backgroundColor: isMasonry ? 'transparent' : ( isSlide ? slideBg : backgroundColor ),
			color: isSlide ? slideTextColor : textColor,
		},
	} );

	const wpCategories = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'category', {
			per_page: -1,
		} );
	}, [] );

	const wpTags = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'post_tag', {
			per_page: -1,
		} );
	}, [] );

	const previewPosts = useSelect(
		( select ) => {
			const query = {
				per_page: Math.min( postsPerPage, isMasonry ? 8 : ( isSlide ? 4 : 3 ) ),
				_embed: true,
				status: 'publish',
			};
			if ( categories ) {
				query.categories = categories;
			}
			if ( tags ) {
				query.tags = tags;
			}
			return select( coreStore ).getEntityRecords( 'postType', 'post', query );
		},
		[ categories, tags, postsPerPage, isMasonry, isSlide ]
	);

	const categoryOptions = [
		{ label: __( 'Todas las categorías', 'wp-feed-display' ), value: '' },
		...( wpCategories || [] ).map( ( cat ) => ( {
			label: cat.name,
			value: String( cat.id ),
		} ) ),
	];

	const tagOptions = [
		{ label: __( 'Todas las etiquetas', 'wp-feed-display' ), value: '' },
		...( wpTags || [] ).map( ( tag ) => ( {
			label: tag.name,
			value: String( tag.id ),
		} ) ),
	];

	const renderPostCard = ( post ) => {
		const featuredImage = post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url;
		const postCategories = post._embedded?.[ 'wp:term' ]?.[ 0 ]?.[ 0 ];

		if ( isMasonry ) {
			return (
				<article key={ post.id } className="wp-feed-display__masonry-item">
					{ featuredImage && (
						<>
							<div className="wp-feed-display__masonry-image">
								<img src={ featuredImage } alt={ post.title?.rendered || '' } />
							</div>
							<a href={ post.link || '#' } className="wp-feed-display__masonry-overlay">
								<div className="wp-feed-display__masonry-content">
									{ postCategories && (
										<span className="wp-feed-display__masonry-category">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
												<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
											</svg>
											{ postCategories.name }
										</span>
									) }
									<h4 className="wp-feed-display__masonry-title">{ post.title?.rendered || '' }</h4>
									<span className="wp-feed-display__masonry-btn">
										{ __( 'más', 'wp-feed-display' ) }
									</span>
								</div>
							</a>
						</>
					) }
				</article>
			);
		}

		if ( isSplit ) {
			return (
				<article key={ post.id } className="wp-feed-display__split-card">
					{ featuredImage && (
						<div className="wp-feed-display__split-image">
							<img src={ featuredImage } alt={ post.title?.rendered || '' } />
						</div>
					) }
					<div className="wp-feed-display__split-content">
						{ postCategories && (
							<span className="wp-feed-display__split-category">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
									<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
								</svg>
								{ postCategories.name }
							</span>
						) }
						<h4 className="wp-feed-display__split-title">{ post.title?.rendered || '' }</h4>
						<div
							className="wp-feed-display__split-excerpt"
							dangerouslySetInnerHTML={ {
								__html: post.excerpt?.rendered || '',
							} }
						/>
						<a href={ post.link || '#' } className="wp-feed-display__split-btn">
							{ __( 'más', 'wp-feed-display' ) }
						</a>
					</div>
				</article>
			);
		}

		if ( isSlide ) {
			if ( ! featuredImage ) return null;
			const postTags = post._embedded?.[ 'wp:term' ]?.[ 1 ]?.slice( 0, 3 ) || [];
			return (
				<article key={ post.id } className="wp-feed-display__slide-card is-active">
					<div className="wp-feed-display__slide-image">
						<img src={ featuredImage } alt={ post.title?.rendered || '' } />
					</div>
					<div className={ `wp-feed-display__slide-text wp-feed-display__slide-text--${ slideTextPosition }` }>
						<h4 className="wp-feed-display__slide-title">{ post.title?.rendered || '' }</h4>
						{ postTags.length > 0 && (
							<div className="wp-feed-display__slide-tags">
								{ postTags.map( ( tag ) => (
									<span key={ tag.id } className="wp-feed-display__tag">
										{ tag.name }
									</span>
								) ) }
							</div>
						) }
						<a href={ post.link || '#' } className="wp-feed-display__slide-btn">
							{ __( 'más', 'wp-feed-display' ) }
						</a>
					</div>
				</article>
			);
		}

		return (
			<article key={ post.id } className="wp-feed-display__card">
				{ featuredImage && (
					<div className="wp-feed-display__card-image">
						<img src={ featuredImage } alt={ post.title?.rendered || '' } />
					</div>
				) }
				<div className="wp-feed-display__card-content">
					<h4 className="wp-feed-display__card-title">{ post.title?.rendered || '' }</h4>
					<div
						className="wp-feed-display__card-excerpt"
						dangerouslySetInnerHTML={ {
							__html: post.excerpt?.rendered || '',
						} }
					/>
					<a href={ post.link || '#' } className="wp-feed-display__card-btn">
						{ __( 'más', 'wp-feed-display' ) }
					</a>
				</div>
			</article>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Tipo de vista', 'wp-feed-display' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Vista del feed', 'wp-feed-display' ) }
						value={ viewMode }
						options={ [
							{ label: __( 'Grid con tarjetas', 'wp-feed-display' ), value: 'grid' },
							{ label: __( 'Split (dos columnas)', 'wp-feed-display' ), value: 'split' },
							{ label: __( 'Masonry (solo imágenes)', 'wp-feed-display' ), value: 'masonry' },
							{ label: __( 'Slide animado', 'wp-feed-display' ), value: 'slide' },
						] }
						onChange={ ( val ) => setAttributes( { viewMode: val } ) }
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Colores', 'wp-feed-display' ) }
					colorSettings={ [
						{
							value: backgroundColor,
							onChange: ( color ) => setAttributes( { backgroundColor: color } ),
							label: __( 'Color de fondo', 'wp-feed-display' ),
						},
						{
							value: textColor,
							onChange: ( color ) => setAttributes( { textColor: color } ),
							label: __( 'Color de texto', 'wp-feed-display' ),
						},
						{
							value: accentColor,
							onChange: ( color ) => setAttributes( { accentColor: color } ),
							label: __( 'Color de acento (tags)', 'wp-feed-display' ),
						},
					] }
				/>

				{ ( isGrid || isSplit ) && (
					<PanelColorSettings
						title={ __( 'Colores del botón', 'wp-feed-display' ) }
						colorSettings={ [
							{
								value: gridButtonBg,
								onChange: ( color ) => setAttributes( { gridButtonBg: color } ),
								label: __( 'Color de fondo botón', 'wp-feed-display' ),
							},
							{
								value: gridButtonText,
								onChange: ( color ) => setAttributes( { gridButtonText: color } ),
								label: __( 'Color de texto botón', 'wp-feed-display' ),
							},
						] }
					/>
				) }

				{ isMasonry && (
					<PanelColorSettings
						title={ __( 'Colores overlay masonry', 'wp-feed-display' ) }
						colorSettings={ [
							{
								value: masonryOverlayBg,
								onChange: ( color ) => setAttributes( { masonryOverlayBg: color } ),
								label: __( 'Color overlay', 'wp-feed-display' ),
							},
							{
								value: masonryTextColor,
								onChange: ( color ) => setAttributes( { masonryTextColor: color } ),
								label: __( 'Color texto overlay', 'wp-feed-display' ),
							},
							{
								value: masonryButtonBg,
								onChange: ( color ) => setAttributes( { masonryButtonBg: color } ),
								label: __( 'Color botón', 'wp-feed-display' ),
							},
							{
								value: masonryButtonText,
								onChange: ( color ) => setAttributes( { masonryButtonText: color } ),
								label: __( 'Color texto botón', 'wp-feed-display' ),
							},
						] }
					/>
				) }

				{ ( isGrid || isSplit ) && (
					<PanelBody
						title={ __( 'Configuración de diseño', 'wp-feed-display' ) }
						initialOpen={ false }
					>
						{ isGrid && (
							<RangeControl
								label={ __( 'Columnas', 'wp-feed-display' ) }
								value={ gridColumns }
								onChange={ ( val ) => setAttributes( { gridColumns: val } ) }
								min={ 1 }
								max={ 4 }
							/>
						) }
						{ isSplit && (
							<RangeControl
								label={ __( 'Filas por lote', 'wp-feed-display' ) }
								value={ splitColumns }
								onChange={ ( val ) => setAttributes( { splitColumns: val } ) }
								min={ 1 }
								max={ 4 }
							/>
						) }
						<RangeControl
							label={ __( 'Longitud del extracto', 'wp-feed-display' ) }
							value={ excerptLength }
							onChange={ ( val ) => setAttributes( { excerptLength: val } ) }
							min={ 50 }
							max={ 300 }
						/>
					</PanelBody>
				) }

				{ isMasonry && (
					<PanelBody
						title={ __( 'Configuración masonry', 'wp-feed-display' ) }
						initialOpen={ false }
					>
						<RangeControl
							label={ __( 'Columnas', 'wp-feed-display' ) }
							value={ masonryColumns }
							onChange={ ( val ) => setAttributes( { masonryColumns: val } ) }
							min={ 2 }
							max={ 6 }
						/>
						<RangeControl
							label={ __( 'Espacio entre imágenes (px)', 'wp-feed-display' ) }
							value={ masonryGap }
							onChange={ ( val ) => setAttributes( { masonryGap: val } ) }
							min={ 0 }
							max={ 32 }
						/>
						<RangeControl
							label={ __( 'Padding interno (px)', 'wp-feed-display' ) }
							value={ masonryPadding }
							onChange={ ( val ) => setAttributes( { masonryPadding: val } ) }
							min={ 0 }
							max={ 48 }
						/>
						<RangeControl
							label={ __( 'Opacidad overlay (%)', 'wp-feed-display' ) }
							value={ masonryOverlayOpacity }
							onChange={ ( val ) => setAttributes( { masonryOverlayOpacity: val } ) }
							min={ 0 }
							max={ 100 }
						/>
						<RangeControl
							label={ __( 'Tamaño de texto (%)', 'wp-feed-display' ) }
							value={ masonryTextSize }
							onChange={ ( val ) => setAttributes( { masonryTextSize: val } ) }
							min={ 50 }
							max={ 150 }
						/>
					</PanelBody>
				) }

				{ isSlide && (
					<PanelBody
						title={ __( 'Configuración del slide', 'wp-feed-display' ) }
						initialOpen={ false }
					>
						<RangeControl
							label={ __( 'Posts por slide', 'wp-feed-display' ) }
							value={ slidePosts }
							onChange={ ( val ) => setAttributes( { slidePosts: val } ) }
							min={ 1 }
							max={ 2 }
						/>
						<RangeControl
							label={ __( 'Intervalo (segundos)', 'wp-feed-display' ) }
							value={ slideInterval / 1000 }
							onChange={ ( val ) => setAttributes( { slideInterval: val * 1000 } ) }
							min={ 1 }
							max={ 10 }
						/>
						<SelectControl
							label={ __( 'Posición del texto', 'wp-feed-display' ) }
							value={ slideTextPosition }
							options={ [
								{ label: __( 'Abajo', 'wp-feed-display' ), value: 'bottom' },
								{ label: __( 'Arriba', 'wp-feed-display' ), value: 'top' },
								{ label: __( 'Centro', 'wp-feed-display' ), value: 'center' },
							] }
							onChange={ ( val ) => setAttributes( { slideTextPosition: val } ) }
						/>					<SelectControl
						label={ __( 'Forma de las flechas', 'wp-feed-display' ) }
						value={ slideArrowShape }
						options={ [
							{ label: __( 'Círculo', 'wp-feed-display' ), value: 'circle' },
							{ label: __( 'Cuadrado', 'wp-feed-display' ), value: 'square' },
							{ label: __( 'Redondeado', 'wp-feed-display' ), value: 'rounded' },
							{ label: __( 'Minimal (sin fondo)', 'wp-feed-display' ), value: 'minimal' },
						] }
						onChange={ ( val ) => setAttributes( { slideArrowShape: val } ) }
					/>					</PanelBody>
				) }

				{ isSlide && (
					<PanelColorSettings
						title={ __( 'Colores del slide', 'wp-feed-display' ) }
						colorSettings={ [
							{
								value: slideBg,
								onChange: ( color ) => setAttributes( { slideBg: color } ),
								label: __( 'Color de fondo', 'wp-feed-display' ),
							},
							{
								value: slideTextColor,
								onChange: ( color ) => setAttributes( { slideTextColor: color } ),
								label: __( 'Color de texto', 'wp-feed-display' ),
							},
							{
								value: slideAccentColor,
								onChange: ( color ) => setAttributes( { slideAccentColor: color } ),
								label: __( 'Color de acento', 'wp-feed-display' ),
							},
						] }
					/>
				) }

				{ isSlide && (
					<PanelColorSettings
						title={ __( 'Colores del botón', 'wp-feed-display' ) }
						colorSettings={ [
							{
								value: slideButtonBg,
								onChange: ( color ) => setAttributes( { slideButtonBg: color } ),
								label: __( 'Color de fondo botón', 'wp-feed-display' ),
							},
							{
								value: slideButtonText,
								onChange: ( color ) => setAttributes( { slideButtonText: color } ),
								label: __( 'Color de texto botón', 'wp-feed-display' ),
							},
						] }
					/>
				) }

				{ isSlide && (
					<PanelColorSettings
						title={ __( 'Colores de flechas', 'wp-feed-display' ) }
						colorSettings={ [
							{
								value: slideArrowBg,
								onChange: ( color ) => setAttributes( { slideArrowBg: color } ),
								label: __( 'Fondo de flecha', 'wp-feed-display' ),
							},
							{
								value: slideArrowColor,
								onChange: ( color ) => setAttributes( { slideArrowColor: color } ),
								label: __( 'Ícono de flecha', 'wp-feed-display' ),
							},
						] }
					/>
				) }

				<PanelBody
					title={ __( 'Filtros de posts', 'wp-feed-display' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Categoría', 'wp-feed-display' ) }
						value={ categories }
						options={ categoryOptions }
						onChange={ ( val ) => setAttributes( { categories: val } ) }
					/>
					<SelectControl
						label={ __( 'Etiqueta', 'wp-feed-display' ) }
						value={ tags }
						options={ tagOptions }
						onChange={ ( val ) => setAttributes( { tags: val } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Configuración de carga', 'wp-feed-display' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Posts por carga', 'wp-feed-display' ) }
						value={ postsPerPage }
						onChange={ ( val ) => setAttributes( { postsPerPage: val } ) }
						min={ 1 }
						max={ 12 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="wp-feed-display__header">
					<h3>{ __( 'Post Feed', 'wp-feed-display' ) }</h3>
					<span className="wp-feed-display__badge">
						{ isMasonry ? __( 'Masonry', 'wp-feed-display' ) : isSplit ? __( 'Split', 'wp-feed-display' ) : isSlide ? __( 'Slide', 'wp-feed-display' ) : __( 'Grid', 'wp-feed-display' ) }
					</span>
				</div>

				<div className={ isMasonry ? 'wp-feed-display__masonry' : isSplit ? 'wp-feed-display__split' : isSlide ? 'wp-feed-display__slider' : 'wp-feed-display__grid' }>
					{ ! previewPosts && (
						<div className="wp-feed-display__loading">
							<Spinner />
							<p>{ __( 'Cargando posts…', 'wp-feed-display' ) }</p>
						</div>
					) }

					{ previewPosts && previewPosts.length === 0 && (
						<Placeholder
							icon="feed"
							label={ __( 'Sin posts', 'wp-feed-display' ) }
							instructions={ __( 'No se encontraron posts con los filtros seleccionados.', 'wp-feed-display' ) }
						/>
					) }

					{ previewPosts && previewPosts.map( ( post ) => renderPostCard( post ) ) }
				</div>

				{ previewPosts && previewPosts.length > 0 && (
					<div className="wp-feed-display__sentinel">
						<Spinner />
						<p>{ __( 'Carga lazy activa en el frontend', 'wp-feed-display' ) }</p>
					</div>
				) }
			</div>
		</>
	);
}
