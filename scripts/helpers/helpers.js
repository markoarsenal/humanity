/**
 * Global namespace
 */
var APP = APP || {};


APP.helpers = (function () {
	var $topOffsetElements = $('.js-top-offset');

	hideOnBlur('js-hide-on-blur');

	/**
	 * Submit form with enter
	 * Add js-submit-with-enter class on text inputs,
	 * js-form-container on form and
	 * js-submit-btn on submit button
	 */
	(function () {
		$(document).on('keypress', '.js-submit-with-enter', function (e) {
			var code = e.keyCode || e.which;

			if (code === 13 && !e.shiftKey) {
				e.preventDefault();
				$(this).closest('.js-form-container').find('.js-submit-btn').trigger('click');
			}
		});
	}());

	/**
	 * Hide element when is clicked outside of it
	 * @param  { String } 	className 	Element's class (js-hide-on-blur by default)
	 * @return { void }
	 */
	function hideOnBlur (className, excludeClassName) {
		$(document).on('click', function (e) {
			var $this = $(e.target);

			if (excludeClassName) {
				if (!$this.hasClass(className) && $this.closest('.' + className).length === 0
					&& !$this.hasClass(excludeClassName) && $this.closest('.' + excludeClassName).length === 0) {
					$('.' + className).hide();
				}
			} else {
				if (!$this.hasClass(className) && $this.closest('.' + className).length === 0) {
					$('.' + className).hide();
				}
			}
		});
	}

	return {
		/**
		 * Function for showing and hiding loader
		 * @param  { String } 	option    Show or hide
		 */
		loader: function (option) {
			var $loader = $('#loadingPanel');

			if (option === 'show') {
				$loader.velocity('fadeIn', 100);
			} else if (option === 'hide') {
				$loader.velocity('fadeOut', 100);
			}
		},

		/**
		 * Get hash value by key
		 * @param  { String }   key     Hash name
		 * @return { String }           Hash value
		 */
		getHashValue: function (key) {
			var hash = location.hash.match(new RegExp(key + '=([^&]*)'));

			if (location.hash && hash) {
				return hash[1];
			}

			return null;
		},

		/**
		 * Check if string starts with prefix
		 * @param  { String } 	string 	Given string
		 * @param  { String } 	prefix 	Prefix to check
		 * @return { Boolean }        	Prefix is on string start or not :/
		 */
		stringStartsWith: function (string, prefix) {
			return string.slice(0, prefix.length) == prefix;
		},

		/**
		 * Returns a function, that, as long as it continues to be invoked, will not
		 * be triggered. The function will be called after it stops being called for
		 * N milliseconds. If `immediate` is passed, trigger the function on the
		 * leading edge, instead of the trailing. https://davidwalsh.name/javascript-debounce-function
		 * @param  { Function } 	func      	Function to debounce
		 * @param  { Number } 		wait      	Wait time
		 * @param  { Boolean } 		immediate 	Call given function immediate
		 */
		debounce: function (func, wait, immediate) {
			var timeout;

			return function () {
				var that = this,
					args = arguments,
					callNow = immediate && !timeout;

				var later = function () {
					timeout = null;
					if (!immediate) {
						func.apply(that, args);
					}
				};

				clearTimeout(timeout);
				timeout = setTimeout(later, wait);

				if (callNow) {
					func.apply(that, args);
				}
			};
		},

		/**
		 * @returns Object with viewport size
		 */
		viewport: function () {
			var e = window,
				a = 'inner';

			if (!('innerWidth' in window)) {
				a = 'client';
				e = document.documentElement || document.body;
			}

			return { width: e[a + 'Width'], height: e[a + 'Height'] };
		},

		/**
		 * Function for checking does device has touch screen
		 * @return Boolean
		 */
		isTouchDevice: function () {
			return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
		},

		/**
		 * Check is mobile device
		 * @return { Boolean } 	True/false
		 */
		isMobileDevice: function () {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		},

		/**
		 * Add or replace timestamp
		 * @param { String }    source          String to add/replace timestamp (for example image src)
		 * @param { String }    timestampName   Timestamp var name
		 */
		addReplaceTimestamp: function (source, timestampName) {
			var splittedSourceArray = source.split('?'),
				sourceCore = splittedSourceArray[0],
				sourceParams = splittedSourceArray[1],
				newSource = '',
				newSourceParams = '';

			if (sourceParams) {
				var paramsArray = sourceParams.split('&'),
					indexForRemove = -1;

				// Find timestamp
				for (var i = 0; i < paramsArray.length; i++) {
					if (paramsArray[i].substring(0, timestampName.length) === timestampName) {
						indexForRemove = i;
					}
				}

				// Remove timestamp
				if (indexForRemove !== -1) {
					paramsArray.splice(indexForRemove, 1);
				}

				// Concat params
				for (var j = 0; j < paramsArray.length; j++) {
					newSourceParams += paramsArray[j] + '&';
				}
			}

			// Recreate full source and add timestamp
			var timestamp = (new Date()).getTime();

			newSource += sourceCore + '?' + newSourceParams;
			newSource += timestampName + '=' + timestamp;

			return newSource;
		},

		/**
		 * Generate guid
		 * @return { String } 	Guid
		 */
		guid: function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		},

		/**
		 * Populate data into form
		 * @param  { Object } 	data 	Data to populate
		 * @return { void }
		 */
		populateData: function ($form, data) {
			for (var i in data) {
				$form.find('[name=' + i + ']').val(data[i]);
			}
		},

		/**
		 * Calculate height of absolute or fixed positioned elements
		 * @return { Number } 	Height
		 */
		calculateTopOffset: function () {
			var height = 0;

			$topOffsetElements.each(function() {
				var $this = $(this);

				if ($this.isElementInViewport() === true) {
					height += $this.outerHeight();
				}
			});

			return height;
		},

		hideOnBlur: hideOnBlur
	};
}());