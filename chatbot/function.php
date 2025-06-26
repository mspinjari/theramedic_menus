<?php
/**
 * Theme functions and definitions
 *
 * @package HelloElementor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'HELLO_ELEMENTOR_VERSION', '3.4.1' );
define( 'EHP_THEME_SLUG', 'hello-elementor' );

define( 'HELLO_THEME_PATH', get_template_directory() );
define( 'HELLO_THEME_URL', get_template_directory_uri() );
define( 'HELLO_THEME_ASSETS_PATH', HELLO_THEME_PATH . '/assets/' );
define( 'HELLO_THEME_ASSETS_URL', HELLO_THEME_URL . '/assets/' );
define( 'HELLO_THEME_SCRIPTS_PATH', HELLO_THEME_ASSETS_PATH . 'js/' );
define( 'HELLO_THEME_SCRIPTS_URL', HELLO_THEME_ASSETS_URL . 'js/' );
define( 'HELLO_THEME_STYLE_PATH', HELLO_THEME_ASSETS_PATH . 'css/' );
define( 'HELLO_THEME_STYLE_URL', HELLO_THEME_ASSETS_URL . 'css/' );
define( 'HELLO_THEME_IMAGES_PATH', HELLO_THEME_ASSETS_PATH . 'images/' );
define( 'HELLO_THEME_IMAGES_URL', HELLO_THEME_ASSETS_URL . 'images/' );

if ( ! isset( $content_width ) ) {
	$content_width = 800; // Pixels.
}

if ( ! function_exists( 'hello_elementor_setup' ) ) {
	/**
	 * Set up theme support.
	 *
	 * @return void
	 */
	function hello_elementor_setup() {
		if ( is_admin() ) {
			hello_maybe_update_theme_version_in_db();
		}

		if ( apply_filters( 'hello_elementor_register_menus', true ) ) {
			register_nav_menus( [ 'menu-1' => esc_html__( 'Header', 'hello-elementor' ) ] );
			register_nav_menus( [ 'menu-2' => esc_html__( 'Footer', 'hello-elementor' ) ] );
		}

		if ( apply_filters( 'hello_elementor_post_type_support', true ) ) {
			add_post_type_support( 'page', 'excerpt' );
		}

		if ( apply_filters( 'hello_elementor_add_theme_support', true ) ) {
			add_theme_support( 'post-thumbnails' );
			add_theme_support( 'automatic-feed-links' );
			add_theme_support( 'title-tag' );
			add_theme_support(
				'html5',
				[
					'search-form',
					'comment-form',
					'comment-list',
					'gallery',
					'caption',
					'script',
					'style',
				]
			);
			add_theme_support(
				'custom-logo',
				[
					'height'      => 100,
					'width'       => 350,
					'flex-height' => true,
					'flex-width'  => true,
				]
			);
			add_theme_support( 'align-wide' );
			add_theme_support( 'responsive-embeds' );

			/*
			 * Editor Styles
			 */
			add_theme_support( 'editor-styles' );
			add_editor_style( 'editor-styles.css' );

			/*
			 * WooCommerce.
			 */
			if ( apply_filters( 'hello_elementor_add_woocommerce_support', true ) ) {
				// WooCommerce in general.
				add_theme_support( 'woocommerce' );
				// Enabling WooCommerce product gallery features (are off by default since WC 3.0.0).
				// zoom.
				add_theme_support( 'wc-product-gallery-zoom' );
				// lightbox.
				add_theme_support( 'wc-product-gallery-lightbox' );
				// swipe.
				add_theme_support( 'wc-product-gallery-slider' );
			}
		}
	}
}
add_action( 'after_setup_theme', 'hello_elementor_setup' );

function hello_maybe_update_theme_version_in_db() {
	$theme_version_option_name = 'hello_theme_version';
	// The theme version saved in the database.
	$hello_theme_db_version = get_option( $theme_version_option_name );

	// If the 'hello_theme_version' option does not exist in the DB, or the version needs to be updated, do the update.
	if ( ! $hello_theme_db_version || version_compare( $hello_theme_db_version, HELLO_ELEMENTOR_VERSION, '<' ) ) {
		update_option( $theme_version_option_name, HELLO_ELEMENTOR_VERSION );
	}
}

if ( ! function_exists( 'hello_elementor_display_header_footer' ) ) {
	/**
	 * Check whether to display header footer.
	 *
	 * @return bool
	 */
	function hello_elementor_display_header_footer() {
		$hello_elementor_header_footer = true;

		return apply_filters( 'hello_elementor_header_footer', $hello_elementor_header_footer );
	}
}

