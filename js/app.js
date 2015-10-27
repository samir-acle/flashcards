'use strict';

//TODO: fix werid click button keyboard action
//TODO: change to 3 options
//TODO: generate decks based on answers
//TODO: fix remove card
var fullyKnowArray = [];
var kindaKnowArray = [];
var dontKnowArray = [];
var Model = {
  flashcards: []
};

var FlashCard = function(question, answer) {
  this.question = question;
  this.answer = answer;
  this.viewCount = 0;
};

FlashCard.prototype = {
  constructor: FlashCard,
  setAsWrong: function() {
    this.lastAnswer = 'Wrong';
  },
  setAsRight: function() {
    this.lastAnswer = 'Right';
  },
  updateViewCount: function() {
    this.viewCount++;
  },
  setAsFullyKnow: function() {
    this.comfort = 'fully know';
  },
  setAsKindaKnow: function() {
    this.comfort = 'kinda know';
  },
  setAsDoNotKnow: function() {
    this.comfort = 'do not know';
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
  Model.flashcards.push(new FlashCard('teacher',
                                'lao shi'));
  Model.flashcards.push(new FlashCard('5 + 5', '10'));
  Model.flashcards.push(new FlashCard('hello', 'ni hao'));
  Model.flashcards.push(new FlashCard('but',
                                'ke shi'));
  Model.flashcards.push(new FlashCard('no', 'bu'));
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
  updateHud();
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
// $('.correct-button').on('click', function() {
//   var currentCard = Game.currentCard;
//   if(currentCard.lastAnswer !== 'Right'){
//     updateCounters('Right', 1);
//   }
//   currentCard.setAsRight();
//   currentCard.setAsHasViewed();
//   Game.correctArray.push(currentCard);
//   Game.wrongArray.splice(Game.wrongArray.indexOf(currentCard), 1);
//   updateHud();
//   nextCard();
// });
//
// $('.wrong-button').on('click', function() {
//   var currentCard = Game.currentCard;
//   if(currentCard.lastAnswer !== 'Wrong'){
//     updateCounters('Wrong', 1);
//   }
//   currentCard.setAsWrong();
//   currentCard.setAsHasViewed();
//   updateHud();
//   nextCard();
// });

function nextCard() {
  if (Game.wrongArray.length > 0) {
    var index = Math.floor(Math.random() * Game.wrongArray.length);
    setCurrentCard(index);
    initDisplay();
    Game.onQuestion = true;
    setStats();
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
  Model.flashcards.push(newCard);
  Game.wrongArray.push(newCard);
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

// $('#board').on('keyup', function(evt) {
//   if(evt.keyCode === 32) {
//     evt.removeDefault();
//     flipCard();
//   }
// });

$('.add').on('click', showEditMode);
$('#close-form').on('click', hideEditMode);

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
  // var right = $('.right-counter');
  // var wrong = $('.wrong-counter');
  // right.html('Number Right: ' + Game.numberRight + ' out of ' + Model.flashcards.length + ' total cards');
  // wrong.html('Number Wrong: ' + Game.numberWrong + ' out of ' + Model.flashcards.length + ' total cards');
  var fk = $('.fk-count');
  var kk = $('.kk-count');
  var dk = $('.dk-count');
  fk.html('Fully Know: ' + fullyKnowArray.length + ' of ' + Model.flashcards.length);
  kk.html('Kinda Know: ' + kindaKnowArray.length + ' of ' + Model.flashcards.length);
  dk.html('Dont Know: ' + dontKnowArray.length + ' of ' + Model.flashcards.length);
}

$('.all-cards').on('click', showAllCards);

function showAllCards() {
  var container = $('<div class="container"></div>');

  Model.flashcards.forEach(function(card){
    var outerDiv = $('<div/>');
    outerDiv.addClass('outer-div');
    var questionDiv = $('<div/>');
    var answerDiv = $('<div/>');
    questionDiv.addClass('question').html(card.question);
    answerDiv.addClass('answer').html(card.answer);
    outerDiv.append(questionDiv);
    outerDiv.append(answerDiv);
    container.append(outerDiv);
  });

  var closeIcon = $('<div id="close-all" class="close">&times;</div>');
  closeIcon.on('click', removeOverlay);
  container.append(closeIcon);

  $('body').append(container);
}

$('#close-all').on('click', removeOverlay);

function removeOverlay() {
  console.log('trying to close');
  $('.container').remove();
}

function setStats() {
  $('#stats').empty();
  var statsContainer = $('#stats');
  var lastAnswer = $('<div/>')
  lastAnswer.addClass('stat').html(Game.currentCard.lastAnswer);
  var viewed = $('<div/>');
  viewed.addClass('stat').html(Game.currentCard.viewCount);
  var comfort = $('<div/>');
  comfort.addClass('stat').html(Game.currentCard.comfort);
  // var viewed = $('<div/>');
  // viewed.addClass('stat').html(Game.currentCard.hasViewed);
  statsContainer.append(lastAnswer, viewed, comfort);
}

$('.fully-know').on('click', function() {
  Game.currentCard.setAsFullyKnow();
  updateAll();
});
$('.kinda-know').on('click', function() {
  Game.currentCard.setAsKindaKnow();
  updateAll();
});
$('.dont-know').on('click', function() {
  Game.currentCard.setAsDoNotKnow();
  updateAll();
});

function updateAll() {
  Game.currentCard.updateViewCount();
  updateArrays();
  updateHud();
  setStats();
  nextCard();
}

function updateArrays() {
  var fkArray = [];
  var kkArray = [];
  var dkArray = [];

  Model.flashcards.forEach(function(card){
    if (card.comfort === 'fully know') {
      fkArray.push(card);
    } else if (card.comfort === 'kinda know') {
      kkArray.push(card);
    } else {
      dkArray.push(card);
    }
  });

  fullyKnowArray = fkArray;
  kindaKnowArray = kkArray;
  dontKnowArray = dkArray;
}
