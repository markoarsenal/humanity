 $.validator.addMethod("alpha", function (value, element) {
    return this.optional(element) || value == value.match(/^[a-zA-Z\s]+$/);
 }, 'Enter letters only, please');

 $.validator.addMethod("greaterThan", function (value, element, params) {
 	let format = 'MMM DD, YYYY hh:mm a',
 		startDate = moment(value, format),
 		endDate = moment($(params).val(), format);

 	return startDate.isAfter(endDate);
 }, 'End datetime must be greather than start datetime');