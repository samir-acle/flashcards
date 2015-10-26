// data for flash cards
var flashCards = [];

var FlashCard = function(question, answer) {
  this.question = question;
  this.answer = answer;
};


//Future TODO: tie in with API (wolfram alpha?) to have answers populate themselves
// Furutre TODO: or create a generate deck based on popular questions?

function initCards() {
  flashCards.push(new FlashCard('What does this refer to in a click event callback function?',
                                'The Element that was Clicked on'));
  flashCards.push(new FlashCard('5 + 5', '10'));
}

initCards();

function initDisplay() {
  $('#card').html(flashCards[0].question);
}

initDisplay();

function flipCard() {
  $('#card').html(flashCards[0].answer);
}

$('.flip').on('click', flipCard);
