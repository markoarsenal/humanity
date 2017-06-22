/**
 * Global namespace
 */
var APP = APP || {};


APP.table = (function () {
	let self = {
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

			this.employeesClone = {};

			// Get employees
			this.getEmployees((employees) => {
				this.state.employees = employees;
				this.employeesClone = $.extend(true, {}, employees);
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
		 * @param { Function} 	callback 	Callback function to be called on data ready
		 * @return { void }
		 */
		_prepareData (callback) {
			let startDate = this.state.startDate;
			let data = $.extend(true, {}, this.state, {
				interval: startDate.format('MMM DD, YYYY') + ' - ' + startDate.clone().add(6, 'days').format('MMM DD, YYYY'),
				days: []
			});			

			// Add shifts
			APP.firebase.get(APP.CONFIG.URLS.shifts, (shifts) => {
				// Empty days for every employee
				for (let e in data.employees) {
					data.employees[e].days = [];
				}
				
				for (let i = 0; i < 7; i++) {
					let newDate = startDate.clone().add(i, 'days'),
						day = newDate.format('MMM DD, YYYY');

					data.days.push({
						date: newDate.format('ddd, MMM DD'),
					});

					// Create days for every employee
					for (let e in data.employees) {
						let employee = data.employees[e],
							key = e + ':' + day,
							hasShift = shifts && shifts[key] ? true : false;
						
						employee['days'].push({
							day: day,
							todayClass: newDate.format('DD MM YYYY') === moment().format('DD MM YYYY') ? 'today-cell' : '',
							hasShift: hasShift,
							shift: shifts && shifts[key],
							shiftKey: key
						});
					}

					this.state.employees = data.employees;
				}

				typeof callback === 'function' ? callback(data) : null;
			});
		}

		/**
		 * Render table in DOM
		 * @return { void }
		 */
		renderTable () {
			this._prepareData((data) => {
				this.DOM.$tableContainer.html(this.template(data));
			});
		}

		/**
		 * Events
		 */
		_initEvents () {
			let that = this,
				filterTimeout;

			// Filter
			that.DOM.$filter.on('keyup.ats cut.ats paste.ats', function (e) {
				let $this = $(this),
					filter = $this.val().toLowerCase();

				// Reset to original state
				if (filter.length === 0) {
					that.state.employees = that.employeesClone;
				}

				// Filter 300ms after last letter is entered
				clearTimeout(filterTimeout);

				filterTimeout = setTimeout(function () {
					that.state.employees = {};

					for (let i in that.employeesClone) {
						let employee = that.employeesClone[i],
							fn = employee.firstName.toLowerCase(),
							ln = employee.lastName.toLowerCase();

						if (fn.indexOf(filter) !== -1 || ln.indexOf(filter) !== -1) {
							that.state.employees[i] = employee;
						}
					}

					that.renderTable();
				}, 300);
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

			// Employee changed
			$(document).on('employee-saved employee-deleted', function () {
				// Get employees
				that.getEmployees((employees) => {
					that.state.employees = employees;
					that.employeesClone = $.extend(true, {}, employees);
					that.renderTable();
				});
			});

			// Shift changed
			$(document).on('shift-saved shift-deleted', function (e, shift) {
				that.renderTable();
			});

			// Add shift
			that.$element.on('click', '.js-table-cell-add', function () {
				let $this = $(this),
					employee = $this.data('employee'),
					date = $this.data('date');

				APP.shift.instance.showModal({
					id: employee + ':' + date
				});
			});

			// Edit shift
			that.$element.on('click', '.js-shift', function (e) {
				e.stopPropagation();

				let id = $(this).data('id');

				// Get shift data
				APP.firebase.get(APP.CONFIG.URLS.shifts + '/' + id, function (shift) {
					shift.id = id;
					APP.shift.instance.showModal(shift);
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
		let $elements = $(selector),
			results = [];

		// Add modul methods to every element
		$elements.each(function(index, el) {
			let $this = $(this),
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