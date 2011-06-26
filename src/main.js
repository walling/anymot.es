/**
 * IR codes for different devices.
 */
var ir_codes = {
	// IR codes for NEC RD-427E, 189728D7 189710ef.
	'NEC RD-427E': {
		buttons: {
			power_off:         0x189728D7,
			power_on:          0x189710EF,
			magnify_plus:      0x1897916E,
			pic_mute:          0x1897E21D,
			page_up:           0x189754AB,
			magnify_minus:     0x189751AE,
			page_down:         0x1897D42B,
			menu:              0x1897629D,
			arrow_up:          0x18971DE2,
			arrow_left:        0x18977D82,
			arrow_right:       0x18975DA2,
			arrow_down:        0x18973DC2,
			enter:             0x1897E817,
			exit:              0x1897A45B,
			mouse_left_click:  0x189734CB,
			mouse_right_click: 0x1897B44B,
			video:             0x1897C03F,
			computer_1:        0x189720DF,
			auto_adj:          0x1897609F,
			s_video:           0x1897639C,
			computer_2:        0x1897A05F,
			lamp_mode:         0x18976897,
			volume_plus:       0x189712ED,
			aspect:            0x189708F7,
			help:              0x1897728D,
			volume_down:       0x1897926D,
			picture:           0x1897B04F,
			freeze:            0x1897B04F
		}
	},
	// Our second projector.
	'ASK ProXima': {
		buttons: {
			volume_up:   0xE17210EF,
			volume_down: 0xE17220DF
		}
	},
	// Our stereo.
	'Yamaha RX-396RDS': {
		buttons: {
			power_on_off: 0x5EA1F807,
			volume_up:    0x5EA158A7,
			volume_down:  0x5EA1D827
		}
	}
};


var use_cloud = (location.search === '?c' || location.search === '?cloud' || location.href.substring(0, 17) === 'http://anymot.es/');
var noop = function() {};
var request_ok = noop;
var counter = 0;

/**
 * Emit IR codes.
 */
function irda_emit(code, callback) {
	// Callback are optional.
	callback = callback || noop;

	var failure_timer;
	counter++;

	// Create JSONP script element to inject.
	var script_element = document.createElement('script');
	script_element.type = 'text/javascript';
	script_element.async = true;
	if (use_cloud) {
		script_element.src = 'http://node.lumus.dk:8123/id.irda?id=' + code + '&count=' + counter;
	} else {
		script_element.src = 'http://c' + counter + '@192.168.1.135/id.irda?id=' + code;
	}

	// Funktion to invoke callback with result and cleanup.
	request_ok = function(data) {
		request_ok = noop; // The result must only be provided once.

		// Cleanup after both success or failure.
		clearTimeout(failure_timer);
		script_element.onreadystatechange = undefined;
		script_element.onerror = undefined;
		script_element.parentNode.removeChild(script_element);
		script_element = undefined; // So MSIE does not leak memory.

		// Invoke callback with either error or actual data.
		if (data === 'error') {
			callback(new Error('IRDA request failed (code 0x' + code.toString(16) + ')'));
		} else {
			callback(null);
		}
	};
	var failure = function() {
		request_ok('error');
	};

	// Setup timer for failure. When it triggers, we assume the request failed.
	var failure_timer = setTimeout(failure, 500);

	// Fail faster if we know that the script is supposed to be executed.
	script_element.onreadystatechange = function() {
		if (this.readyState === 'loaded' || this.readyState === 'complete') {
			failure();
		}
	};
	script_element.onerror = failure;

	// Inject script element, which in turn creates the JSONP request.
	document.body.appendChild(script_element);
};


/*  // IR repeating is not implemented right now. //

var irda_repeat_speed = 200;
var irda_repeating = null;

var irda_on_error = null;

function irda_start(code) {
	irda_end();
	irda_repeating = setInterval(function() {
		irda_emit(code, function(err) {
			if (err && irda_on_error) {
				irda_on_error(err);
			}
		});
	}, irda_repeat_speed);
}

function irda_end() {
	if (irda_repeating !== null) {
		clearInterval(irda_repeating);
	}
}
*/


function map_key(name, code) {
	$('#' + name).bind('touchstart mousedown', function() {
		irda_emit(code);
	});
}

$(function() {
	setTimeout(function() {
		$('#splash-screen').fadeOut('slow');
	}, 5000);

	var device_button = ir_codes['Yamaha RX-396RDS'].buttons;

	map_key('on-off',      device_button.power_on_off);
	map_key('volume-up',   device_button.volume_up  );
	map_key('volume-down', device_button.volume_down);
});
