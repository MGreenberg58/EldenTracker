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
rhit.FB_COLLECTION_BUILDS = "Builds";

rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";

rhit.FB_COLLECTION_USERS = "Users";

rhit.fbBuildsManager = null;
rhit.buildValuesManager = null;

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

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
		Rosefire.signIn("3588d83d-61f9-49df-8b06-9235642b5fb2", (err, rfUser) => {
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

rhit.Build = class {
	constructor(id, name, image) {
		this.id = id;
		this.name = name;
		this.image = image;
	}
}

rhit.FbBuildsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._unsubscribe = null;
	}
	add(link, caption) {
		this._ref.add({
			//    [rhit.FB_KEY_LINK]: link,
			//    [rhit.FB_KEY_CAPTION]: caption,
			//    [rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			//    [rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			//TODO: something like this but for our actual database data
		}).then(function (docRef) {
			console.log("Doc written with ID: ", docRef.id);
		}).catch(function (error) {
			console.error("Error adding doc: ", error);
		});

	}
	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Database Update");

			this._documentSnapshots = querySnapshot.docs;


			querySnapshot.forEach((doc) => {
				console.log(doc.data());
			});
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	getBuildAtIndex(index) {
		const snapshot = this._documentSnapshots[index];
		//    const photo = new rhit.Photo(snapshot.id, snapshot.get(rhit.FB_KEY_LINK), snapshot.get(rhit.FB_KEY_CAPTION), snapshot.get(rhit.FB_KEY_AUTHOR));
		return build;
	}
}

rhit.FbSingleBuildManager = class {
	constructor(buildId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BUILDS).doc(buildId);
		console.log(`Listening to ${this._ref.path}`);
	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Doc data: ", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No doc exists");
			}
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	update(caption) {
		this._ref.update({
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		}).then((docRef) => {
			console.log("Doc written with ID: ", docRef.id);
		}).catch(function (error) {
			console.error("Error adding doc: ", error);
		});
	}

	delete() {
		return this._ref.delete();
	}

}

rhit.UserPageController = class {
	constructor() {


		rhit.fbBuildsManager.beginListening(this.updateList.bind(this));
	}
	updateList() {
		console.log("Updating List");
		console.log(`Num Builds: ${rhit.fbBuildsManager.length}`);
		// console.log("Example: ", rhit.fbPhotosManager.getPhotoAtIndex(0));

		const newList = htmlToElement('<div id="buildListContainer"></div>');

		for (let i = 0; i < rhit.fbBuildsManager.length; i++) {
			const build = rhit.fbBuildsManager.getBuildAtIndex(i);
			const card = this._createCard(build);

			card.onclick = (event) => {
				//TODO: some other stuff here maybe
				console.log(`You clicked a card: ${build.id}`);
				window.location.href = `/image.html?id=${build.id}`;
			};

			newList.appendChild(card);
		}

		const list = document.querySelector("#buildListContainer");
		list.removeAttribute("id");
		list.hidden = true;
		list.parentElement.appendChild(newList);

	}

	_createCard(build) {
		return htmlToElement(
			`<div class="pin">
			<img class="img-fluid card-img-bottom" src="${build.image}"></img>	
			<p class="card-text text-center">${build.name}</h6>
		</div>`);
	}
}

