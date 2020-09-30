
var goodCards = ["fates", "jester", "key", "knight", "moon", "star", "sun", "vizier"]
var goodCardsEffects = ["erase one event", "gain 10000 xp OR draw two more cards", "get a weapon", "gain a fighter ally", "cast wish 1d3 times", "increase one ability by 2", "gain 50000 xp and a wondrous item", "have a question answered truthfully"]
var neutralCards = ["comet"]
var neutralCardsEffects = ["if you singlehandedly defeat the next encounter, you gain a level"]
var badCards = ["balance", "euryale", "flames", "fool", "idiot", "rogue", "ruin", "skull", "talon"]
var badCardsEffects = ["alignment is switched. lawful <--> chaotic, good <--> evil", "cursed with -2 penalty on saving throws", "a devil becomes your enemy until you or it dies", "lose 10000 xp and draw again", "reduce intelligence by 1d4 + 1, but you can draw one additional card", "an NPC somewhere becomes hostile", "all forms of wealth (other than magic) are lost", "must singlehandedly defeat an avatar of death", "all magic items worn or carried disintegrate"]
var veryBadCards = ["donjon", "void"]
var veryBadCardsEffects = ["become entombed in an extradimensional sphere. cannot draw further cards", "soul contained in an object in a place of the DM's choice. cannot draw further cards"]
var allCards = goodCards.concat(neutralCards, badCards, veryBadCards)
var allCardsEffects = goodCardsEffects.concat(neutralCardsEffects, badCardsEffects, veryBadCardsEffects)

var numChars = 5
var characters = ["cern", "henry", "glenn", "ron", "dog"]
var charsDraws = [2, 3, 4, 2, 2]
var idsSuffix = "-cards";
var effectsIdSuffix = "-effects";

var currentDeck = [...allCards]
var allCharCards = []
var allCharEffects = []

function onGenerateScenarioClick() {
	onClearClick();
	generateScenario();
	setScenarioUI();
}

function generateScenario() {
	resetDeck();
	// Roll cards for cern until he gets a valid combination
	while (!drawCards(0)) {
		console.log("invalid configuration found for cern, restarting")
		resetDeck();
	}
	
	// Draw remaining cards
	for (var remainingCharIndex = 1; remainingCharIndex < numChars; remainingCharIndex++ ) {
		drawCards(remainingCharIndex)
	}
}

function drawCards(charId) {
	var numCards = charsDraws[charId];
	var charCards = [];
	var charCardEffects = [];
	for (var cardIndex = 0; cardIndex < numCards; cardIndex++) {
		var card = currentDeck.pop();
		var cardEffectIndex = allCards.indexOf(card)
		var cardEffect = allCardsEffects[cardEffectIndex]
		
		// Determine if we should stop here
		if (card == "donjon" || card == "void") {
			cardEffect = cardEffect.concat(" (no more cards can be drawn)")
			numCards = 0;
		}
		if (currentDeck.length == 0) {
			console.log("ran out of cards!")
			return false;
		}
		// Determine if additional cards can be drawn
		if (card == "jester" && flipCoin()) {
			numCards = numCards + 2;
			cardEffect = cardEffect.concat(" (two add'l cards drawn due to jester)")
		}
		if (card == "idiot" && flipCoin()) {
			numCards = numCards + 1;
			cardEffect = cardEffect.concat(" (one add'l card drawn due to idiot)")
		}
		if (card == "fool") {
			numCards = numCards + 1;
			cardEffect = cardEffect.concat(" (one add'l card drawn due to fool)")
			// Hack for Cern- if this is his first card, reduce his intent to one
			if (charId == 0) {
				numCards = 1;
			}
		}
		charCards.push(card)
		charCardEffects.push(cardEffect)
	}
	// Special case for Cern- he can only have drawn 2 cards and neither of them are void or donjon
	if (charId == 0) {
		if (charCards.length != 2) {
			// Drew too many or too few cards
			return false;
			
		}
		if (veryBadCards.indexOf(charCards[0]) != -1 || veryBadCards.indexOf(charCards[1]) != -1) {
			// Drew a card that shouldn't be possible
			return false;
		}			
	}
	
	allCharCards.push(charCards);
	allCharEffects.push(charCardEffects);
	return true;
}

function flipCoin() {
	if (Math.random() < 0.5) {
		console.log("coin flipped heads")
		return true;
	} else {
		console.log("coin flipped tails")
		return false;
	}
}

function onClearClick() {
	resetDeck()
	resetUI()
}

function resetDeck() {
	currentDeck = [...allCards]
	shuffleDeck() 
	allCharCards = []
	allCharEffects = []
}

function shuffleDeck() {
	var numCards = currentDeck.length
	for (var i1 = numCards - 1; i1 > 0; i1--) {
		var j1 = Math.floor(Math.random() * (i1 + 1));
		var temp = currentDeck[i1];
		currentDeck[i1] = currentDeck[j1];
		currentDeck[j1] = temp;
	}
}

