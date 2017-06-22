/**
 * Global namespace
 */
var APP = APP || {};


APP.positionList = (function () {
	var self = {
		defaults: {},
		instance: {}
	}

	class PositionList {
		/**
		 * Constructor function
		 * @param { Jquery } 	$element 	Module element
		 * @param { Object } 	options  	Module options
		 */
		constructor ($element, options) {
			this.$element = $element;
			this.options = $.extend(true, {}, self.defaults, options);

			this.DOM = {
				$listContainer: $element.find('.js-list-container'),
				$addNewBtn: $element.find('.js-add-new-btn')
			}

			// Get and render positions
			this.getPositions((positions) => {
				this.renderPositions(positions);
			});

			// Positions template
			let source = $('.js-positions-template').html();
			this.template = Handlebars.compile(source);

			this._initEvents();
		}

		/**
		 * Get positions form database
		 * @param  { Function } 	callback 	Callback function, accepts positions as argument
		 * @return { void }
		 */
		getPositions (callback) {
			APP.firebase.get(APP.CONFIG.URLS.positions, function (positions) {
				typeof callback === 'function' ? callback(positions) : null;
			});
		}

		/**
		 * Render positions list in DOM
		 * @return { void }
		 */
		renderPositions (data) {
			this.DOM.$listContainer.html(this.template(data));
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this;

			// New position
			that.DOM.$addNewBtn.on('click', function () {
				APP.position.instance.showModal();
			});

			// Positon changed
			$(document).on('position-saved position-deleted', function () {
				// Get positions
				that.getPositions((positions) => {
					that.renderPositions(positions);
				});
			});

			// Existing position
			that.$element.on('click', '.js-position', function (e) {
				e.preventDefault();

				let id = $(this).data('id');

				// Get position data
				APP.firebase.get(APP.CONFIG.URLS.positions + '/' + id, function (position) {
					position.id = id;
					APP.position.instance.showModal(position);
				});
			});
		}
	}

	/**
	 * Init module
	 * @param  	{ String } 		selector 	Jquery selector
	 * @param 	{ Object } 		options 	Module options
	 * @return 	{ Array } 					Array of istances	
	 */
	self.init = function (selector, options) {
		var $elements = $(selector),
			results = [];

		// Add modul methods to every element
		$elements.each(function(index, el) {
			var $this = $(this),
				positionList = $this.data('positionList');

			if (!positionList) {
				positionList = new PositionList ($this, options);
				self.instance = positionList;
				$this.data('positionList', positionList);
			}
			
			results.push(positionList);
		});

		return results;
	}


	return self;
}());