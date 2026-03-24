<?php
/**
 * Server-side render for wp-feed-display/feed block.
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( 'wpfd_hex_to_rgb' ) ) {
    function wpfd_hex_to_rgb( $hex ) {
        $hex = ltrim( $hex, '#' );
        if ( strlen( $hex ) === 3 ) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        $rgb = hexdec( $hex );
        return [
            'r' => ( $rgb >> 16 ) & 0xFF,
            'g' => ( $rgb >> 8 ) & 0xFF,
            'b' => $rgb & 0xFF,
        ];
    }
}

$view_mode = $attributes['viewMode'] ?? 'grid';
$is_masonry = $view_mode === 'masonry';
$is_split = $view_mode === 'split';

$wrapper_classes = [ 'wp-feed-display' ];
if ( $is_masonry ) {
    $wrapper_classes[] = 'wp-feed-display--masonry';
} elseif ( $is_split ) {
    $wrapper_classes[] = 'wp-feed-display--split';
}

$style_vars = sprintf(
    '--feed-bg:%s;--feed-text:%s;--feed-accent:%s;--grid-button-bg:%s;--grid-button-text:%s;',
    esc_attr( $attributes['backgroundColor'] ?? '#ffffff' ),
    esc_attr( $attributes['textColor'] ?? '#333333' ),
    esc_attr( $attributes['accentColor'] ?? '#0073aa' ),
    esc_attr( $attributes['gridButtonBg'] ?? '#0073aa' ),
    esc_attr( $attributes['gridButtonText'] ?? '#ffffff' )
);

if ( $is_masonry ) {
    $overlay_rgb = wpfd_hex_to_rgb( $attributes['masonryOverlayBg'] ?? '#000000' );
    $style_vars .= sprintf(
        '--masonry-cols:%d;--masonry-gap:%dpx;--masonry-padding:%dpx;--masonry-overlay-r:%d;--masonry-overlay-g:%d;--masonry-overlay-b:%d;--masonry-overlay-opacity:%.2f;--masonry-text-color:%s;--masonry-text-size:%d%%;--masonry-button-bg:%s;--masonry-button-text:%s;',
        esc_attr( $attributes['masonryColumns'] ?? 4 ),
        esc_attr( $attributes['masonryGap'] ?? 8 ),
        esc_attr( $attributes['masonryPadding'] ?? 0 ),
        $overlay_rgb['r'],
        $overlay_rgb['g'],
        $overlay_rgb['b'],
        ( esc_attr( $attributes['masonryOverlayOpacity'] ?? 50 ) / 100 ),
        esc_attr( $attributes['masonryTextColor'] ?? '#ffffff' ),
        esc_attr( $attributes['masonryTextSize'] ?? 100 ),
        esc_attr( $attributes['masonryButtonBg'] ?? '#ffffff' ),
        esc_attr( $attributes['masonryButtonText'] ?? '#000000' )
    );
} elseif ( $is_split ) {
    $style_vars .= sprintf(
        '--split-cols:%d;',
        esc_attr( $attributes['splitColumns'] ?? 2 )
    );
} else {
    $style_vars .= sprintf(
        'background-color:%s;color:%s;',
        esc_attr( $attributes['backgroundColor'] ?? '#ffffff' ),
        esc_attr( $attributes['textColor'] ?? '#333333' )
    );
}

$wrapper_attrs = get_block_wrapper_attributes( [
    'class'           => implode( ' ', $wrapper_classes ),
    'style'           => $style_vars,
    'data-view-mode'  => $view_mode,
    'data-categories' => esc_attr( $attributes['categories'] ?? '' ),
    'data-tags'       => esc_attr( $attributes['tags'] ?? '' ),
    'data-per-page'   => esc_attr( $attributes['postsPerPage'] ?? 6 ),
    'data-excerpt-length' => esc_attr( $attributes['excerptLength'] ?? 150 ),
] );
?>
<div <?php echo $wrapper_attrs; // phpcs:ignore ?>>
    <div class="<?php echo $is_masonry ? 'wp-feed-display__masonry' : ( $is_split ? 'wp-feed-display__split' : 'wp-feed-display__grid' ); ?>">
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