function setScenarioUI() {
	for (var charIndex = 0; charIndex < numChars; charIndex++) {
		var characterName = characters[charIndex];
		var charCards = allCharCards[charIndex];
		var charCardEffects = allCharEffects[charIndex];
		
		var numCards = charCards.length
		var charCardsId = characterName.concat(idsSuffix)
		var charEffectsId = characterName.concat(effectsIdSuffix)
		var cardsCell = document.getElementById(charCardsId)
		var cardsList = "<ol>";
		for (var i = 0; i < numCards; i++) {
			var card = charCards[i]
			// Decide text color to convey 'badness' of outcome
			if (badCards.indexOf(card) != -1) {
				cardsList = cardsList.concat("<li class='bad'>")
			} else if (goodCards.indexOf(card) != -1) {
				cardsList = cardsList.concat("<li class='good'>")
			} else if (veryBadCards.indexOf(card) != -1) {
				cardsList = cardsList.concat("<li class='verybad'>")
			} else {
				cardsList = cardsList.concat("<li class='neutral'>")
			}
			cardsList = cardsList.concat(card)
			cardsList = cardsList.concat("</li>")
		}
		cardsList = cardsList.concat("</ol>")
		cardsCell.innerHTML = cardsList;
		
		var cardEffectsCell = document.getElementById(charEffectsId)
		var cardEffectsList = "<ol>";
		for (var i = 0; i < numCards; i++) {
			cardEffectsList = cardEffectsList.concat("<li>")
			cardEffectsList = cardEffectsList.concat(charCardEffects[i])
			cardEffectsList = cardEffectsList.concat("</li>")
		}
		cardEffectsList = cardEffectsList.concat("</ol>")
		cardEffectsCell.innerHTML = cardEffectsList;
	}
}

function resetUI() {
	for (var i = 0; i < numChars; i++) {
		var charCardsId = characters[i].concat(idsSuffix)
		var charEffectsId = characters[i].concat(effectsIdSuffix)
		var cardsCell = document.getElementById(charCardsId)
		var cardEffectsCell = document.getElementById(charEffectsId)
		cardsCell.innerHTML = "";
		cardEffectsCell.innerHTML = "";
	}
}

// Stat totals for each card drawn
var cernMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var henryMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var glennMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var ronMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var dogMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var allData = [cernMcData, henryMcData, glennMcData, ronMcData, dogMcData];
var rowIdSuffix = "-row";
var cellIdConcat = "-";
var numBadTrials = 0;
var numWishTrials = 0;
var numBossTrials = 0;

function onMontecarloClick() {
	resetDeck();
	resetMCUI();
	var numTrials = document.getElementById("trials").value
	for (var i = 0; i < numTrials; i++) {
		generateScenario();
		// Update totals
		var veryBadDrawn = false;
		var wishDrawn = false;
		var bossDrawn = false;
		for (var charNameIndex = 0; charNameIndex < numChars; charNameIndex++) {
			var cards = allCharCards[charNameIndex];
			for (var c = 0; c < cards.length; c++) {
				// Get index of card
				var cardIndex = allCards.indexOf(cards[c]);
				allData[charNameIndex][cardIndex]++;
				if (!veryBadDrawn && (cards[c] == "void" || cards[c] == "donjon")) {
					veryBadDrawn = true;
				}
				if (!wishDrawn && (cards[c] == "moon" || cards[c] == "fates")) {
					wishDrawn = true;
				}
				if (!bossDrawn && (cards[c] == "flames" || cards[c] == "skull")) {
					bossDrawn = true;
				}
			}
		}
		if (veryBadDrawn) {
			numBadTrials++;
		}
		if (wishDrawn) {
			numWishTrials++;
		}
		if (bossDrawn) {
			numBossTrials++;
		}
	}
	showMonteCarloData(numTrials);
}

var humanReadableNames = ["Cern", "Henry", "Glenn", "Ron", "Mr. Mustache"];

function showMonteCarloData(numTrials) {
	var headerHtml = "<th>Character</th>";
	for (var i = 0; i < allCards.length; i++) {
		headerHtml = headerHtml.concat("<th>");
		headerHtml = headerHtml.concat(allCards[i]);
		headerHtml = headerHtml.concat("</th>");
	}
	document.getElementById("header-row").innerHTML = headerHtml;
	
	for (var charId = 0; charId < numChars; charId++) {
		var charRowName = characters[charId].concat(rowIdSuffix);
		var rowHtml = "<td>"
		rowHtml = rowHtml.concat(humanReadableNames[charId]);
		rowHtml = rowHtml.concat("</td>");
		var cardCounts = allData[charId];
		for (var cardIndex = 0; cardIndex < allCards.length; cardIndex++) {
			rowHtml = rowHtml.concat("<td>");
			var percent = Math.floor(cardCounts[cardIndex] / numTrials * 100);
			rowHtml = rowHtml.concat(percent);
			rowHtml = rowHtml.concat("%</td>");
		}
		
		document.getElementById(charRowName).innerHTML = rowHtml;
	}
	
	var veryBadPercent = Math.floor(numBadTrials / numTrials * 100)
	document.getElementById("num-bad-trials").innerHTML = veryBadPercent
	var wishPercent = Math.floor(numWishTrials / numTrials * 100)
	document.getElementById("num-wish-trials").innerHTML = wishPercent
	var bossPercent = Math.floor(numBossTrials / numTrials * 100)
	document.getElementById("num-boss-trials").innerHTML = bossPercent
}

function resetMCUI() {
	cernMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	henryMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	glennMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	ronMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	dogMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	allData = [cernMcData, henryMcData, glennMcData, ronMcData, dogMcData];
	numBadTrials = 0;
	numWishTrials = 0;
	numBossTrials = 0;
	document.getElementById("header-row").innerHTML = "";
	for (var i = 0; i < numChars; i++) {
		var elementName = characters[i].concat(rowIdSuffix);
		document.getElementById(elementName).innerHTML = "";
	}
}