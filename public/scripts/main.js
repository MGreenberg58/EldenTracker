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
		Rosefire.signIn("88a14583-be71-448d-88a9-96272fead15e", (err, rfUser) => {
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

rhit.checkForRedirects = function () {
	console.log("In checkforredirects");
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		console.log("here");
		window.location.href = "/userpage.html";
	}
	// if (document.querySelector("#mainPage") && !rhit.fbAuthManager.isSignedIn) {
	//     window.location.href = "/userpage.html";
	// }
}

rhit.initializePage = function () {
	if (document.querySelector("#loginPage")) {
		console.log("Login Page");
		rhit.fbAuthManager = new rhit.FbAuthManager();
		rhit.fbAuthManager.beginListening((params) => {
			console.log("isSignedIn: ", rhit.fbAuthManager.isSignedIn);
		});
		new rhit.LoginPageController();
	} else if (document.querySelector("#userPage")) {
		document.getElementById("newBuild").onclick = (event) => {
			window.location.href = "/create.html";
		};
	} else if (document.querySelector("#mainPage")) {
		document.getElementById("closeSplash").onclick = (event) => {
			document.getElementById("splashbg").style.display = "none";
		}
	}

	if (!document.querySelector("#loginPage")) {
		rhit.navManager = new rhit.NavManager();

		document.querySelector(".navButton").onclick = (event) => {
			if (!rhit.navManager.panelopen) {
				rhit.navManager.openNav();
				rhit.navManager.panelopen = true;
			} else {
				rhit.navManager.closeNav();
				rhit.navManager.panelopen = false;
			}
		};
	}
	rhit.checkForRedirects();
}

rhit.NavManager = class {
	constructor() {
		let panelopen = false;
	}

	openNav() {
		document.getElementById("sidePanel").style.width = "300px";
	}
	closeNav() {
		document.getElementById("sidePanel").style.width = "0";
	}

}

/* Main */
/** function and class syntax examples */
rhit.main = function () {

	rhit.initializePage();

	console.log("Ready");

};

rhit.main();