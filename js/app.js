'use strict';

var Model = {
  flashcards: []
};

var FlashCard = function(question, answer) {
  this.question = question;
  this.answer = answer;
};

FlashCard.prototype = {
  constructor: FlashCard,
  setAsWrong: function() {
    this.lastAnswer = 'wrong';
  },
  setAsRight: function() {
    this.lastAnswer = 'right';
  }
};


var Game = {
  currentCardIndex: 0,
  onQuestion: true,
  wrongArray: Model.flashcards,
  correctArray: [],
  numberRight: 0,
  numberWrong: 0
};


//Future TODO: tie in with API (wolfram alpha?) to have answers populate themselves
// Furutre TODO: or create a generate deck based on popular questions?

var initCards = function() {
  Model.flashcards.push(new FlashCard('What does this refer to in a click event callback function?',
                                'The Element that was Clicked on'));
  Model.flashcards.push(new FlashCard('5 + 5', '10'));
  Model.flashcards.push(new FlashCard('hello', 'ni hao'));
  Model.flashcards.push(new FlashCard('quest',
                                'answer'));
  Model.flashcards.push(new FlashCard('no', 'way'));
  Model.flashcards.push(new FlashCard('goodbye', 'zai jian'));
};

initCards();
setCurrentCard(0);

function setCurrentCard(index) {
  Game.currentCard = Model.flashcards[index];
}

function initDisplay() {
  $('.card-text').html(Game.currentCard.question);
}

initDisplay();

function flipCard() {
  if (Game.onQuestion) {
    $('.card-text').html(Game.currentCard.answer);
    Game.onQuestion = !Game.onQuestion;
  } else {
    $('.card-text').html(Game.currentCard.question);
    Game.onQuestion = !Game.onQuestion;
  }
}


$('.flip').on('click', flipCard);
$('.next').on('click', nextCard);

$('.correct-button').on('click', function() {
  var currentCard = Game.currentCard;
  currentCard.setAsRight();
  Game.correctArray.push(currentCard);
  Game.wrongArray.splice(Game.wrongArray.indexOf(currentCard), 1);
  nextCard();
  Game.numberRight++;
  console.log(Game.currentCard);
  console.log(Game.wrongArray);
});

$('.wrong-button').on('click', function() {
  Game.currentCard.setAsWrong();
  nextCard();
  console.log(Game.currentCard);
  console.log(Game.wrongArray);
  Game.numberWrong++;
});

function nextCard() {
  if (Game.wrongArray.length > 0) {
    var index = Math.floor(Math.random() * Game.wrongArray.length);
    setCurrentCard(index);
    initDisplay();
  } else {
    $('.card-text').html('No More Cards');
  }
}

$('.submit').on('click', function(evt) {
  evt.preventDefault();
  var question = $('#quest').val();
  var answer = $('#answer').val();
  $('#quest').val('');
  $('#answer').val('');
  createNewCard(question, answer);
});

function createNewCard(question, answer) {
  Model.flashcards.push(new FlashCard(question, answer));
}
