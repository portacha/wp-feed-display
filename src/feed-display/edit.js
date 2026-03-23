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
import { useEffect, useState } from '@wordpress/element';

export default function Edit( { attributes, setAttributes } ) {
	const { backgroundColor, textColor, accentColor, categories, tags, postsPerPage } =
		attributes;

	const blockProps = useBlockProps( {
		style: {
			'--feed-bg': backgroundColor,
			'--feed-text': textColor,
			'--feed-accent': accentColor,
			backgroundColor,
			color: textColor,
		},
	} );

	// Fetch categories.
	const wpCategories = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'category', {
			per_page: -1,
		} );
	}, [] );

	// Fetch tags.
	const wpTags = useSelect( ( select ) => {
		return select( coreStore ).getEntityRecords( 'taxonomy', 'post_tag', {
			per_page: -1,
		} );
	}, [] );

	// Fetch preview posts.
	const previewPosts = useSelect(
		( select ) => {
			const query = {
				per_page: Math.min( postsPerPage, 3 ),
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
		[ categories, tags, postsPerPage ]
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

	return (
		<>
			<InspectorControls>
				<PanelColorSettings
					title={ __( 'Colores', 'wp-feed-display' ) }
					colorSettings={ [
						{
							value: backgroundColor,
							onChange: ( color ) =>
								setAttributes( { backgroundColor: color } ),
							label: __( 'Color de fondo', 'wp-feed-display' ),
						},
						{
							value: textColor,
							onChange: ( color ) =>
								setAttributes( { textColor: color } ),
							label: __( 'Color de texto', 'wp-feed-display' ),
						},
						{
							value: accentColor,
							onChange: ( color ) =>
								setAttributes( { accentColor: color } ),
							label: __( 'Color de acento (tags)', 'wp-feed-display' ),
						},
					] }
				/>
				<PanelBody
					title={ __( 'Filtros de posts', 'wp-feed-display' ) }
					initialOpen={ true }
				>
					<SelectControl
						label={ __( 'Categoría', 'wp-feed-display' ) }
						value={ categories }
						options={ categoryOptions }
						onChange={ ( val ) =>
							setAttributes( { categories: val } )
						}
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
						onChange={ ( val ) =>
							setAttributes( { postsPerPage: val } )
						}
						min={ 1 }
						max={ 12 }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="wp-feed-display__header">
					<h3>{ __( 'Post Feed', 'wp-feed-display' ) }</h3>
					<span className="wp-feed-display__badge">
						{ __( 'Vista previa', 'wp-feed-display' ) }
					</span>
				</div>

				<div className="wp-feed-display__grid">
					{ ! previewPosts && (
						<div className="wp-feed-display__loading">
							<Spinner />
							<p>
								{ __( 'Cargando posts…', 'wp-feed-display' ) }
							</p>
						</div>
					) }

					{ previewPosts && previewPosts.length === 0 && (
						<Placeholder
							icon="feed"
							label={ __( 'Sin posts', 'wp-feed-display' ) }
							instructions={ __(
								'No se encontraron posts con los filtros seleccionados.',
								'wp-feed-display'
							) }
						/>
					) }

					{ previewPosts &&
						previewPosts.map( ( post ) => {
							const featuredImage =
								post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]
									?.source_url;

							return (
								<article
									key={ post.id }
									className="wp-feed-display__card"
								>
									{ featuredImage && (
										<div className="wp-feed-display__card-image">
											<img
												src={ featuredImage }
												alt={ post.title.rendered }
											/>
										</div>
									) }
									<div className="wp-feed-display__card-content">
										<h4 className="wp-feed-display__card-title">
											{ post.title.rendered }
										</h4>
										<div
											className="wp-feed-display__card-excerpt"
											dangerouslySetInnerHTML={ {
												__html: post.excerpt.rendered,
											} }
										/>
									</div>
								</article>
							);
						} ) }
				</div>

				{ previewPosts && previewPosts.length > 0 && (
					<div className="wp-feed-display__sentinel">
						<Spinner />
						<p>
							{ __(
								'Carga lazy activa en el frontend',
								'wp-feed-display'
							) }
						</p>
					</div>
				) }
			</div>
		</>
	);
}
