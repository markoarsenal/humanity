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
			this.database = firebase.initializeApp(this.options.config).database();
		}
	}


	return new Firebase();
}());