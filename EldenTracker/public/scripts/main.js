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

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireBtn").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {

			this._user = user;
			changeListener();

			if (user) {
				const uid = user.uid;
				const displayName = user.displayName;
				const email = user.email;
				const photoURL = user.photoURL;
				const phoneNum = user.phoneNumber;
				const isAnon = user.isAnonymous;
				console.log("User signed in with uid: ", uid);
				console.log("displayName: ", displayName);
				console.log("email: ", email);
				console.log("photoURL: ", photoURL);
				console.log("phoneNumber:", phoneNum);
				console.log("isAnonymous: ", isAnon);
			} else {
				console.log("No user signed in");
			}
		});
	}
	signIn() {
		Rosefire.signIn("d9097b0f-a3f6-4423-84b6-0824d063a615", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMsg = error.message;
				if (errorCode === "auth/invalid-custom-token") {
					alert("Invalid Token");
				} else {
					console.error("Custom auth error", errorCode, errorMsg);
				}
			});
		});
	}
	signOut() {
		firebase.auth().signOut().then(function () {
			console.log("You are signed out");
		}).catch(function (error) {
			console.error("Error Signing Out");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.initializePage = function() {
    if (document.querySelector("#loginPage")) {
        console.log("Login Page");
        new rhit.LoginPageController();
    }
}

rhit.checkForRedirects = function() {
    if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
        // window.location.href = "/index.html";
    }
    // if (document.querySelector("#mainPage") && !rhit.fbAuthManager.isSignedIn) {
    //     window.location.href = "/userpage.html";
    // }
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	// rhit.fbAuthManager = new rhit.FbAuthManager();
    // rhit.fbAuthManager.beginListening((params) => {
    //     console.log("isSignedIn: ", rhit.fbAuthManager.isSignedIn);
    //     rhit.checkForRedirects();
    //     rhit.initializePage();
	// });
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
