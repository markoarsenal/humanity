/**
 * Global namespace
 */
var APP = APP || {};


APP.firebase = (function () {
	class Firebase {
		/**
		 * Constructor function
		 * @param { Object } 	options  	Module options
		 */
		constructor (options) {
			this.options = {
				config: {
					apiKey: "AIzaSyADc-F0TY-sXD_UYPjjx7rZf0wX5svAbKk",
					authDomain: "humanity-285cf.firebaseapp.com",
					databaseURL: "https://humanity-285cf.firebaseio.com",
					projectId: "humanity-285cf",
					storageBucket: "",
					messagingSenderId: "774141096291"
				}
			}

			// Init firebase
			this.db = firebase.initializeApp(this.options.config).database();
		}

		/**
		 * Get data from database
		 * @param  { String }   	path     	Path in database
		 * @param  { Function } 	callback 	Function to be called on db response
		 * @return { void }
		 */
		get (path, callback) {
			this._changeCallback(path, callback);
		}

		/**
		 * Add data to database
		 * @param  { String }   		path     	Path in database
		 * @param  { Object, Array }   	data     	Data to be added
		 * @param  { Function } 		callback 	Function to be called on db response
		 * @return { void }
		 */
		add (path, data, callback) {
			this.db.ref(path).push(data);
			this._changeCallback(path, callback);
		}

		/**
		 * Update data into database
		 * @param  { String }   		path     	Path in database
		 * @param  { Object, Array }   	data     	New data
		 * @param  { Function } 		callback 	Function to be called on db response
		 * @return { void }
		 */
		update (path, data, callback) {
			this.db.ref(path).set(data);
			this._changeCallback(path, callback);
		}

		/**
		 * Delete data from database
		 * @param  { String }   	path     	Path in database
		 * @param  { Function } 	callback 	Function to be called on db response
		 * @return { void }
		 */
		delete (path, callback) {
			this.db.ref(path).remove();
			this._changeCallback(path, callback);
		}

		/**
		 * Data change callback
		 * @param  { String }   	path     	Path in database
		 * @param  { Function } 	callback 	Callback function
		 * @return { void }
		 */
		_changeCallback (path, callback) {
			this.db.ref(path).once('value').then(function (snapshot) {
				typeof callback === 'function' ? callback(snapshot.val()) : null;
			});
		}
	}


	return new Firebase();
}());