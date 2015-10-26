'use strict';

//TODO: fix werid click button keyboard action
//TODO: change to 3 options
//TODO: generate decks based on answers

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
    this.lastAnswer = 'Wrong';
  },
  setAsRight: function() {
    this.lastAnswer = 'Right';
  },
  setAsHasViewed: function() {
    this.hasViewed = true;
  }
};


var Game = {
  currentCardIndex: 0,
  onQuestion: true,
  wrongArray: [],
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

  for (var i = 0; i < Model.flashcards.length; i++) {
    Game.wrongArray.push(Model.flashcards[i]);
  }
};

initCards();
setCurrentCard(0);

function setCurrentCard(index) {
  Game.currentCard = Game.wrongArray[index];
}

function initDisplay() {
  $('.card-text').html(Game.currentCard.question);
}

initDisplay();

function flipCard() {
  if (Game.onQuestion) {
    console.log('flipped to answer');
    $('.card-text').html(Game.currentCard.answer);
    Game.onQuestion = !Game.onQuestion;
    // $('.correct-button').show();
    // $('.wrong-button').show();
    showButtons();
  } else {
    console.log('flipped to quest');
    $('.card-text').html(Game.currentCard.question);
    Game.onQuestion = !Game.onQuestion;
    // $('.correct-button').hide();
    // $('.wrong-button').hide();
    hideButtons();
  }
}


$('.flip').on('click', function(evt) {
  evt.preventDefault();
  flipCard();
});
$('.next').on('click', function(evt) {
  evt.preventDefault();
  nextCard();
});
$('.correct-button').on('click', function() {
  var currentCard = Game.currentCard;
  if(currentCard.lastAnswer !== 'Right'){
    updateCounters('Right', 1);
  }
  currentCard.setAsRight();
  currentCard.setAsHasViewed();
  Game.correctArray.push(currentCard);
  Game.wrongArray.splice(Game.wrongArray.indexOf(currentCard), 1);
  updateHud();
  nextCard();
});

$('.wrong-button').on('click', function() {
  var currentCard = Game.currentCard;
  if(currentCard.lastAnswer !== 'Wrong'){
    updateCounters('Wrong', 1);
  }
  currentCard.setAsWrong();
  currentCard.setAsHasViewed();
  updateHud();
  nextCard();
});

function nextCard() {
  if (Game.wrongArray.length > 0) {
    var index = Math.floor(Math.random() * Game.wrongArray.length);
    setCurrentCard(index);
    initDisplay();
    Game.onQuestion = true;
  } else {
    $('.card-text').html('No More Cards');
  }
  hideButtons();
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
  var newCard = new FlashCard(question, answer);
  console.log(Model.flashcards.length);
  console.log(Game.wrongArray.length);
  Model.flashcards.push(newCard);
  console.log(Model.flashcards.length);
  console.log(Game.wrongArray.length);
  Game.wrongArray.push(newCard);
  console.log(Model.flashcards.length);
  console.log(Game.wrongArray.length);
  updateHud();
}

function showButtons() {
  $('.correct-button').show();
  $('.wrong-button').show();
}

function hideButtons() {
  $('.correct-button').hide();
  $('.wrong-button').hide();
}

// $('body').on('keyup', function(evt) {
//   if(evt.keyCode === 32) {
//     flipCard();
//   }
// });

$('.add').on('click', showEditMode);
$('.close').on('click', hideEditMode);

function showEditMode() {
  $('form').show();
}

function hideEditMode() {
  $('form').hide();
}

$('.delete').on('click', removeCard);

function removeCard() {
  var currentCard = Game.currentCard;
  if(currentCard.hasViewed) {
    var lastAnswer = currentCard.lastAnswer;
    updateCounters(lastAnswer, -1);
;  }
  var index = Model.flashcards.indexOf(Game.currentCard);
  Model.flashcards.splice(index,1);
  nextCard();
  updateHud();
}

function updateCounters(string, change) {
  console.log(Game['number' + string]);
  Game['number' + string] += change;
  console.log(Game['number' + string]);
  var counter = Game['number' + string];
  var hud = $('.' + string.toLowerCase() + '-counter');
  console.log(hud.html());
  hud.html('Number ' + string + ' : ' + counter + ' out of ' + Model.flashcards.length + ' total cards');
}

function updateHud() {
  var right = $('.right-counter');
  var wrong = $('.wrong-counter');
  right.html('Number Right: ' + Game.numberRight + ' out of ' + Model.flashcards.length + ' total cards');
  wrong.html('Number Right: ' + Game.numberWrong + ' out of ' + Model.flashcards.length + ' total cards');
}
