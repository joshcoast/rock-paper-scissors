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
	var whoWins;

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
			// No players yet, setup Player One.
			$('body').addClass("playerOneScreen");
			writeUserData(1, name, 0, 0, "none");
			$alertOne.text("Hi " + name + "! You are player 1.");
			$alertTwo.text("Waiting for Player 2 to join...");
			$playerOne.find("header").text(name);
			$playerOne.find(".scoreBoard").show();
			$playerOne.find(".winsRecord").text(wins);
			$playerOne.find(".lossesRecord").text(losses);
			thisPlayerOne = true;
			watchPlayerOne();
		} else if (numberOfPlayers === 1) {
			// Player One is waiting, setup Player Two.
			$('body').addClass("playerTwoScreen");
			writeUserData(2, name, 0, 0, "none");
			$alertOne.text("Hi " + name + "! You are player 2.");
			$playerTwo.find("header").text(name);
			$playerTwo.find(".scoreBoard").show();
			$playerTwo.find(".winsRecord").text(wins);
			$playerTwo.find(".lossesRecord").text(losses);
			dbRefTurns.set({
				turn: 1
			});
			thisPlayerOne = false;
			watchPlayerTwo();
		} else {
			console.log("game in progress");
			$topDisplay.append("Sorry " + name + ", Try again later. A game is already in progress :( ");
		}
	}

	// Write player to database
	function writeUserData(playerNumber, name, wins, losses, choice) {
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
		//Build Player Screen
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

	function watchPlayerOne() {
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
	}

	function watchPlayerTwo() {
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

	//Player One makes a choice
	$('#playerOne .choices').on("click", "li", function () {
		playerOneChoice = $(this).attr("data-choice");
		$("#playerOne .displayChoice").text(playerOneChoice);
		console.log("On click Player One Chose: " + playerOneChoice);
		watchPlayerTwo();
		dbRef.ref("players/1/").update({
			choice: playerOneChoice
		});
		dbRefTurns.update({
			turn: 2
		});
	});

	//Player Two Makes a Choice
	$('#playerTwo .choices').on("click", "li", function () {
		playerTwoChoice = $(this).attr("data-choice");
		$("#playerTwo .displayChoice").text(playerTwoChoice);
		console.log("On click Player Two Chose: " + playerTwoChoice);
		watchPlayerOne();
		dbRef.ref("players/2/").update({
			choice: playerTwoChoice
		});
		dbRefTurns.update({
			turn: 3
		});
		$('#playerTwo .choices').hide();
	});

	// Turn 1 - triggered when "turns/turn" is added to database
	dbRefTurns.on("child_added", function (snap) {
		turn = snap.val();
		if (thisPlayerOne == true && turn === 1) {
			$(".playerOneScreen #playerOne").find(".choices").show();
			$(".playerOneScreen #alertTwo").text("It's your turn!");
		} else if (thisPlayerOne == false && turn === 1) {
			$(".playerTwoScreen #alertTwo").text("Waiting for " + playerOneName + " to choose.");
		}
	});

	// Turn 2 - Triggered when "turns/turn" is changed
	dbRefTurns.on("child_changed", function (snap) {
		turn = snap.val();
		console.log(turn + " is current turn on dbRefTurns child_changed");
		if (thisPlayerOne == true && turn == 2) {
			$(".playerOneScreen #playerOne").find(".choices").hide();
			$(".playerOneScreen #alertTwo").text("Waiting for " + playerTwoName + " to choose.");
		} else if (thisPlayerOne == false && turn === 2) {
			$(".playerTwoScreen #playerTwo").find(".choices").show();
			$(".playerTwoScreen #alertTwo").text("It's your turn!");
		}
		if (turn == 3) {
			console.log(playerTwoChoice + " please?");
			gameLogic(playerOneChoice, playerTwoChoice);
		}
	});

	function gameLogic(playerOneChoice, playerTwoChoice) {
		if ((playerOneChoice === "rock") || (playerOneChoice === "paper") || (playerOneChoice === "scissors")) {

			if ((playerOneChoice === "rock") && (playerTwoChoice === "scissors")) {
				whoWins = "p1";
				playerOneWins++;
				playerTwoLosses++;
			} else if ((playerOneChoice === "rock") && (playerTwoChoice === "paper")) {
				whoWins = "p2";
				playerOneLosses++;
				playerTwoWins++;
			} else if ((playerOneChoice === "scissors") && (playerTwoChoice === "rock")) {
				whoWins = "p2";
				playerOneLosses++;
				playerTwoWins++;
			} else if ((playerOneChoice === "scissors") && (playerTwoChoice === "paper")) {
				whoWins = "p1";
				playerOneWins++;
				playerTwoLosses++;
			} else if ((playerOneChoice === "paper") && (playerTwoChoice === "rock")) {
				whoWins = "p1";
				playerOneWins++;
				playerTwoLosses++;
			} else if ((playerOneChoice === "paper") && (playerTwoChoice === "scissors")) {
				whoWins = "p2";
				playerOneLosses++;
				playerTwoWins++;
			} else if (playerOneChoice === playerTwoChoice) {
				whoWins = "tie";
			}

			console.log("winner: " + whoWins);
			console.log("playerOneWins: " + playerOneWins);
			console.log("playerOneLosses: " + playerOneLosses);
			console.log("playerTwoWins: " + playerTwoWins);
			console.log("playerTwoLosses: " + playerTwoLosses);

			writeUserData(1, playerOneName, playerOneWins, playerOneLosses, playerOneChoice);
			writeUserData(2, playerTwoName, playerTwoWins, playerTwoLosses, playerTwoChoice);
			results();
		}
	}

	function results(){
		console.log("results fired");
		$("#playerOne .displayChoice").text(playerOneChoice);
		$("#playerOne .scoreBoard .winsRecord").text(playerOneWins);
		$("#playerOne .scoreBoard .lossesRecord").text(playerOneLosses);

		$("#playerTwo .displayChoice").text(playerTwoChoice);
		$("#playerTwo .scoreBoard .winsRecord").text(playerTwoWins);
		$("#playerTwo .scoreBoard .lossesRecord").text(playerTwoLosses);

		if (whoWins === "p1") {
			$("#whoWins header").text(playerOneName +  " for the win!");
		} else if (whoWins === "p2") {
			$("#whoWins header").text(playerTwoName +  " for the win!");
		} else {
			$("#whoWins header").text("It was a TIE dog!");
		}
	}

	function resetGame() {
		
	}























}); //end doc ready