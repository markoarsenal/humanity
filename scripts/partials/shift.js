/**
 * Global namespace
 */
var APP = APP || {};


APP.shift = (function () {
	var self = {
		defaults: {},
		instance: {}
	}

	class Shift {
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
				$datetime: $element.find('.js-datetime'),
				$saveBtn: $element.find('.js-save-btn'),
				$deleteBtn: $element.find('.js-delete-btn')
			}

			// Validate form
			this.validator = this.DOM.$form.validate({
				rules: {
					name: { alpha: true },
					position: { alpha: true },
					shiftEnd: { greaterThan: '#shiftStart' }
				}
			});

			// Datepicker
			this.datepicker = null;

			this._initModules();
			this._initEvents();
		}

		/**
		 * Show employee modal
		 * @param  { Object } 	data 	Employee data
		 * @return { void }
		 */
		showModal (data) {
			APP.helpers.populateData(this.DOM.$form, data);

			// Delete btn
			if (data) {
				this.DOM.$deleteBtn.show();
			} else {
				this.DOM.$deleteBtn.hide();
			}

			this.$element.modal();
		}

		/**
		 * Hide employee modal
		 * @return { void }
		 */
		hideModal () {
			this.$element.modal('hide');
		}

		/**
		 * Additional modules
		 * @return { void }
		 */
		_initModules () {
			let that = this;

			// Datepicker
			that.DOM.$datetime.bootstrapMaterialDatePicker({
				format: 'MMM DD, YYYY hh:mm a',
				shortTime: true,
				switchOnClick: true
			});
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this;

			// Save employee
			that.DOM.$saveBtn.on('click', function () {
				if (that.DOM.$form.valid()) {
					// let data = that.DOM.$form.serializeObject(),
					// 	id = data.id;

					// delete data.id;

					// if (id == -1) {
					// 	// Add employee
					// 	APP.firebase.add(APP.CONFIG.URLS.employees, data, function (employee) {
					// 		that.hideModal();
					// 		that.$element.trigger('employee-saved', employee);
					// 	});
					// } else {
					// 	// Update employee
					// 	APP.firebase.update(APP.CONFIG.URLS.employees + '/' + id, data, function (employee) {
					// 		that.hideModal();
					// 		that.$element.trigger('employee-saved', employee);
					// 	});
					// }
				}
			});

			// Delete employee
			that.DOM.$deleteBtn.on('click', function () {
				// let data = that.DOM.$form.serializeObject(),
				// 	id = data.id;

				// APP.firebase.delete(APP.CONFIG.URLS.employees + '/' + id, function (employee) {
				// 	that.hideModal();
				// 	that.$element.trigger('employee-deleted', employee);
				// });
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
				shift = $this.data('shift');

			if (!shift) {
				shift = new Shift ($this, options);
				self.instance = shift;
				$this.data('shift', shift);
			}
			
			results.push(shift);
		});

		return results;
	}


	return self;
}());