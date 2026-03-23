<?php
/**
 * Server-side render for wp-feed-display/feed block.
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$wrapper_attrs = get_block_wrapper_attributes( [
    'class'           => 'wp-feed-display',
    'style'           => sprintf(
        '--feed-bg:%s;--feed-text:%s;--feed-accent:%s;background-color:%s;color:%s;',
        esc_attr( $attributes['backgroundColor'] ?? '#ffffff' ),
        esc_attr( $attributes['textColor'] ?? '#333333' ),
        esc_attr( $attributes['accentColor'] ?? '#0073aa' ),
        esc_attr( $attributes['backgroundColor'] ?? '#ffffff' ),
        esc_attr( $attributes['textColor'] ?? '#333333' )
    ),
    'data-categories' => esc_attr( $attributes['categories'] ?? '' ),
    'data-tags'       => esc_attr( $attributes['tags'] ?? '' ),
    'data-per-page'   => esc_attr( $attributes['postsPerPage'] ?? 6 ),
] );
?>
<div <?php echo $wrapper_attrs; // phpcs:ignore ?>>
    <div class="wp-feed-display__grid">
    </div>
    <div class="wp-feed-display__sentinel" aria-hidden="true">
        <span class="wp-feed-display__spinner"></span>
    </div>
</div>

<?php
wp_enqueue_script( 'wp-feed-display-lazy' );
wp_localize_script( 'wp-feed-display-lazy', 'wpFeedDisplay', [
    'ajaxUrl' => admin_url( 'admin-ajax.php' ),
    'restUrl' => esc_url_raw( rest_url( 'wp-feed-display/v1/posts' ) ),
] );