rhit.BuildValuesManager = class {
	constructor() {
		this.name = '';
		this.level = 1,
		this.cost = 0,
		this.vigor = 10,
		this.mind = 10,
		this.endurance = 10,
		this.strength = 10,
		this.dexterity = 10,
		this.intelligence = 10,
		this.faith = 10,
		this.arcane = 10,
		this.hp = 414,
		this.fp = 68,
		this.stamina = 92,
		this.load = 48.2,
		this.discovery = 110,
		this.armament = 115,
		this.casting = 210,
		this.physical = 75,
		this.magic = 91,
		this.fire = 78,
		this.lightning = 71,
		this.holy = 91,
		this.immunity = 90,
		this.robustness = 90,
		this.focus = 90,
		this.vitality = 100
		let decrementors = document.querySelectorAll("#decrement");
		decrementors.forEach((button) => {
			let stat = button.dataset.stat;
			button.onclick = ((event) => {
				this.decrementValue(stat);
			})
		})
		let incrementors = document.querySelectorAll("#increment");
		incrementors.forEach((button) => {
			let stat = button.dataset.stat;
			button.onclick = ((event) => {
				this.incrementValue(stat);
			})
		})
		this.updateButtonColors();
		this.fillValues();
	}
	decrementValue(stat) {
		if(this[stat] == 10) {
			return;
		}
		console.log("Decrementing " + stat);
		this[stat]--;
		this.level--;
		this.updateButtonColors();
		this.calcValues();
		this.fillValues();
	}
	incrementValue(stat) {
		if(this[stat] == 99) {
			return;
		}
		console.log("Incrementing " + stat);
		this[stat]++;
		this.level++;
		this.updateButtonColors();
		this.calcValues();
		this.fillValues();
	}
	updateButtonColors() {
		let decrementors = document.querySelectorAll("#decrement");
		decrementors.forEach((button) => {
			let stat = button.dataset.stat;
			if(this[stat] == 10) {
				button.style.color = "rgba(255, 255, 255, 0.1)";
			} else {
				button.style.color = "rgba(255, 255, 255, 1)";
			}
		})
		let incrementors = document.querySelectorAll("#increment");
		incrementors.forEach((button) => {
			let stat = button.dataset.stat;
			if(this[stat] == 99) {
				button.style.color = "rgba(255, 255, 255, 0.1)";
			} else {
				button.style.color = "rgba(255, 255, 255, 1)";
			}
		})
	}
	calcValues() {
		this.cost = 0;
		this.hp = 414;
		this.fp = 68;
		this.stamina = 92;
		this.load = 48.2;
		this.discovery = 110;
		this.armament = 115;
		this.casting = 210;
		this.physical = 75;
		this.magic = 91;
		this.fire = 78;
		this.lightning = 71;
		this.holy = 91;
		this.immunity = 90;
		this.robustness = 90;
		this.focus = 90;
		this.vitality = 100;
		const sheet2 = firebase.database().ref("Sheet2");
		sheet2.on('value', (snapshot) => {
			const leveldata = snapshot.val();

			for(let i = 0; i < this.level - 1; i++) {
				this.cost += leveldata[i].runes;
				this.physical += leveldata[i].physical;
				this.magic += leveldata[i].magic;
				this.fire += leveldata[i].fire;
				this.lightning += leveldata[i].lightning;
				this.holy += leveldata[i].holy;
				this.immunity += leveldata[i].immunity;
				this.robustness += leveldata[i].robustness;
				this.focus += leveldata[i].focus;
				this.vitality += leveldata[i].vitality;
			}
		})

		const sheet1 = firebase.database().ref("Sheet1");
		sheet1.on('value', (snapshot) => {
			const leveldata = snapshot.val();

			for(let i = 0; i < this.vigor - 10; i++) {
				this.hp += leveldata[i].hp;
				this.fire += leveldata[i].fire;
				this.immunity += leveldata[i].immunity;
			}
			for(let i = 0; i < this.mind - 10; i++) {
				this.fp += leveldata[i].fp;
				this.focus += leveldata[i].focus;
			}
			for(let i = 0; i < this.endurance - 10; i++) {
				this.stamina += leveldata[i].stamina;
				this.load = parseFloat((this.load + leveldata[i].load).toFixed(1));
				this.robustness += leveldata[i].robustness;
			}
			for(let i = 0; i < this.strength - 10; i++) {
				this.physical += leveldata[i].physical;
				this.armament += leveldata[i].strarmament;
			}
			for(let i = 0; i < this.dexterity - 10; i++) {
				this.armament += leveldata[i].dexarmament;
			}
			for(let i = 0; i < this.intelligence - 10; i++) {
				this.magic += leveldata[i].magic;
			}
			for(let i = 0; i < this.faith - 10; i++) {
				this.casting += leveldata[i].casting;
			}
			for(let i = 0; i < this.arcane - 10; i++) {
				this.discovery += leveldata[i].discovery;
				this.holy += leveldata[i].holy;
				this.vitality += leveldata[i].vitality;
			}
		})
	}
	fillValues() {
		document.querySelector("#levelValue").innerHTML = this.level;
		document.querySelector("#runesValue").innerHTML = this.cost;
		document.querySelector("#vigorValue").innerHTML = this.vigor;
		document.querySelector("#mindValue").innerHTML = this.mind;
		document.querySelector("#enduranceValue").innerHTML = this.endurance;
		document.querySelector("#strengthValue").innerHTML = this.strength;
		document.querySelector("#dexterityValue").innerHTML = this.dexterity;
		document.querySelector("#intelligenceValue").innerHTML = this.intelligence;
		document.querySelector("#faithValue").innerHTML = this.faith;
		document.querySelector("#arcaneValue").innerHTML = this.arcane;
		document.querySelector("#hpValue").innerHTML = this.hp;
		document.querySelector("#fpValue").innerHTML = this.fp;
		document.querySelector("#staminaValue").innerHTML = this.stamina;
		document.querySelector("#loadValue").innerHTML = this.load;
		document.querySelector("#discoveryValue").innerHTML = this.discovery;
		document.querySelector("#armamentValue").innerHTML = this.armament;
		document.querySelector("#castingValue").innerHTML = this.casting;
		document.querySelector("#physicalValue").innerHTML = this.physical;
		document.querySelector("#magicValue").innerHTML = this.magic;
		document.querySelector("#fireValue").innerHTML = this.fire;
		document.querySelector("#lightningValue").innerHTML = this.lightning;
		document.querySelector("#holyValue").innerHTML = this.holy;
		document.querySelector("#immunityValue").innerHTML = this.immunity;
		document.querySelector("#robustnessValue").innerHTML = this.robustness;
		document.querySelector("#focusValue").innerHTML = this.focus;
		document.querySelector("#vitalityValue").innerHTML = this.vitality;
	}
}

