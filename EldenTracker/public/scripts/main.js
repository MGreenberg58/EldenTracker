/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	// THESE NEED TO BE PUT IN RESPECTIVE CLASSES
	// Side Panel Open and Close
	let panelopen = false;
	function openNav() {
		document.getElementById("sidePanel").style.width = "300px";
	}
	function closeNav() {
		document.getElementById("sidePanel").style.width = "0";
	}
	document.getElementById("panelButton").onclick = (event) => {
		if(!panelopen) {
			openNav();
			panelopen = true;
		} else {
			closeNav();
			panelopen = false;
		}
	};

	// Welcome Splash Modal
	document.getElementById("closeSplash").onclick = (event) => {
		document.getElementById("splashbg").style.display = "none";
	}
};

rhit.main();
