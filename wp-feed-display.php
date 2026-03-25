<?php
/**
 * Plugin Name: WP Feed Display
 * Description: Muestra los posts del sitio en un feed con carga lazy, imagen destacada, extracto y tags. Integrado como bloque Gutenberg configurable.
 * Version: 1.0.1
 * Author: Axel
 * Text Domain: wp-feed-display
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'WP_FEED_DISPLAY_VERSION', '1.0.0' );
define( 'WP_FEED_DISPLAY_PATH', plugin_dir_path( __FILE__ ) );
define( 'WP_FEED_DISPLAY_URL', plugin_dir_url( __FILE__ ) );

require_once WP_FEED_DISPLAY_PATH . 'includes/class-feed-rest-api.php';

add_action( 'init', function () {
    $build_dir = WP_FEED_DISPLAY_PATH . 'build/feed-display';
    if ( is_dir( $build_dir ) ) {
        register_block_type( $build_dir );
    } else {
        register_block_type( WP_FEED_DISPLAY_PATH . 'src/feed-display' );
    }
} );

add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_admin() ) {
        wp_register_script(
            'wp-feed-display-lazy',
            WP_FEED_DISPLAY_URL . 'assets/js/lazy-load.js',
            [],
            WP_FEED_DISPLAY_VERSION,
            true
        );
    }
} );
