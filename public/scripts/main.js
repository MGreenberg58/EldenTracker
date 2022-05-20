var rhit = rhit || {};

/** globals */
rhit.FB_COLLECTION_BUILDS = "Builds";

rhit.fbUserBuildsManager = null;
rhit.fbSingleBuildManager = null;
rhit.fbPublicBuildsManager = null;
rhit.buildValuesManager = null;

function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.LoginPageController = class {
	constructor() {
		rhit.startFirebaseUI();
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
				// console.log("User signed in with uid: ", uid);
				// console.log("displayName: ", displayName);
				// console.log("email: ", email);
				// console.log("photoURL: ", photoURL);
				// console.log("phoneNumber:", phoneNum);
				// console.log("isAnonymous: ", isAnon);
			} else {
				// console.log("No user signed in");
			}
		});
	}
	signOut() {
		firebase.auth().signOut().then(function () {
			// console.log("You are signed out");
		}).catch(function (error) {
			// console.error("Error Signing Out");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
	get username() {
		return this._user.displayName;
	}
}

rhit.startFirebaseUI = function() {
	var uiConfig = {
		signInSuccessUrl: `/index.html`,
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		]
	};
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.Build = class {
	constructor(id, name, isPublic, pic, arcane, dexterity, endurance, faith, intelligence, mind, strength, vigor) {
		this.id = id;
		this.name = name;
		this.isPublic = isPublic;
		this.pic = pic;
		this.arcane = arcane;
		this.dexterity = dexterity;
		this.endurance = endurance;
		this.faith = faith;
		this.intelligence = intelligence;
		this.mind = mind;
		this.strength = strength;
		this.vigor = vigor;
	}
}

rhit.FbUserBuildsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BUILDS);
		this._unsubscribe = null;
	}
	beginListening(changeListener) {
		let query = this._ref.where("author", "==", this._uid).limit(50);
	
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			// console.log("Database Update");

			this._documentSnapshots = querySnapshot.docs;

			querySnapshot.forEach((doc) => {
				// console.log(doc.data());
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
		return new rhit.Build(snapshot.id, snapshot.get("name"), snapshot.get("isPublic"), snapshot.get("pic"), snapshot.get("arcane"), snapshot.get("dexterity"), snapshot.get("endurance"), snapshot.get("faith"), snapshot.get("intelligence"), snapshot.get("mind"), snapshot.get("strength"), snapshot.get("vigor"));
	}
	add(build) {
		return new Promise((resolve, reject) => {
			this._ref.add({		
				"name": build.name,
				"isPublic": build.isPublic,
				"pic": build.pic,
				"vigor": build.vigor,
				"mind": build.mind,
				"endurance": build.endurance,
				"strength": build.strength,
				"dexterity": build.dexterity,
				"intelligence": build.intelligence,
				"faith": build.faith,
				"arcane": build.arcane,
				"author": rhit.fbAuthManager.uid,
				"lastTouched": firebase.firestore.Timestamp.now(),
		 }).then(function (docRef) {
			//  console.log("Doc written with ID: ", docRef.id);
			 resolve();
		 }).catch(function (error) {
			//  console.error("Error adding doc: ", error);
			 reject();
		 });
		});
	}
}

rhit.FbPublicBuildsManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BUILDS);
		this._unsubscribe = null;
	}
	beginListening(changeListener) {
		let query = this._ref.where("isPublic", "==", true).limit(50);
	
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			// console.log("Database Update");

			this._documentSnapshots = querySnapshot.docs;

			querySnapshot.forEach((doc) => {
				// console.log(doc.data());
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
		return new rhit.Build(snapshot.id, snapshot.get("name"), snapshot.get("isPublic"), snapshot.get("pic"), snapshot.get("arcane"), snapshot.get("dexterity"), snapshot.get("endurance"), snapshot.get("faith"), snapshot.get("intelligence"), snapshot.get("mind"), snapshot.get("strength"), snapshot.get("vigor"));
	}
}

rhit.FbSingleBuildManager = class {
	constructor(buildId) {
		this._unsubscribe = null;
		this._buildId = buildId;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BUILDS).doc(buildId);
		// console.log(`Listening to ${this._ref.path}`);
	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				// console.log("Doc data: ", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// console.log("No doc exists");
			}
		});
	}
	update(build) {
		return new Promise((resolve, reject) => {
			this._ref.update({		
				"name": build.name,
				"isPublic": build.isPublic,
				"pic": build.pic,
				"vigor": build.vigor,
				"mind": build.mind,
				"endurance": build.endurance,
				"strength": build.strength,
				"dexterity": build.dexterity,
				"intelligence": build.intelligence,
				"faith": build.faith,
				"arcane": build.arcane,
				"author": rhit.fbAuthManager.uid,
				"lastTouched": firebase.firestore.Timestamp.now(),
		 }).then(() => {
			//  console.log("Doc updated with ID: ", this._buildId);
			 resolve();
		 }).catch((error) => {
			//  console.error("Error updating doc: ", error);
			 reject();
		 });
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	delete() {
		return this._ref.delete();
	}
	get author() {
		return new Promise((resolve, reject) => {
			this._ref.get().then((docSnapshot) => {
				resolve(docSnapshot.get("author"));
				return;
			}).catch(() => {
				reject();
			});
		});
	}
}

rhit.UserPageController = class {
	constructor(uid) {
		rhit.fbUserBuildsManager = new rhit.FbUserBuildsManager(uid);

		document.getElementById("newBuild").onclick = (event) => {
			window.location.href = "/create.html";
		}

		rhit.fbUserBuildsManager.beginListening(this.updateList.bind(this));
	}
	updateList() {
		// console.log("Updating List");
		// console.log(`Num Builds: ${rhit.fbUserBuildsManager.length}`);

		const newList = htmlToElement('<div id="buildListContainer"></div>');

		for (let i = 0; i < rhit.fbUserBuildsManager.length; i++) {
			const build = rhit.fbUserBuildsManager.getBuildAtIndex(i);
			const card = this._createCard(build);
			let pic = "Radahn";
			if(build.pic != null && build.pic != "") {
				pic = build.pic;
			}
			card.style.background = `url("../images/sets/${pic}.png") top center no-repeat, rgba(0, 0, 0, 0.8)`;
			card.style.backgroundSize = "250px";

			card.onclick = (event) => {
				// console.log(`You clicked a card: ${build.id}`);
				window.location.href = `/build.html?id=${build.id}`;
				sessionStorage.setItem("isPublicList", "false");
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
			<div class="cardstats">${build.vigor}/${build.mind}/${build.endurance}/${build.strength}/${build.dexterity}/${build.intelligence}/${build.faith}/${build.arcane}</div>
			<div class="cardname">${build.name}</div>
		</div>`);
	}
}

rhit.BuildValuesManager = class {
	constructor(buildId) {
		this.id = buildId;
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
		this.fp = 78,
		this.stamina = 96,
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
		// console.log("Decrementing " + stat);
		this[stat]--;
		this.level--;
		this.updateButtonColors();
		this.calcValues().then((params) => {
			this.fillValues();
		});
	}
	incrementValue(stat) {
		if(this[stat] == 99) {
			return;
		}
		// console.log("Incrementing " + stat);
		this[stat]++;
		this.level++;
		this.updateButtonColors();
		this.calcValues().then((params) => {
			this.fillValues();
		});
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
		return new Promise((resolve, reject) => {
			this.cost = 0;
			this.hp = 414;
			this.fp = 78;
			this.stamina = 96;
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
				this.fillValues();
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
				this.fillValues();
			})
			resolve();
			return;
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
	getCurrentBuild() {
		let name = document.querySelector("#nameField").value;
		let isPublic = document.querySelector("#isPublicField").checked;
		let pic = document.querySelector("#buildPic").value;
		let vigor = document.querySelector("#vigorValue").innerHTML;
		let mind = document.querySelector("#mindValue").innerHTML;
		let endurance = document.querySelector("#enduranceValue").innerHTML;
		let strength = document.querySelector("#strengthValue").innerHTML;
		let dexterity = document.querySelector("#dexterityValue").innerHTML;
		let intelligence = document.querySelector("#intelligenceValue").innerHTML;
		let faith = document.querySelector("#faithValue").innerHTML;
		let arcane = document.querySelector("#arcaneValue").innerHTML;
	
		return new rhit.Build(this.id, name, isPublic, pic, arcane, dexterity, endurance, faith, intelligence, mind, strength, vigor);
	}
	setCurrentBuild(build) {
		this.name = build.name;
		this.isPublic = build.isPublic;
		this.pic = build.pic;
		this.vigor = parseInt(build.vigor);
		this.mind = parseInt(build.mind);
		this.endurance = parseInt(build.endurance);
		this.strength = parseInt(build.strength);
		this.dexterity = parseInt(build.dexterity);
		this.intelligence = parseInt(build.intelligence);
		this.faith = parseInt(build.faith);
		this.arcane = parseInt(build.arcane);
		this.level += this.vigor + this.mind + this.endurance + this.strength + this.dexterity + this.intelligence + this.faith + this.arcane - 80;
		
		this.updateButtonColors();
		this.calcValues().then((params) => {
			this.fillValues();
			document.querySelector("#nameField").value = this.name;
			document.querySelector("#isPublicField").checked = this.isPublic;
			document.querySelector("#buildPic").value = this.pic;
		});
	}
}

rhit.BuildPageController = class {
	constructor(id) {
		rhit.fbSingleBuildManager = new rhit.FbSingleBuildManager(id);
		rhit.buildValuesManager = new rhit.BuildValuesManager(id);

		firebase.firestore().collection("Builds").doc(id).get().then((doc) => {
			const build = new rhit.Build(doc.id, doc.data().name, doc.data().isPublic, doc.data().pic, doc.data().arcane, doc.data().dexterity, doc.data().endurance, doc.data().faith, doc.data().intelligence, doc.data().mind, doc.data().strength, doc.data().vigor);
			// console.log(build);
			rhit.buildValuesManager.setCurrentBuild(build);
		});

		const inc = document.querySelectorAll("#decrement");
		const dec = document.querySelectorAll("#increment");
		const buttons = [...inc,...dec];

		if (sessionStorage.getItem("isPublicList") == "true") {
			// document.querySelector("#navTitle").innerHTML = `${rhit.fbAuthManager.username}'s Build`;

			document.querySelector("#saveBuild").hidden = true;
			document.querySelector("#deleteBuild").hidden = true;
			document.querySelector("#buildproperties").hidden = true;

			buttons.forEach((button) => {
				button.style.display = "none";
			});

		} else {
			document.querySelector("#navTitle").innerHTML = "Edit Build";
			document.querySelector("#saveBuild").hidden = false;
			document.querySelector("#buildproperties").hidden = false;

			let piclist = ["Alberich", "Albinauric", "All Knowing", "Aristocrat", "Astrologer", "Azur", "Bandit", "Banished Knight", "Battlemage", "Beast Champion", "Blackflame Monk", "Black Knife", "Blaidd", "Bloodhound", "Bloodsoaked", "Bloody Wolf", "Blue Cloth", "Blue Festive", "Blue Silver", "Briar", "Bullgate", "Carian Knight", "Chain", "Champion", "Cleanrot", "Commoner", "Confessor", "Consort", "Crucible Knight", "Crucible Tree", "Cuckoo Knight", "Depraved Perfumer", "Drake Knight", "Duelist", "Eccentric", "Elden Lord", "Errant Sorcerer", "Exile", "Festive", "Fia", "Fingerprint", "Finger Maiden", "Fire Monk", "Fire Prelate", "Fur", "Gelmir", "Godrick Foot Soldier", "Godrick Knight", "Godrick Soldier", "Godskin Apostle", "Godskin Noble", "Goldmask", "Guardian", "Guilty", "Haligtree", "Haligtree Foot Soldier", "Haligtree Knight", "Highwayman", "High Page", "Hoslow", "Iron", "Juvenile Scholar", "Kaiden", "Knight", "Lazuli Sorcerer", "Leather", "Leyndell Foot Soldier", "Leyndell Knight", "Leyndell Soldier", "Lionel", "Lusat", "Malenia", "Malformed Dragon", "Maliketh", "Marais", "Marionette Soldier", "Mausoleum Foot Soldier", "Mausoleum Knight", "Mausoleum Soldier", "Melinas", "Mushroom", "Night Cavalry", "Night Maiden", "Noble", "Nomadic Merchant", "Nox Monk", "Nox Swordstress", "Old Aristocrat", "Omen", "Omenkiller", "Page", "Perfumer", "Preceptor", "Prisoner", "Prophet", "Queen", "Radahn", "Radahn Foot Soldier", "Radahn Soldier", "Raptor", "Raya Lucarian Foot Soldier", "Raya Lucarian Soldier", "Raya Lucarian Sorcerer", "Redmane Knight", "Ronin", "Rotten Duelist", "Royal Knight", "Royal Remains", "Ruler", "Sage", "Samurai", "Sanguine Noble", "Scaled", "Shaman", "Snow Witch", "Spellblade", "Traveler", "Travelling Maiden", "Tree Sentinel", "Twinned", "Vagabond Knight", "Veteran", "Vulgar Militia", "War Surgeon", "White Reed", "Zamor"];
			let buildpic = document.querySelector("#buildPic");
			for(let i = 0; i < piclist.length; i++) {
				if(piclist[i] == "Radahn") {
					buildpic.appendChild(htmlToElement(`<option selected value="${piclist[i]}">${piclist[i]}</option>`));
				} else {
					buildpic.appendChild(htmlToElement(`<option value="${piclist[i]}">${piclist[i]}</option>`));
				}
			}

			buttons.forEach((button) => {
				button.style.display = "block";
			});
 
			document.querySelector("#saveBuild").onclick = (event) => {
				let build = rhit.buildValuesManager.getCurrentBuild();
				// console.log(build);
				rhit.fbSingleBuildManager.update(build).then(() => {
					window.location.href = `/userpage.html?uid=${rhit.fbAuthManager.uid}`;
				});
			}
	
			document.querySelector("#deleteBuild").onclick = (event) => {
				if(confirm("Are you sure you would like to delete this build?")) {
					rhit.fbSingleBuildManager.delete().then(() => {
						window.location.href = `/userpage.html?uid=${rhit.fbAuthManager.uid}`;
					});
				}
			}
		}

		
	
		
	}
}

rhit.CreatePageController = class {
	constructor(uid, buildId) {
		rhit.fbUserBuildsManager = new rhit.FbUserBuildsManager(uid);
		rhit.buildValuesManager = new rhit.BuildValuesManager(buildId);
		
		if (!rhit.fbAuthManager.isSignedIn) {
			document.getElementById("saveBuild").style.display = "none";
			document.querySelector("#buildproperties").hidden = true;
		} else {
			document.querySelector("#saveBuild").onclick = (event) => {
				let build = rhit.buildValuesManager.getCurrentBuild();
				// console.log(build);
				rhit.fbUserBuildsManager.add(build).then(() => {
					window.location.href = `/userpage.html?uid=${rhit.fbAuthManager.uid}`;
				});
			}
			let piclist = ["Alberich", "Albinauric", "All Knowing", "Aristocrat", "Astrologer", "Azur", "Bandit", "Banished Knight", "Battlemage", "Beast Champion", "Blackflame Monk", "Black Knife", "Blaidd", "Bloodhound", "Bloodsoaked", "Bloody Wolf", "Blue Cloth", "Blue Festive", "Blue Silver", "Briar", "Bullgate", "Carian Knight", "Chain", "Champion", "Cleanrot", "Commoner", "Confessor", "Consort", "Crucible Knight", "Crucible Tree", "Cuckoo Knight", "Depraved Perfumer", "Drake Knight", "Duelist", "Eccentric", "Elden Lord", "Errant Sorcerer", "Exile", "Festive", "Fia", "Fingerprint", "Finger Maiden", "Fire Monk", "Fire Prelate", "Fur", "Gelmir", "Godrick Foot Soldier", "Godrick Knight", "Godrick Soldier", "Godskin Apostle", "Godskin Noble", "Goldmask", "Guardian", "Guilty", "Haligtree", "Haligtree Foot Soldier", "Haligtree Knight", "Highwayman", "High Page", "Hoslow", "Iron", "Juvenile Scholar", "Kaiden", "Knight", "Lazuli Sorcerer", "Leather", "Leyndell Foot Soldier", "Leyndell Knight", "Leyndell Soldier", "Lionel", "Lusat", "Malenia", "Malformed Dragon", "Maliketh", "Marais", "Marionette Soldier", "Mausoleum Foot Soldier", "Mausoleum Knight", "Mausoleum Soldier", "Melinas", "Mushroom", "Night Cavalry", "Night Maiden", "Noble", "Nomadic Merchant", "Nox Monk", "Nox Swordstress", "Old Aristocrat", "Omen", "Omenkiller", "Page", "Perfumer", "Preceptor", "Prisoner", "Prophet", "Queen", "Radahn", "Radahn Foot Soldier", "Radahn Soldier", "Raptor", "Raya Lucarian Foot Soldier", "Raya Lucarian Soldier", "Raya Lucarian Sorcerer", "Redmane Knight", "Ronin", "Rotten Duelist", "Royal Knight", "Royal Remains", "Ruler", "Sage", "Samurai", "Sanguine Noble", "Scaled", "Shaman", "Snow Witch", "Spellblade", "Traveler", "Travelling Maiden", "Tree Sentinel", "Twinned", "Vagabond Knight", "Veteran", "Vulgar Militia", "War Surgeon", "White Reed", "Zamor"];
			let buildpic = document.querySelector("#buildPic");
			for(let i = 0; i < piclist.length; i++) {
				if(piclist[i] == "Radahn") {
					buildpic.appendChild(htmlToElement(`<option selected value="${piclist[i]}">${piclist[i]}</option>`));
				} else {
					buildpic.appendChild(htmlToElement(`<option value="${piclist[i]}">${piclist[i]}</option>`));
				}
			}
			document.querySelector("#buildproperties").hidden = false;
		}
		
	}
}

rhit.MainPageController = class {
	constructor() {
		rhit.fbPublicBuildsManager = new rhit.FbPublicBuildsManager();

		if (rhit.fbAuthManager.isSignedIn) {
			document.getElementById("splashbg").style.display = "none";
		} else {
			document.getElementById("closeSplash").onclick = (event) => {
				document.getElementById("splashbg").style.display = "none";
			}
		}
		document.getElementById("newBuild").onclick = (event) => {
			window.location.href = "/create.html";
		}

		rhit.fbPublicBuildsManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		// console.log("Updating List");
		// console.log(`Num Builds: ${rhit.fbPublicBuildsManager.length}`);

		const newList = htmlToElement('<div id="buildListContainer"></div>');

		for (let i = 0; i < rhit.fbPublicBuildsManager.length; i++) {
			const build = rhit.fbPublicBuildsManager.getBuildAtIndex(i);
			const card = this._createCard(build);
			let pic = "Radahn";
			if(build.pic != null && build.pic != "") {
				pic = build.pic;
			}
			card.style.background = `url("../images/sets/${pic}.png") top center no-repeat, rgba(0, 0, 0, 0.8)`;
			card.style.backgroundSize = "250px";

			card.onclick = (event) => {
				// console.log(`You clicked a card: ${build.id}`);
				window.location.href = `/build.html?id=${build.id}`;
				sessionStorage.setItem("isPublicList", "true");
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
			<div class="cardstats">${build.vigor}/${build.mind}/${build.endurance}/${build.strength}/${build.dexterity}/${build.intelligence}/${build.faith}/${build.arcane}</div>
			<div class="cardname">${build.name}</div>
		</div>`);
	}
}

rhit.checkForRedirects = function () {

	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = `/userpage.html?uid=${rhit.fbAuthManager.uid}`;
	}
}

rhit.initializePage = function () {
	const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#userPage")) {
		const uid = urlParams.get("uid");

		new rhit.UserPageController(uid);
	}

	if (document.querySelector("#createPage")) {
		const uid = urlParams.get("uid");
		const buildId = urlParams.get("id");
		
		new rhit.CreatePageController(uid, buildId);
	}

	if (document.querySelector("#buildPage")) {
		const buildId = urlParams.get("id");

		new rhit.BuildPageController(buildId);
	}

	if (document.querySelector("#loginPage")) {
		
		new rhit.LoginPageController();
	}

	if (document.querySelector("#mainPage")) {

		new rhit.MainPageController();
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
		this._collectionRef = firebase.firestore().collection("Users");
		this._document = null;
		this._unsubscribe = null;
		// console.log("Made user manager");
	}
	addNewUserMaybe(uid, name, photoUrl) {
		const userRef = this._collectionRef.doc(uid);

		return new Promise((resolve, reject) => {
			userRef.get().then((doc) => {
				if (doc.exists) {
					// console.log("User already exists: ", doc.data());
				} else {
					// console.log("Creating user!");

						userRef.set({
							"name": name,
							"photoURL": photoUrl
						})
						.then(function () {
							// console.log("Doc written");
						})
						.catch(function (error) {
							// console.log("Error writing doc: ", error);
							reject();
						});
				}
			})
			.catch((err) => {
				// console.log("Error: ", err);
				reject();
			});
			resolve();
		});
		 
	}

	stopListening() {
		this._unsubscribe();
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
		// console.log("isSignedIn: ", rhit.fbAuthManager.isSignedIn);

		rhit.createUserObjectIfNeeded().then((params) => {
			rhit.initializePage();
		});
	});

	// console.log("Ready");

};

rhit.main();