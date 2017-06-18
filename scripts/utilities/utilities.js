/**
 * Global namespace
 */
var APP = APP || {};


APP.util = (function () {
	/**
	 * Smart string shortening
	 * @param  { Integer }  n                    Number of characters to show
	 * @param  { Boolean }  useWordBoundary      Don't cut the word
	 * @return { String }                        Shorten string
	 */
	String.prototype.trunc = String.prototype.trunc || function (n, useWordBoundary) {
		var toLong = this.length > n,
			s_ = toLong ? this.substr(0, n - 1) : this;

		s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
		s_ = s_.toString();

		return toLong ? s_ + '...' : s_;
	}

	/**
	 * Replace placeholders in string by passed vars
	 * @return { String } 	Formated string
	 */
	String.prototype.format = String.prototype.format || function () {
		// The string containing the format items (e.g. "{0}") will and always has to be the first argument.
		var that = this;
		
		// Start with the second argument (i = 1)
		for (var i = 0; i < arguments.length; i++) {
			// "gm" = RegEx options for Global search (more than one instance)
			// and for Multiline search
			var regEx = new RegExp("\\{" + i + "\\}", "gm");

			if (typeof arguments[i] !== 'undefined') {
				that = that.replace(regEx, arguments[i]);
			}
		}

		// Remove unused arguments in url
		var urlArr = that.split('?');

		function _filterUrlParams (arr) {
			for (var a in arr) {
				if (arr[a].indexOf('{') !== -1) {
					// Remove item
					var index = arr.indexOf(arr[a]);
					arr.splice(index, 1);
				}
			}
		}

		if (urlArr[1]) {
			var urlParams = urlArr[1].split('&'),
				paramsLenght = urlParams.length;

			while (paramsLenght--) {
				_filterUrlParams(urlParams);
			}

			return urlParams.length > 0 ? urlArr[0] + '?' + urlParams.join('&') : urlArr[0];
		}
		
		return that;
	}

	/**
	 * Round number to n decimals
	 * @param  { Number } 	decimals 	Number of decimals
	 * @return { Number }          		Rounded number
	 */
	Number.prototype.round = function (decimals) {
		return Number(Math.round(this + 'e' + decimals) + 'e-' + decimals);
	}

	/**
	 * Escape HTML (<input />)
	 * @return {[type]} [description]
	 */
	String.prototype.escapeHTML = function () {
		return (this.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;'));
	}

	/**
	 * Serialize form into javascript object
	 * @return { Object }   Serialized form as javascript object
	 */
	$.fn.serializeObject = function () {
		var o = {},
			a = this.serializeArray();

		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});

		return o;
	}

	/**
	 * Checks is it element in viewport
	 * @param  { Number } 	distanceOffset if element can be partialy visible
	 * @return { Boolean } 	Return true if element is in viewport, false otherwise
	 */
	$.fn.isElementInViewport = function (distanceOffset) {
		var element = this[0],
			r, html, offsetBottom;

		if (!element || element.nodeType !== 1) {
			return false;
		}

		html = document.documentElement;
		r = element.getBoundingClientRect();

		offsetBottom = distanceOffset || 0;

		return (!!r
			&& r.bottom >= 0
			&& r.right >= 0
			&& r.top - offsetBottom <= html.clientHeight
			&& r.left - r.width <= html.clientWidth
		);
	}

	/**
	 * Debounced resize
	 * http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
	 * $(window).smartresize(function () {});
	 */
	;(function ($, sr) {
		var debounce = function (func, threshold, execAsap) {
			var timeout;

			return function debounced () {
				var that = this,
					args = arguments;

				function delayed () {
					if (!execAsap) {
						func.apply(that, args);
					}

					timeout = null;
				}

				if (timeout) {
					clearTimeout(timeout);
				} else if (execAsap) {
					func.apply(that, args);
				}

				timeout = setTimeout(delayed, threshold || 200);
			}
		}

		// smartresize
		jQuery.fn[sr] = function (fn) {
			return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
		}
	}(jQuery, 'smartresize'));


	return {
		/**
		 * Create namespace
		 * @param  { String }   nsString    New namespace
		 * @return { Object }               Created namespace
		 */
		createNamespace: function (nsString) {
			var parts = nsString.split('.'),
				parent = APP,
				i;

			// Uklonimo naziv našeg namespacea iz stringa:
			if (parts[0] === "APP") {
				parts = parts.slice(1);
			}

			for (i = 0; i < parts.length; i += 1) {
				// Kreiramo properti ako ne postoji:
				if (typeof parent[parts[i]] === "undefined") {
					parent[parts[i]] = {};
				}

				parent = parent[parts[i]];
			}

			return parent;
		},

		/**
		 * Ajax with loader and some default settings
		 * @param  { Object }       options     Ajax options
		 * @param  { Function }     success     Success callback
		 * @param  { Function }     error       Error callback
		 * @param  { Function }     complete    Complete callback
		 * @return { Function }                 Ajax function
		 */
		ajax: function (options, success, error, complete) {
			var loaderTimeout = setTimeout(function () {
				APP.helpers.loader('show');
			}, 200);

			var ajaxOpts = $.extend(true, {}, {
					type: 'POST',
					dataType: 'json',
					success: function (response) {
						// Success callback
						if (typeof success === "function") {
							success(response.data);
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						if (typeof error === "function") {
							error(jqXHR, textStatus, errorThrown);
						}
					},
					complete: function () {
						// Hide loader
						clearTimeout(loaderTimeout);
						APP.helpers.loader('hide');

						if (typeof complete === "function") {
							complete();
						}
					}
				}, options);
			

			return $.ajax(ajaxOpts);
		},

		/**
		 * Check is it number
		 * @param  { Any type }  value Value to check
		 * @return { Boolean }       True if value is number, false otherwise
		 */
		isNumber: function (value) {
			return !isNaN(parseFloat(value)) && isFinite(value);
		}
	}
}());