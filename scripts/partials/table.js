/**
 * Global namespace
 */
var APP = APP || {};


APP.table = (function () {
	var self = {
		defaults: {},
		instance: {}
	}

	class Table {
		/**
		 * Constructor function
		 * @param { Jquery } 	$element 	Module element
		 * @param { Object } 	options  	Module options
		 */
		constructor ($element, options) {
			this.$element = $element;
			this.options = $.extend(true, {}, self.defaults, options);

			this.state = {
				startDate: moment(),
				employees: {}
			}

			this.DOM = {
				$filter: $element.find('.js-table-filter'),
				$paginationBtn: $element.find('.js-pagination-btn'),
				$tableContainer: $element.find('.js-table-container'),
				$template: $('.js-table-template'),
			}

			// Get employees
			this.getEmployees((employees) => {
				this.state.employees = employees;
				this.renderTable();
			});

			// Table template
			let source = $('.js-table-template').html();
			this.template = Handlebars.compile(source);
			
			this._initEvents();
		}

		/**
		 * Get employees form database
		 * @param  { Function } 	callback 	Callback function, accepts employees as argument
		 * @return { void }
		 */
		getEmployees (callback) {
			APP.firebase.get(APP.CONFIG.URLS.employees, function (employees) {
				typeof callback === 'function' ? callback(employees) : null;
			});
		}

		/**
		 * Prepare data for table rendering
		 * @return { Object }	Formated data
		 */
		_prepareData () {
			let startDate = this.state.startDate;
			let data = $.extend(true, {}, this.state, {
				interval: startDate.format('MMM DD, YYYY') + ' - ' + startDate.clone().add(6, 'days').format('MMM DD, YYYY'),
				days: []
			});			

			for (var i = 0; i < 7; i++) {
				let newDate = startDate.clone().add(i, 'days');

				data.days.push({
					date: newDate.format('ddd, MMM DD'),
					todayClass: newDate.format('DD MM YYYY') === moment().format('DD MM YYYY') ? 'today-cell' : ''
				});
			}

			return data;
		}

		/**
		 * Render table in DOM
		 * @return { void }
		 */
		renderTable () {
			let data = this._prepareData();
			this.DOM.$tableContainer.html(this.template(data));
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this,
				filterTimeout,
				employees = $.extend(true, {}, that.state.employees);

			// Filter
			that.DOM.$filter.on('keyup.ats cut.ats paste.ats', function (e) {
				var $this = $(this),
					filter = $this.val().toLowerCase();

				// Reset to original state
				if (filter.length === 0) {
					that.state.employees = employees;
				}

				// Filter 400ms after last letter is entered
				clearTimeout(filterTimeout);

				filterTimeout = setTimeout(function () {
					that.state.employees = {};

					for (i in employees) {
						let employee = employees[i],
							fn = employee.firstName.toLowerCase(),
							ln = employee.lastName.toLowerCase();

						if (fn.indexOf(filter) !== -1 || ln.indexOf(filter) !== -1) {
							that.state.employees[i] = employee;
						}
					}

					that.renderTable();
				}, 400);
			});

			// Pagination
			that.DOM.$paginationBtn.on('click', function (e) {
				e.preventDefault();

				let $this = $(this);

				if ($this.hasClass('js-pagination-prev')) {
					// Prev week
					that.state.startDate.subtract(7, 'days');
				} else {
					// Next week
					that.state.startDate.add(7, 'days');
				}

				that.renderTable();
			});

			// New employee
			that.$element.on('click', '.js-new-employee-btn', function () {
				APP.employee.instance.showModal();
			});

			// Existing employee
			that.$element.on('click', '.js-employee', function (e) {
				e.preventDefault();

				let id = $(this).data('id');

				// Get employee data
				APP.firebase.get(APP.CONFIG.URLS.employees + '/' + id, function (employee) {
					employee.id = id;
					APP.employee.instance.showModal(employee);
				});
			});

			// Employee saved
			$(document).on('employee-saved employee-deleted', function () {
				// Get employees
				that.getEmployees((employees) => {
					that.state.employees = employees;
					that.renderTable();
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
				table = $this.data('table');

			if (!table) {
				table = new Table ($this, options);
				self.instance = table;
				$this.data('table', table);
			}
			
			results.push(table);
		});

		return results;
	}


	return self;
}());