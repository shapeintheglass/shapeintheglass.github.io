var veryGoodCards = ["fates", "moon"]
var veryGoodCardsEffects = ["erase one event", "cast wish 1d3 times"]
var goodCards = ["jester", "key", "knight", "star", "sun", "vizier"]
var goodCardsEffects = ["gain 10000 xp or draw two more cards", "get a weapon", "gain a fighter ally", "increase one ability by 2", "gain 50000 xp and a wondrous item", "have a question answered truthfully"]
var neutralCards = ["comet"]
var neutralCardsEffects = ["if you singlehandedly defeat the next encounter, you gain a level"]
var badCards = ["balance", "euryale", "flames", "fool", "idiot", "rogue", "ruin", "skull", "talon"]
var badCardsEffects = ["alignment is switched. lawful <--> chaotic, good <--> evil", "cursed with -2 penalty on saving throws", "a devil becomes your enemy until you or it dies", "lose 10000 xp and draw again", "reduce intelligence by 1d4 + 1, but you can draw one additional card", "an NPC somewhere becomes hostile", "all forms of wealth (other than magic) are lost", "must singlehandedly defeat an avatar of death", "all magic items worn or carried disintegrate"]
var veryBadCards = ["donjon", "void"]
var veryBadCardsEffects = ["become entombed in an extradimensional sphere. cannot draw further cards", "soul contained in an object in a place of the DM's choice. cannot draw further cards"]
var allCards = veryGoodCards.concat(goodCards, neutralCards, badCards, veryBadCards)
var allCardsEffects = veryGoodCardsEffects.concat(goodCardsEffects, neutralCardsEffects, badCardsEffects, veryBadCardsEffects)

var numChars = 5
var characters = ["cern", "henry", "glenn", "ron", "dog"]
var charsDraws = [2, 3, 4, 2, 2]
var idsSuffix = "-cards";
var effectsIdSuffix = "-effects";
var invalidCernCards = ["void", "donjon", "talon"]

var currentDeck = [...allCards]
var allCharCards = []
var allCharEffects = []

var isSeqRuleset = true;

var drawFiftyFifty = true;
var alwaysDraw = false;

var stopAtWish = false;

function onGenerateScenarioClick() {
	onClearClick();
	generateScenario();
	setScenarioUI();
}

function generateScenario(isMonteCarlo = false) {
	resetDeck();
	// Get which ruleset to use
	isSeqRuleset = document.getElementById('ruleset-seq').checked;

	drawFiftyFifty = document.getElementById('ruleset-sometimespull').checked;
	alwaysDraw = document.getElementById('ruleset-alwayspull').checked;

	stopAtWish = document.getElementById('ruleset-yeswish').checked;
	
	// Roll cards for cern until he gets a valid combination
	while (!drawCards(0)) {
		if (!isMonteCarlo) {
			console.log("invalid configuration found for cern, restarting")
		}
		resetDeck();
	}
	
	// Draw remaining cards
	var skipDiscarded = isSeqRuleset && isMonteCarlo;
	for (var remainingCharIndex = 1; remainingCharIndex < numChars; remainingCharIndex++) {
		drawCards(remainingCharIndex, skipDiscarded)
	}
}

