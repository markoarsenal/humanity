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

			this.DOM = {
				$template: $('.js-table-template')
			}

			let source = $('.js-table-template').html();
			this.template = Handlebars.compile(source);
			
			this.renderTable(this.prepareData());

			this._initEvents();
		}

		prepareData (startDate = moment()) {
			let data = {
				interval: startDate.format('MMM DD, YYYY') + ' - ' + startDate.clone().add(6, 'days').format('MMM DD, YYYY'),
				employees: ['Michael Jordan', 'Diego Maradona', 'Dejan Bodiroga', 'Valentino Rossi'],
				days: []
			}

			for (var i = 0; i < 7; i++) {
				let newDate = startDate.clone().add(i, 'days');

				data.days.push({
					date: newDate.format('ddd, MMM DD'),
					todayClass: newDate.format('DD MM YYYY') === moment().format('DD MM YYYY') ? 'today-cell' : ''
				});
			}

			return data;
		}

		renderTable (data) {
			console.log(data);
			this.$element.html(this.template(data));
		}

		/**
		 * Events
		 */
		_initEvents () {
			
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