/**
 * Global namespace
 */
var APP = APP || {};


APP.position = (function () {
	var self = {
		defaults: {},
		instance: {}
	}

	class Position {
		/**
		 * Constructor function
		 * @param { Jquery } 	$element 	Module element
		 * @param { Object } 	options  	Module options
		 */
		constructor ($element, options) {
			this.$element = $element;
			this.options = $.extend(true, {}, self.defaults, options);

			this.DOM = {
				$form: $element.find('.js-form'),
				$colorpicker: $element.find('.js-colorpicker'),
				$saveBtn: $element.find('.js-save-btn'),
				$deleteBtn: $element.find('.js-delete-btn')
			}

			// Validate form
			this.validator = this.DOM.$form.validate({
				rules: {
					name: { alpha: true }
				}
			});

			this._initModules();
			this._initEvents();
		}

		/**
		 * Show position modal
		 * @param  { Object } 	data 	Employee data
		 * @return { void }
		 */
		showModal (data) {
			APP.helpers.populateData(this.DOM.$form, data);

			// Set color
			if (data && data.color) {
				$.jPicker.List[0].color.active.val('hex', data.color);
			} else {
				$.jPicker.List[0].color.active.val('hex', '000000');
			}

			// Delete btn
			if (data) {
				this.DOM.$deleteBtn.show();
			} else {
				this.DOM.$deleteBtn.hide();
			}

			this.$element.modal();
		}

		/**
		 * Hide position modal
		 * @return { void }
		 */
		hideModal () {
			this.$element.modal('hide');
		}

		/**
		 * Reset modal form and validation
		 * @return { void }
		 */
		resetForm () {
			this.validator.resetForm();
			this.DOM.$form[0].reset();
		}

		/**
		 * Additional modules
		 * @return { void }
		 */
		_initModules () {
			this.jpicker = this.DOM.$colorpicker.jPicker({
				window: {
					expandable: true,
					position: {
						x: 'center',
						y: 'center'
					},
					effects: {
						type: 'show',
						speed: {
							show: 0,
							hide: 0
						}
					}
				},
				images: {
				    clientPath: '/images/jpicker/'
				}
			});
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this;

			// Save position
			that.DOM.$saveBtn.on('click', function () {
				if (that.DOM.$form.valid()) {
					let data = that.DOM.$form.serializeObject(),
						id = data.id;

					delete data.id;

					if (id == -1) {
						// Add position
						APP.firebase.add(APP.CONFIG.URLS.positions, data, function (position) {
							that.hideModal();
							that.$element.trigger('position-saved', position);
						});
					} else {
						// Update position
						APP.firebase.update(APP.CONFIG.URLS.positions + '/' + id, data, function (position) {
							that.hideModal();
							that.$element.trigger('position-saved', position);
						});
					}
				}
			});

			// Delete position
			that.DOM.$deleteBtn.on('click', function () {
				let data = that.DOM.$form.serializeObject(),
					id = data.id;

				APP.firebase.delete(APP.CONFIG.URLS.positions + '/' + id, function (position) {
					that.hideModal();
					that.$element.trigger('position-deleted', position);
				});
			});

			// Hide modal
			that.$element.on('hide.bs.modal', function () {
				that.resetForm();
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
				position = $this.data('position');

			if (!position) {
				position = new Position ($this, options);
				self.instance = position;
				$this.data('position', position);
			}
			
			results.push(position);
		});

		return results;
	}


	return self;
}());