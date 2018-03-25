$(document).ready(function () {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyAPgxqVAYpOoUjgRYkTKr4oasGvb3y5rS0",
		authDomain: "golden-bonsai-173521.firebaseapp.com",
		databaseURL: "https://golden-bonsai-173521.firebaseio.com",
		projectId: "golden-bonsai-173521",
		storageBucket: "golden-bonsai-173521.appspot.com",
		messagingSenderId: "812205728176"
	};
	firebase.initializeApp(config);


	/* -- Variables -- */

	// Create References
	const dbRef = firebase.database();
	const dbRefTurns = dbRef.ref().child("turns");
	const dbRefPlayers = dbRef.ref().child("players");
	const dbRefChat = dbRef.ref().child("chat");

	// Re-useable quires 
	var $topDisplay = $("#topDisplay");
	var $playerOne = $("#playerOne");
	var $playerTwo = $("#playerTwo");
	var $alertOne = $("#alertOne");
	var $alertTwo = $("#alertTwo");
	var $choicesList = $(".choices");

	// Initial Values
	var name = "";
	var playerOneName;
	var playerOneWins;
	var playerOneLosses;
	var playerOneChoice;
	var playerTwoName;
	var playerTwoWins;
	var playerTwoLosses;
	var playerTwoChoice;
	var wins = 0;
	var losses = 0;
	var choice = "";
	var playersChildren = 0;
	var turn = 0;
	var thisPlayerOne = false;

	/* -- Event listeners -- */

	// Capture Name Button Click
	$("#addUser").on("click", function (event) {
		event.preventDefault();
		name = $("#nameInput").val().trim();
		// Find out how many players are active
		dbRefPlayers.once("value").then(function (snapshot) {
			var playersChildren = snapshot.numChildren();
			setPlayers(playersChildren, name);
		});
		$alertOne.find("form").hide();
	});


	/* -- Functions -- */

	// Set players
	function setPlayers(numberOfPlayers, name) {
		if (numberOfPlayers === 0) {
			// No players yet, setup player one.
			$('body').addClass("playerOneScreen");
			writeUserData(1, name, 0, 0);
			$alertOne.text("Hi " + name + "! You are player 1.");
			$alertTwo.text("Waiting for Player 2 to join...");
			$playerOne.find("header").text(name);
			$playerOne.find(".scoreBoard").show();
			$playerOne.find(".winsRecord").text(wins);
			$playerOne.find(".lossesRecord").text(losses);
			thisPlayerOne = true;
		} else if (numberOfPlayers === 1) {
			// Player one is waiting, setup player two.
			$('body').addClass("playerTwoScreen");
			writeUserData(2, name, 0, 0);
			$alertOne.text("Hi " + name + "! You are player 2.");
			$playerTwo.find("header").text(name);
			$playerTwo.find(".scoreBoard").show();
			$playerTwo.find(".winsRecord").text(wins);
			$playerTwo.find(".lossesRecord").text(losses);
			dbRefTurns.set({
				turn: 1
			});
			thisPlayerOne = false;
			// Now that both players are in the database, we can watch for changes 
			watchPlayers();
		} else {
			console.log("game in progress");
			$topDisplay.append("Sorry " + name + ", Try again later. A game is already in progress");
		}
	}

	// Write player to database
	function writeUserData(playerNumber, name, wins, losses) {
		dbRefPlayers.child(playerNumber).set({
			name: name,
			wins: wins,
			losses: losses,
			choice: choice,
		});
	}

	// Watch DB for Name and score addition 
	dbRefPlayers.on("child_added", function (snap) {
		name = snap.val().name;
		wins = snap.val().wins;
		losses = snap.val().losses;
		console.log("name: " + name + ", key: " + snap.key);
		if (snap.key === "1") {
			playerOneName = name;
			$playerOne.find("header").text(name);
			$playerOne.find(".winsRecord").text(wins);
			$playerOne.find(".lossesRecord").text(losses);
			$playerOne.find(".scoreBoard").show();
		} else if (snap.key === "2") {
			playerTwoName = name;
			$playerTwo.find("header").text(name);
			$playerTwo.find(".winsRecord").text(wins);
			$playerTwo.find(".lossesRecord").text(losses);
			$playerTwo.find(".scoreBoard").show();
		}
	});

	function watchPlayers() {
		// Watch DB for Player One updates
		firebase.database().ref("players/1").on("value", function (snap) {
			playerOneName = snap.val().name;
			playerOneWins = snap.val().wins;
			playerOneLosses = snap.val().losses;
			playerOneChoice = snap.val().choice;
			console.log("PlayerOneName: " + playerOneName);
			console.log("PlayerOneWins: " + playerOneWins);
			console.log("PlayerOneLosses: " + playerOneLosses);
			console.log("playerOneChoice: " + playerOneChoice);
		});

		// Watch DB for Player Two updates
		firebase.database().ref("players/2").on("value", function (snap) {
			playerTwoName = snap.val().name;
			playerTwoWins = snap.val().wins;
			playerTwoLosses = snap.val().losses;
			playerTwoChoice = snap.val().choice;
			console.log("PlayerTwoName: " + playerTwoName);
			console.log("PlayerTwoWins: " + playerTwoWins);
			console.log("PlayerTwoLosses: " + playerTwoLosses);
			console.log("playerTwoChoice: " + playerTwoChoice);
		});
	}

	// Turn 1 - triggered when "turns" is added to database
	dbRefTurns.on("child_added", function (snap) {
		turn = snap.val();
		console.log(turn + " is current turn on child_added");
		if (thisPlayerOne == true && turn === 1) {
			$(".playerOneScreen #playerOne").find(".choices").show();
			$(".playerOneScreen #alertTwo").text("It's your turn!");
		} else if (thisPlayerOne == false && turn === 1) {
			$(".playerTwoScreen #alertTwo").text("Waiting for " + playerOneName + " to choose.");
		}
	});

	//Player One makes a choice
	$('#playerOne .choices').on("click", "li", function () {
		playerOneChoice = $(this).attr("data-choice");
		$("#playerOne .displayChoice").text(playerOneChoice);
		console.log(playerOneChoice);
		dbRef.ref("players/1/").update({
			choice: playerOneChoice
		});
		dbRefTurns.update({
			turn: 2
		});
	});

	// Turn 2 - Triggered when "turns/turn" is changed
	dbRefTurns.on("child_changed", function (snap) {
		turn = snap.val();
		console.log(turn + " is current turn on child_changed");
		if (thisPlayerOne == true && turn == 2) {
			$(".playerOneScreen #playerOne").find(".choices").hide();
			$(".playerOneScreen #alertTwo").text("Waiting for " + playerTwoName + " to choose.");
		} else if (thisPlayerOne == false && turn === 2) {
			$(".playerTwoScreen #playerTwo").find(".choices").show();
			$(".playerTwoScreen #alertTwo").text("It's your turn!");
		}
	});

	//Player Two Makes a Choice
	$('#playerTwo .choices').on("click", "li", function () {
		playerTwoChoice = $(this).attr("data-choice");
		$("#playerTwo .displayChoice").text(playerTwoChoice);
		console.log(playerTwoChoice);
		dbRef.ref("players/2/").update({
			choice: playerTwoChoice
		});
		dbRefTurns.update({
			turn: 3
		});
		$('#playerTwo .choices').hide();
		resultsScreen("Josh");
	});

	// Turn 3 - Results screen
	function resultsScreen(theWinner) {
		$("#playerOne .displayChoice").text(playerOneChoice);
		$("#playerTwo .displayChoice").text(playerTwoChoice);
		$("#whoWins header").text(theWinner + " for the win!");
	}



















}); //end doc ready