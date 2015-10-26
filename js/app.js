var Model = {
  flashCards: []
};

var currentCard;
var onQuestion = true;

var FlashCard = function(question, answer) {
  this.question = question;
  this.answer = answer;
};


//Future TODO: tie in with API (wolfram alpha?) to have answers populate themselves
// Furutre TODO: or create a generate deck based on popular questions?

function initCards() {
  Model.flashCards.push(new FlashCard('What does this refer to in a click event callback function?',
                                'The Element that was Clicked on'));
  Model.flashCards.push(new FlashCard('5 + 5', '10'));
  Model.flashCards.push(new FlashCard('hello', 'ni hao'));
}

initCards();
currentCardIndex = 0;
setCurrentCard(0);

function setCurrentCard(index) {
  currentCard = Model.flashCards[index];
}

function initDisplay() {
  $('#card').html(currentCard.question);
}

initDisplay();

function flipCard() {
  if (onQuestion) {
    $('#card').html(currentCard.answer);
    onQuestion = !onQuestion;
  } else {
    $('#card').html(currentCard.question);
    onQuestion = !onQuestion;
  }
}

$('.flip').on('click', flipCard);
$('.next').on('click', nextCard);

function nextCard() {
  if (currentCardIndex < Model.flashCards.length - 1) {
    currentCardIndex++;
    setCurrentCard(currentCardIndex);
    initDisplay();
  }
}
