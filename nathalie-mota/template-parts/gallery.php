<?php
/**
 * Template part for displaying a gallery of photos
 *
 * @package Nathalie_Mota
 */

$photos = $args['photos'];

if ($photos->have_posts()) :
    while ($photos->have_posts()) : $photos->the_post();
        get_template_part('template-parts/photo-item');
    endwhile;
    wp_reset_postdata();
else :
    echo '<p>' . __('No photos found', 'nathalie-mota') . '</p>';
endif;
?>
