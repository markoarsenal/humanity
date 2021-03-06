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

			this.state = {};

			this.DOM = {
				$form: $element.find('.js-form'),
				$positions: $element.find('.js-positions'),
				$saveBtn: $element.find('.js-save-btn'),
				$deleteBtn: $element.find('.js-delete-btn')
			}

			// Validate form
			this.validator = this.DOM.$form.validate({
				rules: {
					firstName: { alpha: true },
					lastName: { alpha: true }
				}
			});

			this._initModules();
			this._initEvents();
		}

		/**
		 * Show employee modal
		 * @param  { Object } 	data 	Employee data
		 * @return { void }
		 */
		showModal (data) {
			this.state = data;

			APP.helpers.populateData(this.DOM.$form, data);
			// Set active position
			if (data && data.position) {
				this.DOM.$positions.val(data.position).trigger('change');
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

			// Reset positions
			this.DOM.$positions.val(null).trigger('change');
		}

		/**
		 * Positions dropdown
		 * @return { void }
		 */
		_initPositions () {
			APP.positionList.instance.getPositions((positions) => {
				let data = [];

				for (let i in positions) {
					data.push({
						id: i,
						color: positions[i].color,
						text: positions[i].name
					});
				}
				
				this.DOM.$positions.select2({
					placeholder: 'Select a position',
					data: data,
					templateResult: function (state) {
						if (!state.id) { return state.text; }

						let $state = $('<div class="c-position-item js-position" data-id="' + state.id + '">\
											<span class="color-placeholder" style="background-color: #' + state.color + '"></span>\
											' + state.text + '\
										</div>');

						return $state;
					}
				}).val(null).trigger('change');
			});
		}

		/**
		 * Additional modules
		 * @return { void }
		 */
		_initModules () {
			// Positions
			this._initPositions();
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

			// Position changed, reinit dropdown
			$(document).on('position-saved position-deleted', function () {
				that.DOM.$positions.select2('destroy');
				that.DOM.$positions.html('');
				that._initPositions();
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