rhit.checkForRedirects = function () {

	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/userpage.html";
	}
}

rhit.initializePage = function () {
	const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#userPage")) {
		const uid = urlParams.get("uid");
		rhit.fbBuildsManager = new this.FbBuildsManager(uid);
		new rhit.UserPageController();
	}

	if (document.querySelector("#createPage")) {
		const uid = urlParams.get("uid");
		rhit.buildValuesManager = new rhit.BuildValuesManager(uid);
	}

	if (document.querySelector("#loginPage")) {
		console.log("Login Page");
		new rhit.LoginPageController();
	}

	if (document.querySelector("#mainPage")) {
		document.getElementById("closeSplash").onclick = (event) => {
			document.getElementById("splashbg").style.display = "none";
		}
	}

	if (document.querySelector("#newBuild")) {
		document.getElementById("newBuild").onclick = (event) => {
			window.location.href = "/create.html";
		}
	}

	rhit.navManager = new rhit.NavManager();
	if (document.querySelector("#openPanel")) {
		rhit.navManager.initNav();
		document.getElementById("openPanel").onclick = (event) => {
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

	initNav() {
		if (rhit.fbAuthManager.isSignedIn) {
			if (document.querySelector("#signInOption")) {
				document.querySelector("#signInOption").hidden = true;
			}

			if (document.querySelector("#signOutOption")) {
				document.querySelector("#signOutOption").onclick = (event) => {
					rhit.fbAuthManager.signOut();
					window.location.href = "/index.html"
				}
			}

			if (document.querySelector("#myBuildOption")) {
				document.querySelector("#myBuildOption").onclick = (event) => {
					window.location.href = `/userpage.html?uid=${rhit.fbAuthManager.uid}`;
				}
			}
		} else {
			if (document.querySelector("#signOutOption")) {
				document.querySelector("#signOutOption").hidden = true;
			}
			if (document.querySelector("#myBuildOption")) {
				document.querySelector("#myBuildOption").hidden = true;
			}
		}

		if (document.querySelector("#signInOption")) {
			document.querySelector("#signInOption").onclick = (event) => {
				window.location.href = "/login.html";
			}
		}

		if (document.querySelector("#signOutOption")) {
			
		}

		if (document.querySelector("#myBuildOption")) {
			
		}

		if (document.querySelector("#publicBuildOption")) {
			document.querySelector("#publicBuildOption").onclick = (event) => {
				window.location.href = "/index.html";
			}
		}
	}

	openNav() {
		document.getElementById("sidePanel").style.width = "300px";
	}
	closeNav() {
		document.getElementById("sidePanel").style.width = "0";
	}

}

rhit.FbUserManager = class {
	constructor() {
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._document = null;
		this._unsubscribe = null;
		console.log("Made user manager");
	}
	addNewUserMaybe(uid, name, photoUrl) {
		const userRef = this._collectionRef.doc(uid);

		return userRef.get().then((doc) => {
				if (doc.exists) {
					console.log("User already exists: ", doc.data());
				} else {
					console.log("Creating user!");

					return userRef.set({
							[rhit.FB_KEY_NAME]: name,
							[rhit.FB_KEY_PHOTO_URL]: photoUrl
						})
						.then(function () {
							console.log("Doc written");
						})
						.catch(function (error) {
							console.log("Error writing doc: ", error);
						});
				}
			})
			.catch((err) => {
				console.log("Error: ", err);
			});
	}
	beginListening(uid, changeListener) {

	}
	stopListening() {
		this._unsubscribe();
	}
	updatePhotoUrl(photoUrl) {

	}
	updateName(name) {

	}

}

rhit.createUserObjectIfNeeded = function () {
	return new Promise((resolve, reject) => {
		if (!rhit.fbAuthManager.isSignedIn) {
			resolve();
			return;
		}

		if (!document.querySelector("#loginPage")) {
			resolve();
			return;
		}

		rhit.fbUserManager.addNewUserMaybe(
			rhit.fbAuthManager.uid,
			rhit.fbAuthManager.name,
			rhit.fbAuthManager.photoUrl
		).then(() => {
			resolve();
		});

	});
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbUserManager = new rhit.FbUserManager();

	rhit.fbAuthManager.beginListening((params) => {
		console.log("isSignedIn: ", rhit.fbAuthManager.isSignedIn);

		rhit.createUserObjectIfNeeded().then((params) => {
			rhit.initializePage();
		});
	});

	console.log("Ready");

};

rhit.main();