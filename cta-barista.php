<?php

/*
	Plugin Name: CTA Barista
	Description: A kick-ass Call-To-Action bar, done the right way!
	Version: 1.0
	Author: GRAFIK
	Author URI: http://www.grafik.com/
*/

	defined('ABSPATH') or die('#NiceTry');

	class CTA_Barista {

		function __construct() {

			// Add event handlers...
			add_action( 'admin_menu', array( $this, 'admin_menu') );
			add_action( 'admin_head', array( $this, 'settings_css') );
			add_action( 'wp_footer', array( $this, 'client_output' ) );

		}

		function admin_menu() {

			// Add options page handler...
			add_options_page('CTA Barista: Settings', 'CTA Barista', 'manage_options', 'cta-barista', array($this, 'settings_page'));

		}

		function settings_css() {

			if( !empty( $_GET['page'] ) && $_GET['page'] == 'cta-barista' ) {
				echo '<link rel="stylesheet" type="text/css" href="'.plugin_dir_url(__FILE__).'cta-barista-admin.css" />';
			}

		}

		function settings_page() {

			// Enforce capabilities...
			if( !current_user_can( 'manage_options' ) ) return false;

			// Buffered output...
			$HTML = '<h1>CTA Barista: Settings</h1>';

			// Retrieve Stored Values...
			$PLUGIN_OPTIONS = get_option( 'cta-barista' );

			$HTML .=
			'<div class="cta-barista-debug">'.
				'$PLUGIN_OPTIONS:'.print_r($PLUGIN_OPTIONS,true)."\n".
			'</div>';

			$HTML .=
			'<div class="cta-barista-debug">'.
				'$_POST:'.print_r($_POST,true)."\n".
			'</div>';

			// Submit form...
			if( isset( $_POST['cta-barista-admin-nonce'] ) ) {

				// Check submit validity...
				if( wp_verify_nonce( $_POST['cta-barista-admin-nonce'], 'cta-barista-admin-nonce' ) ) {

					// Get current user...
					$PLUGIN_USER = wp_get_current_user();

					// Format data for storage...
					$PLUGIN_OPTIONS = array(
						'AutoRotation' => (int)$_POST['AutoRotation'],
						'BarVisibility' => (int)$_POST['BarVisibility'],
						'CollapseMode' => (int)$_POST['CollapseMode'],
						'DomRelation' => (int)$_POST['DomRelation'],
						'LastUpdate' => array(
							'When' => time(),
							'Who' => $PLUGIN_USER->user_login
						),
						'Messages' => array(),
						'OffsetElement' => sanitize_text_field( $_POST['OffsetElement'] ),
						'OffsetMethod' => (int)$_POST['OffsetMethod'],
						'TargetElement' => sanitize_text_field( $_POST['TargetElement'] )
					);

					// Format the dynamic input data...
					if(!empty($_POST['Message'])) {
						foreach($_POST['Message'] as $key => $val) {
							$PLUGIN_OPTIONS['Messages'][$key] = array(
								'MessageText' => $val['MessageText'],
								'ButtonText' => $val['ButtonText'],
								'DestinationURL' => $val['DestinationURL'],
								'Disabled' => @$val['Disabled'] == 'on' ? 1 : 0,
								'Order' => $val['Order'],
								'URLTarget' => $val['URLTarget']
							);
						}
					}

					// Store data...
					update_option( 'cta-barista', $PLUGIN_OPTIONS );

					// Feedback okay!
					$HTML .= '<div class="cta-barista-options-feedback-okay">Settings updated!</div>';

				} else {

					// Feedback fail...
					$HTML .= '<div class="cta-barista-options-feedback-fail">Settings failed to update...</div>';

				}

			}

			// Form controls...
			$HTML .=
			wp_nonce_field( 'cta-barista-admin-nonce', 'cta-barista-admin-nonce', false, false ).
			'<br/>'.
			'<p>CTA Barista is a flexible, light-weight notification and call-to-action bar solution that works with any layout, even with fixed-positioned navigations!</p>'.
			'<table>'.
				'<tr>'.
					'<td style="width:50%">'.
						'<p><strong>Offset Element:</strong></p>'.
						'<p><input type="text" name="OffsetElement" /></p>'.
						'<em>Select an element to add height to when the bar is visible.</em>'.
					'</td>'.
					'<td style="width:50%">'.
						'<p><strong>Offset Method:</strong></p>'.
						'<p><select name="OffsetMethod"><option value="0">Disabled</option><option value="1">(Height + Top Margin) as Margin</option><option value="2">(Height + Top Margin) as Padding</option></select></p>'.
						'<em>CTA Barista uses a negative top margin equal to the current height of the bar when collapsed from view. The bar height plus the negative margin can affect a jQuery selected target to add this space to your document to prevent content from being covered up while the bar is visible.</em>'.
					'</td>'.
				'</tr>'.
				'<tr>'.
					'<td style="width:50%">'.
						'<p><strong>Select Element:</strong></p>'.
						'<p><input type="text" name="TargetElement" /></p>'.
						'<em>Use a jQuery selection statement (for best results use an ID) to determine where your bar is inserted into your document tree. If an element cannot be targetted by the selection statement, the bar will not be inserted.</em>'.
					'</td>'.
					'<td style="width:50%">'.
						'<p><strong>Element Relation:</strong></p>'.
						'<p><select name="DomRelation"><option value="0">Append as Child</option><option value="1">Prepend as Child</option><option value="2">After as Sibling</option><option value="3">Before as Sibling</option></select></p>'.
						'<em>Choose the relative position in the DOM (document object model) where the CTA Barista root element will be rendered. Children will be inserted inside the Select Element, where as siblings will sit beside the Select Element.</em>'.
					'</td>'.
				'</tr>'.
			'</table>'.
			'<hr/>'.
			'<table>'.
				'<tr>'.
					'<td style="width:33.3333%">'.
						'<p><strong>Collapse:</strong></p>'.
						'<p><select name="CollapseMode"><option value="0">Collapse Disabled</option><option value="1">Collapse for Session</option><option value="2">Collapse Permanently</option></select></p>'.
						'<em>Allow your users to courtesy of being able to hide the bar away from their view. You can either reset the bar visibility per-session (when they close their browser, the bar will again show on their return), or you can allow the visibility to persist between when the user visits your site multiple times.</em>'.
					'</td>'.
					'<td style="width:33.3333%">'.
						'<p><strong>Visibility:</strong></p>'.
						'<p><select name="BarVisibility"><option value="0">None</option><option value="1">All Posts and Pages</option><option value="2">Posts Only</option><option value="3">Pages Only</option><option value="4">Front Page Only</option></select></p>'.
						'<em>Selectively determine where to display the bar.</em>'.
					'</td>'.
					'<td style="width:33.3333%">'.
						'<p><strong>Auto-Rotation:</strong></p>'.
						'<p><select name="AutoRotation"><option value="0">Disabled</option><option value="1">Enabled, Slow at 120 WPM</option><option value="2">Enabled, Fast at 400 WPM</option></select></p>'.
						'<em>While disabled, the visitor must manually click through multiple messages with the forward and back buttons. When enabled, the bar will automatically rotate between multiple messages if they exist, using the selected reading speed as a delay before displaying the next message in the list.</em>'.
					'</td>'.
				'</tr>'.
			'</table>'.
			'<hr/>'.
			'<table id="cta-barista-options-messages">'.
				'<thead><tr><th>Message Text</th><th>Button Text</th><th>Destination URL</th><th>Target</th><th>Hide</th><th>Order</th><th>&nbsp;</th></tr></thead>'.
				'<tfoot><tr><td colspan="7"><button type="button" id="cta-barista-options-messages-create" class="cta-barista-button">Create New</button></td></tr></tfoot>'.
				'<tbody><tr><td colspan="7">No messages...</td></tr></tbody>'.
			'</table>';

			// Submit Button (string concat inside empty() compatibility fix)...
			$SavedMessage = 'Nothing saved yet...';
			$WhenWho = $PLUGIN_OPTIONS['LastUpdate']['When'].$PLUGIN_OPTIONS['LastUpdate']['Who'];
			if(!empty($WhenWho)) {
				$SavedMessage = $PLUGIN_OPTIONS['LastUpdate']['Who'].' &mdash; '.date('Y/m/d h:i:s A',$PLUGIN_OPTIONS['LastUpdate']['When']);
			}

			// Submit button...
			$HTML .=
			'<button type="submit" class="cta-barista-button button-primary">Save Settings</button>'.
			'<span class="cta-barista-lastupdate">'.
				'<strong>Last Update:</strong>'.$SavedMessage.
			'</span>';

			// Plugin Credits...
			$PLUGIN_DATA = get_plugin_data( __FILE__ );
			$HTML .=
			'<hr/>'.
			'<div class="plugin-credits">'.
				'<p><strong>'.$PLUGIN_DATA['Title'].' v'.$PLUGIN_DATA['Version'].'</strong></p>'.
				'<p>&copy;'.date( 'Y' ).' '.$PLUGIN_DATA['AuthorName'].'. All rights reserved.</p>'.
			'</div>';

			// Output...
			echo
			'<form action="" method="POST" id="CTA-Barista">'.$HTML.'</form>'.
			'<script>var CTABaristaJSON = '.( is_array($PLUGIN_OPTIONS) ? json_encode($PLUGIN_OPTIONS, JSON_HEX_TAG) : $PLUGIN_OPTIONS ).';</script>'.
			'<script src="'.plugin_dir_url(__FILE__).'cta-barista-admin.js"></script>';

		}

		function client_output() {

			// Retrieve Stored Values...
			$PLUGIN_OPTIONS = get_option('cta-barista');

			// Save data present?
			if(empty($PLUGIN_OPTIONS)) {
				return false;
			}

			// Turn to array...
			if(!is_array($PLUGIN_OPTIONS)) {
				$PLUGIN_OPTIONS = json_decode($PLUGIN_OPTIONS);
			}

			// Sanitize...
			unset($PLUGIN_OPTIONS['LastUpdate']);
			if(!empty($PLUGIN_OPTIONS['Messages'])) {
				foreach($PLUGIN_OPTIONS['Messages'] as $key => $val) {
					if($val['Disabled'] == 1) unset($PLUGIN_OPTIONS['Messages'][$key]);
				}
			}

			// Should we output?
			$PLUGIN_RENDER = false;
			switch($PLUGIN_OPTIONS['BarVisibility']) {
				case "1": $PLUGIN_RENDER = true; break; // All
				case "2": if(!is_page()) $PLUGIN_RENDER = true; break; // Posts Only
				case "3": if(is_page()) $PLUGIN_RENDER = true; break; // Pages Only
				case "4": if(is_front_page() || is_home()) $PLUGIN_RENDER = true; break; // Front Only
			}

			// Output...
			if($PLUGIN_RENDER) {
				echo
				'<script>var CTABaristaJSON = '.( is_array($PLUGIN_OPTIONS) ? json_encode($PLUGIN_OPTIONS, JSON_HEX_TAG) : $PLUGIN_OPTIONS ).';</script>'.
				'<script src="'.plugin_dir_url(__FILE__).'cta-barista-client.js"></script>';
			}

		}

	}

	// Instantiate...
	new CTA_Barista;

?>