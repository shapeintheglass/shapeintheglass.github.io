
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

var currentDeck = [...allCards]

var numChars = 5
var charsIds = ["cern-cards", "henry-cards", "glenn-cards", "ron-cards", "dog-cards"]
var charsEffectsIds = ["cern-effects", "henry-effects", "glenn-effects", "ron-effects", "dog-effects"]
var charsDraws = [2, 3, 4, 2, 2]

function onGenerateScenarioClick() {
	onClearClick()
	for (var i = 0; i < numChars; i++ ) {
		drawCards(charsDraws[i], charsIds[i], charsEffectsIds[i])
	}
}

function drawCards(numCards, charId, charEffectsId) {
	var charCards = [];
	var charCardEffects = [];
	for (var i = 0; i < numCards; i++) {
		var card = currentDeck.pop();
		var cardEffectIndex = allCards.indexOf(card)
		var cardEffect = allCardsEffects[cardEffectIndex]

		
		// Determine if we should stop here
		if (card == "donjon" || card == "void") {
			cardEffect = cardEffect.concat(" (no more cards can be drawn)")
			numCards = 0;
		}
		// Determine if additional cards can be drawn
		if (card == "jester" && flipCoin) {
			numCards = numCards + 2;
			cardEffect = cardEffect.concat(" (two add'l cards drawn due to jester)")
		}
		if (card == "idiot" && flipCoin) {
			numCards = numCards + 1;
			cardEffect = cardEffect.concat(" (one add'l card drawn due to idiot)")
		}
		if (card == "fool") {
			numCards = numCards + 1;
			cardEffect = cardEffect.concat(" (one add'l card drawn due to fool)")
		}
		charCards.push(card)
		charCardEffects.push(cardEffect)
	}
	updateCardsAndEffects(charId, charEffectsId, charCards, charCardEffects)
}

function flipCoin() {
	return Math.random < 0.5;
}

function onClearClick() {
	resetDeck()
	resetUI()
}

function resetDeck() {
	currentDeck = [...allCards]
	shuffleDeck() 
	var charsCards = [[]]
}

function shuffleDeck() {
	var numCards = currentDeck.length
	for (var i = numCards - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = currentDeck[i];
		currentDeck[i] = currentDeck[j];
		currentDeck[j] = temp;
	}
}

function updateCardsAndEffects(charId, charEffectsId, charCards, charCardEffects) {
	var numCards = charCards.length
	var cardsCell = document.getElementById(charId)
	var cardsList = "<ol>";
	for (var i = 0; i < numCards; i++) {
		cardsList = cardsList.concat("<li>")
		cardsList = cardsList.concat(charCards[i])
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

function resetUI() {
	for (var i = 0; i < numChars; i++) {
		var cardsCell = document.getElementById(charsIds[i])
		var cardEffectsCell = document.getElementById(charsEffectsIds[i])
		cardsCell.innerHTML = "";
		cardEffectsCell.innerHTML = "";
	}
}