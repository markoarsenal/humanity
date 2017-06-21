/**
 * Global namespace
 */
var APP = APP || {};


APP.employee = (function () {
	var self = {
		defaults: {},
		instance: {}
	}

	class Employee {
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
				$saveBtn: $element.find('.js-save-btn'),
				$deleteBtn: $element.find('.js-delete-btn')
			}

			// Validate form
			this.validator = this.DOM.$form.validate({
				rules: {
					firstName: { alpha: true },
					lastName: { alpha: true },
					position: { alpha: true }
				}
			});

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
		 * Reset modal form and validation
		 * @return { void }
		 */
		resetForm () {
			this.validator.resetForm();
			this.DOM.$form[0].reset();
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this;

			// Save employee
			that.DOM.$saveBtn.on('click', function () {
				if (that.DOM.$form.valid()) {
					let data = that.DOM.$form.serializeObject(),
						id = data.id;

					delete data.id;

					if (id == -1) {
						// Add employee
						APP.firebase.add(APP.CONFIG.URLS.employees, data, function (employee) {
							that.hideModal();
							that.$element.trigger('employee-saved', employee);
						});
					} else {
						// Update employee
						APP.firebase.update(APP.CONFIG.URLS.employees + '/' + id, data, function (employee) {
							that.hideModal();
							that.$element.trigger('employee-saved', employee);
						});
					}
				}
			});

			// Delete employee
			that.DOM.$deleteBtn.on('click', function () {
				let data = that.DOM.$form.serializeObject(),
					id = data.id;

				APP.firebase.delete(APP.CONFIG.URLS.employees + '/' + id, function (employee) {
					that.hideModal();
					that.$element.trigger('employee-deleted', employee);
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
				employee = $this.data('employee');

			if (!employee) {
				employee = new Employee ($this, options);
				self.instance = employee;
				$this.data('employee', employee);
			}
			
			results.push(employee);
		});

		return results;
	}


	return self;
}());