if ( ! function_exists( 'hello_elementor_scripts_styles' ) ) {
	/**
	 * Theme Scripts & Styles.
	 *
	 * @return void
	 */
	function hello_elementor_scripts_styles() {
		$min_suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		if ( apply_filters( 'hello_elementor_enqueue_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor',
				get_template_directory_uri() . '/style' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( apply_filters( 'hello_elementor_enqueue_theme_style', true ) ) {
			wp_enqueue_style(
				'hello-elementor-theme-style',
				get_template_directory_uri() . '/theme' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}

		if ( hello_elementor_display_header_footer() ) {
			wp_enqueue_style(
				'hello-elementor-header-footer',
				get_template_directory_uri() . '/header-footer' . $min_suffix . '.css',
				[],
				HELLO_ELEMENTOR_VERSION
			);
		}
	}
}
add_action( 'wp_enqueue_scripts', 'hello_elementor_scripts_styles' );

if ( ! function_exists( 'hello_elementor_register_elementor_locations' ) ) {
	/**
	 * Register Elementor Locations.
	 *
	 * @param ElementorPro\Modules\ThemeBuilder\Classes\Locations_Manager $elementor_theme_manager theme manager.
	 *
	 * @return void
	 */
	function hello_elementor_register_elementor_locations( $elementor_theme_manager ) {
		if ( apply_filters( 'hello_elementor_register_elementor_locations', true ) ) {
			$elementor_theme_manager->register_all_core_location();
		}
	}
}
add_action( 'elementor/theme/register_locations', 'hello_elementor_register_elementor_locations' );

if ( ! function_exists( 'hello_elementor_content_width' ) ) {
	/**
	 * Set default content width.
	 *
	 * @return void
	 */
	function hello_elementor_content_width() {
		$GLOBALS['content_width'] = apply_filters( 'hello_elementor_content_width', 800 );
	}
}
add_action( 'after_setup_theme', 'hello_elementor_content_width', 0 );

if ( ! function_exists( 'hello_elementor_add_description_meta_tag' ) ) {
	/**
	 * Add description meta tag with excerpt text.
	 *
	 * @return void
	 */
	function hello_elementor_add_description_meta_tag() {
		if ( ! apply_filters( 'hello_elementor_description_meta_tag', true ) ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		$post = get_queried_object();
		if ( empty( $post->post_excerpt ) ) {
			return;
		}

		echo '<meta name="description" content="' . esc_attr( wp_strip_all_tags( $post->post_excerpt ) ) . '">' . "\n";
	}
}
add_action( 'wp_head', 'hello_elementor_add_description_meta_tag' );

// Settings page
require get_template_directory() . '/includes/settings-functions.php';

// Header & footer styling option, inside Elementor
require get_template_directory() . '/includes/elementor-functions.php';

if ( ! function_exists( 'hello_elementor_customizer' ) ) {
	// Customizer controls
	function hello_elementor_customizer() {
		if ( ! is_customize_preview() ) {
			return;
		}

		if ( ! hello_elementor_display_header_footer() ) {
			return;
		}

		require get_template_directory() . '/includes/customizer-functions.php';
	}
}
add_action( 'init', 'hello_elementor_customizer' );

if ( ! function_exists( 'hello_elementor_check_hide_title' ) ) {
	/**
	 * Check whether to display the page title.
	 *
	 * @param bool $val default value.
	 *
	 * @return bool
	 */
	function hello_elementor_check_hide_title( $val ) {
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$current_doc = Elementor\Plugin::instance()->documents->get( get_the_ID() );
			if ( $current_doc && 'yes' === $current_doc->get_settings( 'hide_title' ) ) {
				$val = false;
			}
		}
		return $val;
	}
}
add_filter( 'hello_elementor_page_title', 'hello_elementor_check_hide_title' );

/**
 * BC:
 * In v2.7.0 the theme removed the `hello_elementor_body_open()` from `header.php` replacing it with `wp_body_open()`.
 * The following code prevents fatal errors in child themes that still use this function.
 */
function pt_enqueue_chatbot_assets() {
    // Custom chatbot styles
    wp_enqueue_style('pt-chatbot-style', get_template_directory_uri() . '/chatbot/action-button.css');
    
    // Enqueue scripts as ES modules by adding type="module" to the script tag
    wp_enqueue_script('pt-chatbot-script', get_template_directory_uri() . '/chatbot/chatbot.js', array(), null, true);
    wp_enqueue_script('pt-review-bot', get_template_directory_uri() . '/chatbot/reviews-bot.js', array(), null, true);
    
    // Add inline script to add type="module" attribute to our scripts
    add_filter('script_loader_tag', 'pt_add_module_type', 10, 3);
}
add_action('wp_enqueue_scripts', 'pt_enqueue_chatbot_assets');

// Filter to add type="module" to our specific scripts
function pt_add_module_type($tag, $handle, $src) {
    // List of scripts to be loaded as modules
    $modules = array('pt-chatbot-script', 'pt-review-bot');
    
    if (in_array($handle, $modules)) {
        // Replace the script tag to include type="module"
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    
    return $tag;
}

function pt_chatbot_shortcode() {
    ob_start();
    ?>
    <div class="thera_fab-container">
        <div class="thera_fab shadow">
            <div class="thera_fab-content ">
                <i class="fas fa-headset"></i>
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="sub-button shadow">
            <span class="tooltip">Review us</span>
            <a href="#" id="reviewLink">
                <i class="fa-solid fa-star"></i>
            </a>
        </div>
        <div class="sub-button shadow">
            <span class="tooltip">Chat with us</span>
            <a href="#" id="chatLink">
                <i class="fa-regular fa-comments"></i>
            </a>
        </div>
    </div>

    <!-- Review Chatbot -->
    <div id="review-chatbot-container" class="pt-chatbot-wrapper">
        <div class="pt-chatbot" style="display: none;">
            <div class="pt-chatbot-header">
                <h3>Leave a Review</h3>
                <a class="pt-close-button"><i class="fa-solid fa-xmark"></i></a>
            </div>
            <div class="pt-chatbot-messages"></div>
        </div>
    </div>

    <!-- Main Chatbot -->
    <div id="main-chatbot-container" class="pt-chatbot-wrapper">
        <div class="pt-chatbot" style="display: none;">
            <div class="pt-chatbot-header">
                <h3>PT Clinic Assistance</h3>
                <a class="pt-close-button"><i class="fa-solid fa-xmark"></i></a>
            </div>
            <div class="pt-chatbot-messages"></div>
            <div class="pt-chatbot-input">
                <input type="text" placeholder="Type your message...">
                <a class="pt-send-button"><i class="fa-solid fa-paper-plane"></i></a>
            </div>
        </div>
    </div>

    <!-- Appointment Form Template -->
    <template id="appointment-form-template">
        <form id="appointment-form" style="display: none;max-width:100%">
            <h5 style="color:var(--e-global-color-text)">Let Us Assist You!<br><span style="font-size: 12px;line-height:14px;">Help Us Get to Know
                You, so that our team can contact you</span></h5>
            <div class="form-group">
                <label style="color:var(--e-global-color-text)">Full Name:</label>
                <input type="text" name="name" required>
                <div class="error-message"></div>
            </div>
            <div class="form-group">
                <label style="color:var(--e-global-color-text)">Phone Number:</label>
                <input type="tel" name="phone" required>
                <div class="error-message"></div>
            </div>
            <div class="form-group">
                <label style="color:var(--e-global-color-text)">Email:</label>
                <input type="email" name="email" required>
                <div class="error-message"></div>
            </div>
            <div class="form-group">
                <label style="color:var(--e-global-color-text)">Preferred Location:</label>
                <select name="location" required>
                    <option value="">Select location</option>
                </select>
                <div class="error-message"></div>
            </div>
            <div class="form-group">
                <label style="color:var(--e-global-color-text)">Comments/Special Requests:</label>
                <textarea name="comment" rows="3" placeholder="Any specific concerns or requests?"></textarea>
                <div class="error-message"></div>
            </div>
            <div class="form-buttons">
                <button type="submit" class="pt-send-button">Submit</button>
                <button type="button" class="pt-cancel-form">Cancel</button>
            </div>
        </form>
    </template>
    <?php
    return ob_get_clean();
}
add_shortcode('pt_chatbot', 'pt_chatbot_shortcode');

function custom_post_count_shortcode($atts) {
    // Shortcode attributes with default
    $atts = shortcode_atts(array(
        'category' => '', // Category slug
    ), $atts, 'custom_post_count');

    // Get posts count for the specified category
    if (!empty($atts['category'])) {
        $category = get_category_by_slug($atts['category']);
        if ($category) {
            return $category->count;
        } else {
            return 'Invalid category.';
        }
    }

    // If no category provided, return total post count
    return wp_count_posts()->publish;
}
add_shortcode('custom_post_count', 'custom_post_count_shortcode');


if ( ! function_exists( 'hello_elementor_body_open' ) ) {
	function hello_elementor_body_open() {
		wp_body_open();
	}
}



require HELLO_THEME_PATH . '/theme.php';

HelloTheme\Theme::instance();
