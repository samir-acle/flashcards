'use strict';

//TODO: fix werid click button keyboard action
//TODO: fix remove card
//TODO: change init - or add start button
//TODO: fix end of deck
//TODO: optimize for mobile
//TODO: something w/ last time array
//TODO: add previous button
//TODO: reset button


//clean up code


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
  this.totalTime = 0;
  this.lastTurnTime = 0;
  this.timeArray = [];
  this.comfort = 'do not know';
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
  },
  setStartTime: function() {
    this.oldTime = Date.now();
    console.log('time set');
  },
  setStopTime: function() {
    this.newTime = Date.now();
    console.log('time stopped');
  },
  updateTime: function() {
    this.lastTurnTime = this.newTime - this.oldTime; //ms
    this.timeArray.push(this.lastTurnTime);
    this.totalTime += this.lastTurnTime;
    console.log('update time ',this.lastTurnTime);
  }
};


var Game = {
  currentCardIndex: 0,
  onQuestion: true,
  wrongArray: [],
  correctArray: [],
  numberRight: 0,
  numberWrong: 0,
  useFK: false,
  useKK: false,
  useDK: true,
  cardDeck: [],
  cardIndex: 0,
  svgContainer: d3.select('.bubbles').append('svg').attr('width','100%').attr('height','100%')
};


//Future TODO: tie in with API (wolfram alpha?) to have answers populate themselves
// Furutre TODO: or create a generate deck based on popular questions?

function initCards() {
  Model.flashcards.push(new FlashCard('teacher',
                                'lao shi'));
  Model.flashcards.push(new FlashCard('5 + 5', '10'));
  Model.flashcards.push(new FlashCard('hello', 'ni hao'));
  Model.flashcards.push(new FlashCard('but',
                                'ke shi'));
  Model.flashcards.push(new FlashCard('no', 'bu'));
  Model.flashcards.push(new FlashCard('goodbye', 'zai jian'));

  // for (var i = 0; i < Model.flashcards.length; i++) {
  //   Game.wrongArray.push(Model.flashcards[i]);
  // }
}

function setCurrentCard(card) {
  Game.currentCard = card;
  Game.currentCard.setStartTime();
  Game.currentCard.updateViewCount();
  updateAll();
}

function updateDisplay() {
  $('.card-text').html(Game.currentCard.question);
  updateHud();
}

function flipCard() {
  if (Game.onQuestion) {
    $('.card-text').html(Game.currentCard.answer);
    Game.onQuestion = !Game.onQuestion;
    // $('.correct-button').show();
    // $('.wrong-button').show();
    showButtons();
    Game.currentCard.setStopTime();
    Game.currentCard.updateTime();
    checkTime();
    updateAll();
  } else {
    $('.card-text').html(Game.currentCard.question);
    Game.onQuestion = !Game.onQuestion;
    hideButtons();
    Game.currentCard.setStartTime();
  }
}

function checkTime() {
  if(Game.currentCard.lastTurnTime > 5000) {
    preventFullyKnows();
  }
}

function preventFullyKnows() {
  var fkButton = $('.fully-know');
  fkButton.css({
    background: 'rgba(155,155,155,1.0)',
    'pointer-events': 'none'
  });
}

function restoreFullyKnows() {
  var fkButton = $('.fully-know');
  fkButton.css({
    background: 'green',
    'pointer-events': 'auto'
  });
}


$('.flip').on('click', function(evt) {
  evt.preventDefault();
  flipCard();
});
$('.next').on('click', function(evt) {
  evt.preventDefault();
  nextCard();
});

