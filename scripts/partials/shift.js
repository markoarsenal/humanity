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

			this.state = {};

			this.DOM = {
				$form: $element.find('.js-form'),
				$datetime: $element.find('.js-datetime'),
				$positions: $element.find('.js-positions'),
				$employees: $element.find('.js-employees'),
				$saveBtn: $element.find('.js-save-btn'),
				$deleteBtn: $element.find('.js-delete-btn')
			}

			// Validate form
			this.validator = this.DOM.$form.validate({
				rules: {
					name: { alpha: true },
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
			this.state = data;

			APP.helpers.populateData(this.DOM.$form, data);
			// Set active position
			if (data && data.position) {
				this.DOM.$positions.val(data.position).trigger('change');
			}
			// Set employees
			if (data && data.employees) {
				this.DOM.$employees.val(data.employees).trigger('change');
			}

			// Delete btn
			if (data.name) {
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
			// Reset employees
			this.DOM.$employees.val(null).trigger('change');
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
		 * Employees dropdown
		 * @return { void }
		 */
		_initEmployees () {
			APP.firebase.get(APP.CONFIG.URLS.employees, (employees) => {
				let data = [];

				for (let i in employees) {
					data.push({
						id: i,
						text: employees[i].firstName + ' ' + employees[i].lastName
					});
				}

				this.DOM.$employees.select2({
					data: data,
					tags: true
				}).val(null).trigger('change');
			});
		}

		/**
		 * Additional modules
		 * @return { void }
		 */
		_initModules () {
			// Datepicker
			this.DOM.$datetime.bootstrapMaterialDatePicker({
				format: 'MMM DD, YYYY hh:mm a',
				shortTime: true,
				switchOnClick: true
			});

			// Positions
			this._initPositions();

			// Employees
			this._initEmployees();
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this;

			// Save shift
			that.DOM.$saveBtn.on('click', function () {
				if (that.DOM.$form.valid()) {
					let data = that.DOM.$form.serializeObject(),
						id = data.id;

					// Add/update shift
					APP.firebase.update(APP.CONFIG.URLS.shifts + '/' + id, data, function (shift) {
						that.hideModal();
						that.$element.trigger('shift-saved', shift);
					});
				}
			});

			// Delete shift
			that.DOM.$deleteBtn.on('click', function () {
				let data = that.DOM.$form.serializeObject(),
					id = data.id;

				APP.firebase.delete(APP.CONFIG.URLS.shifts + '/' + id, function (shift) {
					that.hideModal();
					that.$element.trigger('shift-deleted', shift);
				});
			});

			// Position changed, reinit dropdown
			$(document).on('position-saved position-deleted', function () {
				that.DOM.$positions.select2('destroy');
				that.DOM.$positions.html('');
				that._initPositions();
			});

			// Employees changed, reinit dropdown
			$(document).on('employee-saved employee-deleted', function () {
				that.DOM.$employees.select2('destroy');
				that.DOM.$employees.html('');
				that._initEmployees();
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