// Gets cards for a particular character by id.
function drawCards(charId, skipDiscarded = false) {
	var isCern = charId == 0;
	var numCards = charsDraws[charId];
	var charCards = [];
	var charCardEffects = [];
	var shouldDiscard = false;
	var discardReason = "";

	for (var cardIndex = 0; cardIndex < numCards; cardIndex++) {
		if (currentDeck.length == 0) {
			console.log("ran out of cards!")
			return false;
		}

		var card = currentDeck.pop();

		if (shouldDiscard && skipDiscarded) {
			continue;
		}

		var cardEffectIndex = allCards.indexOf(card)
		var cardEffect = allCardsEffects[cardEffectIndex]
		
		var shouldDrawExtraCards = drawFiftyFifty ? flipCoin() : alwaysDraw;

		if (shouldDiscard) {
			cardEffect = cardEffect.concat(discardReason);
		} else {
			// Check for card special cases to determine additional effects
			switch(card) {
				// Cards that stop everything
				case "donjon":
				case "void":
				case "talon":
					if (isSeqRuleset) {
						cardEffect = cardEffect.concat(" <span class='special-effect'>(all remaining cards are nullified!)</span>")
						shouldDiscard = true;
						discardReason = " (nullified due to ".concat(card).concat(")");
					} else {
						cardEffect = cardEffect.concat(" <span class='special-effect'>(imprisoned!)</span>")
					}
					break;
				// Cards that have a chance of drawing 2 more cards
				case "jester":
					if (!isCern && shouldDrawExtraCards) {
						numCards = numCards + 2;
						cardEffect = cardEffect.concat(" <span class='special-effect'>(+2 cards drawn due to jester)</span>")
					}
					break;
				// Cards that have a chance of drawing 1 more card
				case "idiot":
					if (!isCern && shouldDrawExtraCards) {
						numCards = numCards + 2;
						cardEffect = cardEffect.concat(" <span class='special-effect'>(+1 card drawn due to idiot)</span>")
					}
					break;
				// Cards that force drawing 1 more card
				case "fool":
					// Hack for Cern- if he gets this card, don't redraw (treat his first card as the redraw)
					if (!isCern) {
						numCards = numCards + 1;
					}
					cardEffect = cardEffect.concat(" <span class='special-effect'>(+1 card drawn due to fool)</span>")
					break;
				// Cards that fix everything
				case "moon":
				case "fates":
					if (!isCern && stopAtWish) {
						cardEffect = cardEffect.concat(" <span class='special-effect'>(fate averted!)</span>")
						numCards = 0;
						charsDraws = [0, 0, 0, 0, 0];
					}
					break;
			}
		}
		charCards.push(card)
		charCardEffects.push(cardEffect)
	} // end for loop

	// Special case for Cern- he can only have drawn 2 cards and neither of them are void or donjon (or talon)
	if (isCern) {
		if (charCards.length != 2) {
			// Drew too many or too few cards
			return false;
			
		}
		if (invalidCernCards.indexOf(charCards[0]) != -1 || invalidCernCards.indexOf(charCards[1]) != -1) {
			// Drew a card that shouldn't be possible
			return false;
		}
	}
	
	allCharCards.push(charCards);
	allCharEffects.push(charCardEffects);
	return true;
}

function flipCoin() {
	return Math.random() < 0.5;
}

function onClearClick() {
	resetDeck()
	resetUI()
}

function resetDeck() {
	charsDraws = [2, 3, 4, 2, 2]
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
		var numCellId = characterName.concat("-num")
		var cardsCell = document.getElementById(charCardsId)
		var cardsList = "<ol>";
		for (var i = 0; i < numCards; i++) {
			var cardRowHtml = getCardRowHtml(charCards[i]);
			cardsList = cardsList.concat(cardRowHtml);
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

		var numCell = document.getElementById(numCellId);
		numCell.innerHTML = numCards;
	}

	// Remaining cards and effects
	var remainingCardsCell = document.getElementById("remaining-cards");
	var remainingEffectsCell = document.getElementById("remaining-effects");
	var remainingCountCell = document.getElementById("num-remaining");
	var remCardsHtml = "<ol>";
	var remEffectsHtml = "<ol>";
	for (var i = 0; i < currentDeck.length; i++) {
		remCardsHtml = remCardsHtml.concat(getCardRowHtml(currentDeck[i]));
		var cardId = allCards.indexOf(currentDeck[i]);
		remEffectsHtml = remEffectsHtml.concat("<li>").concat(allCardsEffects[cardId]).concat("</li>");
	}
	remCardsHtml = remCardsHtml.concat("</ol>");
	remEffectsHtml = remEffectsHtml.concat("</ol>");

	remainingCountCell.innerHTML = currentDeck.length;
	remainingCardsCell.innerHTML = remCardsHtml;
	remainingEffectsCell.innerHTML = remEffectsHtml;
}