function nextCard() {
  restoreFullyKnows();
  Game.currentCard.setStopTime();
  Game.currentCard.updateTime();
  updateBubbleSvg();

  if (Game.cardIndex === Game.cardDeck.length - 1) {
    Game.cardIndex = 0;
    generateDeck();
  } else {
    Game.cardIndex++;
  }

  if (Game.cardDeck.length === 0) {
    deckEmpty();
  } else {
    setCurrentCard(Game.cardDeck[Game.cardIndex]);
    Game.onQuestion = true;
    hideButtons();
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
  var newCard = new FlashCard(question, answer);
  Model.flashcards.push(newCard);
  updateAll();
  // updateArrays();
  // updateHud();
}

function showButtons() {
  // $('.correct-button').show();
  // $('.wrong-button').show();
  $('.choices').show();
}

function hideButtons() {
  // $('.correct-button').hide();
  // $('.wrong-button').hide();
  $('.choices').hide();
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

// function updateCounters(string, change) {
//   console.log(Game['number' + string]);
//   Game['number' + string] += change;
//   console.log(Game['number' + string]);
//   var counter = Game['number' + string];
//   var hud = $('.' + string.toLowerCase() + '-counter');
//   console.log(hud.html());
//   hud.html('Number ' + string + ' : ' + counter + ' out of ' + Model.flashcards.length + ' total cards');
// }

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

$('.all-cards').on('click', function() {
  showCards(Model.flashcards);
});

$('.fk-cards').on('click', function() {
  showCards(fullyKnowArray);
});

$('.kk-cards').on('click', function() {
  showCards(kindaKnowArray);
});

$('.dk-cards').on('click', function() {
  showCards(dontKnowArray);
});

function showCards(array) {
  if ($('.stats-container').css('display') === 'block'){
    toggleStatsBar();
  }
  var container = $('<div class="container"></div>');

  array.forEach(function(card){
    var outerDiv = $('<div/>');
    outerDiv.addClass('outer-div');
    outerDiv.on('click', function() {
      setCurrentCard(card);
      removeOverlay();
    });
    var questionDiv = $('<div/>');
    var answerDiv = $('<div/>');
    questionDiv.addClass('question').html(card.question);
    answerDiv.addClass('answer').html(card.answer);
    outerDiv.append(questionDiv);
    outerDiv.append(answerDiv);

    var comfortDiv = $('<div/>');
    comfortDiv.addClass('comfort');
    comfortDiv.html(card.comfort);
    outerDiv.append(comfortDiv);
    container.append(outerDiv);
  });

  var closeIcon = $('<div id="close-all" class="close">&times;</div>');
  closeIcon.on('click', removeOverlay);
  container.append(closeIcon);

  $('body').append(container);
}

$('#close-all').on('click', removeOverlay);

function removeOverlay() {
  $('.container').remove();
}

function setStats() {
  $('#stats').empty();
  var statsContainer = $('#stats');
  // var lastAnswer = $('<div/>')
  // lastAnswer.addClass('stat').html(Game.currentCard.lastAnswer);
  var viewed = $('<div/>');
  viewed.addClass('stat-views stat').html('Number of Views: ');
  var comfort = $('<div/>');
  comfort.addClass('stat').html('Comfort Level: ' + Game.currentCard.comfort);
  var timeViewed = $('<div/>');
  timeViewed.addClass('stat').html('Total Time Spent Looking At Card: ' + Game.currentCard.totalTime / 1000 + 's');
  var lastTurnTime = $('<div/>');
  lastTurnTime.addClass('stat').html('Last Time Spent Looking At Card: ' + Game.currentCard.lastTurnTime / 1000 + 's');
  // var viewed = $('<div/>');
  // viewed.addClass('stat').html(Game.currentCard.hasViewed);
  statsContainer.append(viewed, comfort, timeViewed, lastTurnTime);
  createTicks('.stat-views',Game.currentCard.viewCount);
}

function createTicks(className, views) {
  var viewsArray = [];
  var x = 5;
  var y1 = 15;
  var y2 = 30;
  var maxX = views < 20 ? 100 : x * views;

  for (var i = 0; i < views; i++) {
    if (i % 5 === 4) {
      viewsArray.push([5,x,y1,y2]);
    }
    else {
      viewsArray.push([0,x,y1,y2]);
    }
  }

  var svgContainer = d3.select(className).append('svg')
                       .attr('width', maxX)
                       .attr('height', 30);

  var lines = svgContainer.selectAll('line').data(viewsArray).enter().append('line');

  var lineAttributes = lines.attr('x1', function(d,i){
                              return (i - d[0]) * d[1] + d[1];
                            }).attr('x2', function(d,i){
                              return i * d[1] + d[1];
                            }).attr('y1', function(d,i){
                              return d[2];
                            }).attr('y2',function(d,i){
                              return d[3];
                            })
                            .attr('stroke-width', 2)
                            .attr('stroke','black');
                          }

$('.fully-know').on('click', function() {
  Game.currentCard.setAsFullyKnow();
  updateAll();
  nextCard();
});
$('.kinda-know').on('click', function() {
  Game.currentCard.setAsKindaKnow();
  updateAll();
  nextCard();
});
$('.dont-know').on('click', function() {
  Game.currentCard.setAsDoNotKnow();
  updateAll();
  nextCard();
});

function updateAll() {
  // Game.currentCard.updateViewCount();
  updateArrays();
  updateHud();
  setStats();
  updateDisplay();
  updateBubbleSvg();
  // nextCard();
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

function generateDeck() {
  Game.cardDeck = [];

  if (Game.useDK) {
    Game.cardDeck = Game.cardDeck.concat(dontKnowArray);
  }

  if (Game.useFK) {
    Game.cardDeck = Game.cardDeck.concat(fullyKnowArray);
  }

  if (Game.useKK) {
    Game.cardDeck = Game.cardDeck.concat(kindaKnowArray);
  }

  Game.cardDeck = shuffle(Game.cardDeck);
}

function init() {
  initCards();
  updateArrays();
  generateDeck();
  setCurrentCard(Game.cardDeck[Game.cardIndex]);
}

init();

$('.generate').on('click', function(evt) {
  evt.preventDefault();
  var fkCheck = $('#fk:checked').val();
  var kkCheck = $('#kk:checked').val();
  var dkCheck = $('#dk:checked').val();

  Game.useFK = fkCheck ? true : false;
  Game.useKK = kkCheck ? true : false;
  Game.useDK = dkCheck ? true : false;

  generateDeck();
  resetDeck();
});

function resetDeck() {
  Game.cardIndex = 0;
  setCurrentCard(Game.cardDeck[Game.cardIndex]);
}

function deckEmpty() {
  alert('deck is empty, generate new deck');
}

$('.card-menu-icon').on('click', toggleMenuBar);

function toggleMenuBar() {
  $('.menu').toggleClass('offscreen');
}

$('.stats-button').on('click', toggleStatsBar);

function toggleStatsBar() {
  $('.stats-container').toggle();
}

// below code written following post on http://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  var shuffledArray = array;
  var m = shuffledArray.length;
  var swap, i;

  while (m) {
    m--;
    i = Math.floor(Math.random() * m);
    swap = shuffledArray[m];
    shuffledArray[m] = shuffledArray[i];
    shuffledArray[i] = swap;
  }

  return shuffledArray;
}

//TODO: make bubbles outline number of flashcards
//TODO: change it up depending on the comfort level

function updateBubbleSvg() {
  //if loop to only create first time or sep function
  var maxRadius = 30;
  var redMinRadius = 15;
  var greenMinRadius = 5;
  var yellowMinRadius = 10;
  //update
  var circles = Game.svgContainer.selectAll('circle').data(Model.flashcards);

  circles.attr('cx', function(d,i){
           return i % 5 * maxRadius * 2 + maxRadius;
         })
         .attr('cy', function(d,i){
           return Math.floor(i / 5) * maxRadius * 2 + maxRadius;
         })
      .transition()
         .attr('r', function(d,i){
           var radius = maxRadius - d.viewCount * 3;
           if(d.comfort === 'fully know'){
             return radius <= greenMinRadius ? greenMinRadius : radius;
           } else if(d.comfort === 'kinda know'){
             return radius <= yellowMinRadius ? yellowMinRadius : radius;
           } else {
             return radius <= redMinRadius ? redMinRadius : radius;
           }
         })
         .duration(function(d,i){
          //  return d.totalTime;
            return d.lastTurnTime;
         })
         .attr('fill', function(d){
           if (d.comfort === 'fully know'){
             return 'green';
           } else if (d.comfort === 'kinda know'){
             return 'yellow';
           } else {
             return 'red';
           }
         });

  //enter
  circles.enter().append('circle')
         .attr('cx', function(d,i){
           return i % 5 * maxRadius * 2 + maxRadius;
         })
         .attr('cy', function(d,i){
           return Math.floor(i / 5) * maxRadius * 2 + maxRadius;
         })
         .attr('r', function(d,i){
           var radius = maxRadius - d.viewCount * 5;
           return radius <= 0 ? 5 : radius;
         })
         .attr('fill', 'red');

  //exit
  circles.exit().remove();
}

function resetGame() {
  generateDeck();
}

$('.reset').on('click', resetGame);
