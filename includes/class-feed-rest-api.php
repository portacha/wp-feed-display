<?php
/**
 * REST API endpoint for lazy-loading feed posts.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WP_Feed_Display_REST_API {

    private $namespace = 'wp-feed-display/v1';

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        register_rest_route( $this->namespace, '/posts', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_posts' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'page'       => [
                    'default'           => 1,
                    'sanitize_callback' => 'absint',
                ],
                'per_page'   => [
                    'default'           => 6,
                    'sanitize_callback' => 'absint',
                ],
                'categories' => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'tags'       => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ] );
    }

    public function get_posts( $request ) {
        $page       = $request->get_param( 'page' );
        $per_page   = $request->get_param( 'per_page' );
        $categories = $request->get_param( 'categories' );
        $tags       = $request->get_param( 'tags' );

        $args = [
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];

        if ( ! empty( $categories ) ) {
            $args['category__in'] = array_map( 'absint', explode( ',', $categories ) );
        }

        if ( ! empty( $tags ) ) {
            $args['tag__in'] = array_map( 'absint', explode( ',', $tags ) );
        }

        $query = new WP_Query( $args );
        $posts = [];

        foreach ( $query->posts as $post ) {
            $thumbnail = get_the_post_thumbnail_url( $post->ID, 'medium_large' )
                ? get_the_post_thumbnail_url( $post->ID, 'medium_large' )
                : '';

            $post_tags = get_the_terms( $post->ID, 'post_tag' );
            $tag_list  = [];
            if ( $post_tags && ! is_wp_error( $post_tags ) ) {
                foreach ( $post_tags as $tag ) {
                    $tag_list[] = [
                        'name' => $tag->name,
                        'link' => get_tag_link( $tag->term_id ),
                    ];
                }
            }

            $posts[] = [
                'id'        => $post->ID,
                'title'     => get_the_title( $post ),
                'excerpt'   => get_the_excerpt( $post ),
                'thumbnail' => $thumbnail,
                'tags'      => $tag_list,
                'permalink' => get_permalink( $post ),
            ];
        }

        wp_reset_postdata();

        return rest_ensure_response( $posts );
    }
}

new WP_Feed_Display_REST_API();