function getCardRowHtml(card) {
	var cardRowHtml = "";
	// Decide text color to convey 'badness' of outcome
	if (badCards.indexOf(card) != -1) {
		cardRowHtml = "<li class='bad'>"
	} else if (goodCards.indexOf(card) != -1) {
		cardRowHtml = "<li class='good'>"
	} else if (veryGoodCards.indexOf(card) != -1) {
		cardRowHtml = "<li class='verygood'>"
	} else if (veryBadCards.indexOf(card) != -1) {
		cardRowHtml = "<li class='verybad'>"
	} else {
		cardRowHtml = "<li class='neutral'>"
	}
	cardRowHtml = cardRowHtml.concat(card)
	cardRowHtml = cardRowHtml.concat("</li>")
	return cardRowHtml;
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
var remainingMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var allData = [cernMcData, henryMcData, glennMcData, ronMcData, dogMcData];
var rowIdSuffix = "-row";
var cellIdConcat = "-";
var numBadTrials = 0;
var numWishTrials = 0;
var numBossTrials = 0;
var totalRemaining = 0;
var totalRemainingWithoutWish = 0;

function onMontecarloClick() {
	resetDeck();
	resetMCUI();
	var numTrials = document.getElementById("trials").value
	for (var i = 0; i < numTrials; i++) {
		generateScenario(true);
		// Update totals
		var veryBadDrawn = false;
		var wishDrawn = false;
		var bossDrawn = false;
		for (var charNameIndex = 0; charNameIndex < numChars; charNameIndex++) {
			var isCern = charNameIndex == 0;
			var cards = allCharCards[charNameIndex];
			for (var c = 0; c < cards.length; c++) {
				// Get index of card
				var cardIndex = allCards.indexOf(cards[c]);
				allData[charNameIndex][cardIndex]++;

				if (!isCern && !veryBadDrawn && (cards[c] == "void" || cards[c] == "donjon")) {
					veryBadDrawn = true;
				}
				if (!isCern && !wishDrawn && (cards[c] == "moon" || cards[c] == "fates")) {
					wishDrawn = true;
				}
				if (!isCern && !bossDrawn && (cards[c] == "flames" || cards[c] == "skull")) {
					bossDrawn = true;
				}
			}
		}
		for (var c = 0; c < currentDeck.length; c++) {
			var cardIndex = allCards.indexOf(currentDeck[c]);
			remainingMcData[cardIndex]++;
		}
		totalRemaining += currentDeck.length;
		if (veryBadDrawn) {
			numBadTrials++;
		}
		if (wishDrawn) {
			numWishTrials++;
		} else {
			totalRemainingWithoutWish += currentDeck.length;
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
	
	var remainingRowHtml = "<td><i>Not drawn/<br/>nullified</i></td>";
	for (var cardId = 0; cardId < allCards.length; cardId++) {
		var cellHtml = "<td>"
		
		var percent = Math.floor(remainingMcData[cardId] / numTrials * 100);
		cellHtml = cellHtml.concat(percent);
		cellHtml = cellHtml.concat("%</td>");
		remainingRowHtml = remainingRowHtml.concat(cellHtml);
	}
	document.getElementById("remaining-row").innerHTML = remainingRowHtml;
	
	var veryBadPercent = Math.floor(numBadTrials / numTrials * 100)
	document.getElementById("num-bad-trials").innerHTML = veryBadPercent
	var wishPercent = Math.floor(numWishTrials / numTrials * 100)
	document.getElementById("num-wish-trials").innerHTML = wishPercent
	var bossPercent = Math.floor(numBossTrials / numTrials * 100)
	document.getElementById("num-boss-trials").innerHTML = bossPercent
	var avgNumRemaining = Math.ceil(totalRemaining / numTrials)
	document.getElementById("avg-cards-remaining").innerHTML = avgNumRemaining;
	var avgNumRemainingWoWish = Math.ceil(totalRemainingWithoutWish / (numTrials - numWishTrials))
	document.getElementById("avg-cards-remaining-nowish").innerHTML = avgNumRemainingWoWish;
}

function resetMCUI() {
	cernMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	henryMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	glennMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	ronMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	dogMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	remainingMcData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	allData = [cernMcData, henryMcData, glennMcData, ronMcData, dogMcData];
	numBadTrials = 0;
	numWishTrials = 0;
	numBossTrials = 0;
	totalRemaining = 0;
	totalRemainingWithoutWish = 0;
	document.getElementById("header-row").innerHTML = "";
	for (var i = 0; i < numChars; i++) {
		var elementName = characters[i].concat(rowIdSuffix);
		document.getElementById(elementName).innerHTML = "";
	}
}