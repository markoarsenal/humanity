/**
 * Global namespace
 */
var APP = APP || {};


(function () {
	// Init table
	APP.table.init('.js-table');
	// Init position list
	APP.positionList.init('.js-position-list');
	// Init position
	APP.position.init('.js-position-modal');
	// Init employee
	APP.employee.init('.js-employee-modal');
	// Init shift
	APP.shift.init('.js-shift-modal');
}());