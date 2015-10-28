/**
 * FlashCards: The Web App
 * created by Samir Mehta
 *
 * This app was created to fulfill the first Project requirement while a student
 * in the WDI program at General Assembly in Washington, DC. The prompt was to
 * create a flash cards app.
 *
 */

'use strict';

/** Object to hold data for all of the flashcards*/
var Model = {
  flashcards: []
};

/**
 * Represents a FlashCard
 * @constructor
 * @param {string} question - the question or prompt
 * @param {string} answer - the answer to the above question
 */
var FlashCard = function(question, answer) {
  this.question = question;
  this.answer = answer;
  this.viewCount = 0;
  this.totalTime = 0;
  this.lastTurnTime = 0;
  this.timeArray = [];
  this.comfort = 'do not know';
};

/** sets methods of class FlashCard */
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
    console.log('update time ', this.lastTurnTime);
  }
};

/** creates Game object to hold game state data*/
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
  deckEmpty: false,
  fullyKnowArray: [],
  kindaKnowArray: [],
  dontKnowArray: [],
  svgContainer: d3.select('.bubbles').append('svg').attr('width', '100%').attr('height', '100%')
};

/**
 * EVENT HANDLERS
 */
/** click handler to flip card*/
$('.flip').on('click', function(evt) {
  evt.preventDefault();
  flipCard();
  updateDisplay();
});

/** click handler for keypresses*/
$(document).on('keyup', function(evt) {
  if (evt.keyCode === 38 || evt.keyCode === 40) {
    evt.preventDefault();
    flipCard();
    updateDisplay();
  } else if (evt.keyCode === 39) {
    evt.preventDefault();
    nextCard();
    updateDisplay();
  }
});

/** click handler to switch cards*/
$('.next').on('click', function(evt) {
  evt.preventDefault();
  nextCard();
  setStats();
  updateDisplay();
});

/** click handler to create new card*/
$('.submit').on('click', function(evt) {
  evt.preventDefault();
  var question = $('#quest').val();
  var answer = $('#answer').val();
  $('#quest').val('');
  $('#answer').val('');
  createNewCard(question, answer);
});

/** click handler for create new card form*/
$('.add').on('click', showEditMode);
$('#close-form').on('click', hideEditMode);

/** click handler to remove card*/
$('.delete').on('click', removeCard);

/** click handlers to show different cards*/
$('.all-cards').on('click', function() {
  showCards(Model.flashcards);
});
$('.fk-cards').on('click', function() {
  showCards(Game.fullyKnowArray);
});
$('.kk-cards').on('click', function() {
  showCards(Game.kindaKnowArray);
});
$('.dk-cards').on('click', function() {
  showCards(Game.dontKnowArray);
});

/** click handler to close overlay*/
$('#close-all').on('click', removeOverlay);

/** click handlers for comfort buttons*/
$('.fully-know').on('click', function() {
  Game.currentCard.setAsFullyKnow();
  updateArrays();
  updateDisplay();
});
$('.kinda-know').on('click', function() {
  Game.currentCard.setAsKindaKnow();
  updateArrays();
  updateDisplay();
});
$('.dont-know').on('click', function() {
  Game.currentCard.setAsDoNotKnow();
  updateArrays();
  updateDisplay();
});

/** click handler to create deck of cards*/
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

/** click handler for close icon*/
$('.card-menu-icon').on('click', toggleMenuBar);

/** click handler for stats bar*/
$('.stats-button').on('click', function() {
  setStats();
  toggleStatsBar();
});

/** click handler to reset game*/
$('.reset').on('click', resetGame);

/**
 * FUNCTIONS
 */
/** @desc IEFE to initialize app*/
(function init() {
  initCards();
  updateArrays();
  generateDeck();
  console.log(Game.cardIndex);
  Game.cardIndex = 0;
  setCurrentCard(Game.cardDeck[Game.cardIndex]);
  updateDisplay();
})();

/** @desc creates placeholder flashcards */
function initCards() {
  Model.flashcards.push(new FlashCard('teacher',
    'lao shi'));
  Model.flashcards.push(new FlashCard('5 + 5', '10'));
  Model.flashcards.push(new FlashCard('hello', 'ni hao'));
  Model.flashcards.push(new FlashCard('but',
    'ke shi'));
  Model.flashcards.push(new FlashCard('no', 'bu'));
  Model.flashcards.push(new FlashCard('goodbye', 'zai jian'));
}

/**
 * @desc changes current flashcard
 * @param {object} card - flashcard object
 */
function setCurrentCard(card) {
  Game.currentCard = card;
  Game.currentCard.setStartTime();
  Game.onQuestion = true;
}

/**
 * @desc updates everything on the screen to match the current flash card
 */
function updateDisplay() {
  if (!Game.onQuestion) {
    $('.card-text').html(Game.currentCard.answer);
    console.log('this is from upd display');
    checkTime(); //if on card too long, cannot choose 'fully knows'
    showButtons();
    setStats();
  } else {
    $('.card-text').html(Game.currentCard.question);
    Game.currentCard.setStartTime();
    hideButtons();
  }

  updateHud();
  updateBubbleSvg();
}

/**
 * @desc sets boolean to opposite to represent either front or back of the card
 */
function flipCard() {
  if (!Game.deckEmpty) {
    Game.onQuestion = !Game.onQuestion;
    stopTime();

    if (!Game.onQuestion) {
      Game.currentCard.updateViewCount();
    }
  }
}

/** @desc limit comfort choices depending on time viewed */
function checkTime() {
  if (Game.currentCard.lastTurnTime > 5000) {
    preventFullyKnows();
  }
}

/** @desc prevents clicking on 'fully knows' button */
function preventFullyKnows() {
  var fkButton = $('.fully-know');
  fkButton.css({
    background: 'rgba(155,155,155,1.0)',
    'pointer-events': 'none'
  });
}

/** @desc restores click functionality on 'fully know' button */
function restoreFullyKnows() {
  var fkButton = $('.fully-know');
  fkButton.css({
    background: 'green',
    'pointer-events': 'auto'
  });
}

/** @desc sets stop time for card and calculates time viewed */
function stopTime() {
  Game.currentCard.setStopTime();
  Game.currentCard.updateTime();
}

/** @desc switches current flash card*/
function nextCard() {
  if (!Game.deckEmpty) {
    restoreFullyKnows();
  }

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

/**
 * @desc creates new instance of FlashCard with question and answer properties
 * as defined by the User
 * @param {string} question - the question or prompt
 * @param {string} answer - the answer to the above question
 */
function createNewCard(question, answer) {
  var newCard = new FlashCard(question, answer);
  Model.flashcards.push(newCard);
  updateArrays();
  updateDisplay();

}

/** @desc makes comfort buttons visible or hidden on page*/
function showButtons() {
  $('.choices').show();
}
function hideButtons() {
  $('.choices').hide();
}

/** @desc toggles visibility of form to add new card*/
function showEditMode() {
  $('form').show();
}
function hideEditMode() {
  $('form').hide();
}

/** @desc deletes currently displayed flashcard*/
function removeCard() {
  var index = Model.flashcards.indexOf(Game.currentCard);
  Model.flashcards.splice(index, 1);
  nextCard();
  updateArrays();
  updateDisplay();
}

/** @desc updates top of screen to display correct count of each type of card*/
function updateHud() {
  var fk = $('.fk-count');
  var kk = $('.kk-count');
  var dk = $('.dk-count');
  fk.html('Fully Know: ' + Game.fullyKnowArray.length + ' of ' + Model.flashcards.length);
  kk.html('Kinda Know: ' + Game.kindaKnowArray.length + ' of ' + Model.flashcards.length);
  dk.html('Dont Know: ' + Game.dontKnowArray.length + ' of ' + Model.flashcards.length);
}

/**
 * @desc opens overlay on screen displaying both sides of flashcards
 * @param {array} array - holds cards to be displayed
 */
function showCards(array) {
  if ($('.stats-container').css('display') === 'block') {
    toggleStatsBar();
  }
  var container = $('<div class="container"></div>');

  array.forEach(function(card) {
    var outerDiv = $('<div/>');
    outerDiv.addClass('outer-div');
    outerDiv.on('click', function() {
      setCurrentCard(card);
      updateDisplay();
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

/** @desc deletes overlay from DOM*/
function removeOverlay() {
  $('.container').remove();
}

/** @desc updates stats bar with most recent information*/
function setStats() {
  $('#stats').empty();
  var statsContainer = $('#stats');

  var viewed = $('<div/>');
  viewed.addClass('stat-views stat').html('Number of Views: ');
  var comfort = $('<div/>');
  comfort.addClass('stat').html('Comfort Level: ' + Game.currentCard.comfort);
  var timeViewed = $('<div/>');
  timeViewed.addClass('stat').html('Total Time Spent Looking At Card: ' + Game.currentCard.totalTime / 1000 + 's');
  var lastTurnTime = $('<div/>');
  lastTurnTime.addClass('stat').html('Last Time Spent Looking At Card: ' + Game.currentCard.lastTurnTime / 1000 + 's');

  statsContainer.append(viewed, comfort, timeViewed, lastTurnTime);
  createTicks('.stat-views', Game.currentCard.viewCount);
}

/**
 * @desc creates tick marks to show # of views
 * @param {string} className
 * @param {number} views
 */
function createTicks(className, views) {
  var viewsArray = [];
  var x = 5;
  var y1 = 15;
  var y2 = 30;
  var maxX = views < 20 ? 100 : x * views;

  /** different values for every 5th tick to make it diagonl*/
  for (var i = 0; i < views; i++) {
    if (i % 5 === 4) {
      viewsArray.push([5, x, y1, y2]);
    } else {
      viewsArray.push([0, x, y1, y2]);
    }
  }

  /** uses D3 methods to create svg element and set attributes*/
  var svgContainer = d3.select(className).append('svg')
    .attr('width', maxX)
    .attr('height', 30);

  var lines = svgContainer.selectAll('line').data(viewsArray).enter().append('line');

  var lineAttributes = lines.attr('x1', function(d, i) {
      return (i - d[0]) * d[1] + d[1];
    }).attr('x2', function(d, i) {
      return i * d[1] + d[1];
    }).attr('y1', function(d, i) {
      return d[2];
    }).attr('y2', function(d, i) {
      return d[3];
    })
    .attr('stroke-width', 2)
    .attr('stroke', 'black')
    .style('opacity', 0)
    .transition()
    .style('opacity', 1)
    .duration(750);
}

/** @desc creates arrays holding the different comfort level cards */
function updateArrays() {
  var fkArray = [];
  var kkArray = [];
  var dkArray = [];

  Model.flashcards.forEach(function(card) {
    if (card.comfort === 'fully know') {
      fkArray.push(card);
    } else if (card.comfort === 'kinda know') {
      kkArray.push(card);
    } else {
      dkArray.push(card);
    }
  });

  Game.fullyKnowArray = fkArray;
  Game.kindaKnowArray = kkArray;
  Game.dontKnowArray = dkArray;
}

/** @desc concatanates arrays of cards together based on user input*/
function generateDeck() {
  Game.cardDeck = [];

  if (Game.useDK) {
    Game.cardDeck = Game.cardDeck.concat(Game.dontKnowArray);
  }

  if (Game.useFK) {
    Game.cardDeck = Game.cardDeck.concat(Game.fullyKnowArray);
  }

  if (Game.useKK) {
    Game.cardDeck = Game.cardDeck.concat(Game.kindaKnowArray);
  }

  Game.cardDeck = shuffle(Game.cardDeck);

  if (Game.cardDeck.length !== 0) {
    Game.deckEmpty = false;
  }
}

/** @desc changes currently displayed card to the first in the deck*/
function resetDeck() {
  Game.cardIndex = 0;
  setCurrentCard(Game.cardDeck[Game.cardIndex]);
  updateDisplay();
}

/** @desc displays message and toggles empty deck boolean*/
function deckEmpty() {
  $('.card-text').html('No more cards in deck, please generate a new deck below.');
  hideButtons();
  Game.deckEmpty = true;
}

/** @desc toggles position of menu bar*/
function toggleMenuBar() {
  $('.menu').toggleClass('offscreen');
}

/** @desc toggles visibility of stats bar*/
function toggleStatsBar() {
  $('.stats-container').toggle();
}

/**
 * below code written following post on http://bost.ocks.org/mike/shuffle/
 * @desc shuffles items within an array
 * @param {array} array - array to be shuffled
 * @returns shuffled array
 */
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

/**
 * followed tutorials at http://bl.ocks.org/mbostock/3808234
 * @desc creates and updates the circe svgs corresponding to flashcards
 */
function updateBubbleSvg() {

  var maxRadius = 30;
  var redMinRadius = 15;
  var greenMinRadius = 5;
  var yellowMinRadius = 10;
  var redStepSize = 1;
  var yellowStepSize = 3;
  var greenStepSize = 5;

  /** updates circles that have already been created*/
  var circles = Game.svgContainer.selectAll('circle').data(Model.flashcards);

  circles.attr('cx', function(d, i) {
      return i % 5 * maxRadius * 2 + maxRadius;
    })
    .attr('cy', function(d, i) {
      return Math.floor(i / 5) * maxRadius * 2 + maxRadius;
    })
    .transition()
    .attr('r', function(d, i) {
      var radius;
      if (d.comfort === 'fully know') {
        radius = maxRadius - d.viewCount * greenStepSize;
        return radius <= greenMinRadius ? greenMinRadius : radius;
      } else if (d.comfort === 'kinda know') {
        radius = maxRadius - d.viewCount * yellowStepSize;
        return radius <= yellowMinRadius ? yellowMinRadius : radius;
      } else {
        radius = maxRadius - d.viewCount * redStepSize;
        return radius <= redMinRadius ? redMinRadius : radius;
      }
    })
    .duration(function(d, i) {
      if (d.lastTurnTime < 5000) {
        return d.lastTurnTime;
      } else {
        return 5000;
      }
    })
    .attr('fill', function(d) {
      if (d.comfort === 'fully know') {
        return 'green';
      } else if (d.comfort === 'kinda know') {
        return 'yellow';
      } else {
        return 'red';
      }
    });

  /** creates new circle elements for new flashcards(data) */
  circles.enter().append('circle')
    .attr('cx', function(d, i) {
      return i % 5 * maxRadius * 2 + maxRadius;
    })
    .attr('cy', 200)
    .attr('r', function(d, i) {
      var radius = maxRadius - d.viewCount * 5;
      return radius <= 0 ? 5 : radius;
    })
    .attr('fill', 'red')
    .style('opacity', 0)
    .transition()
    .style('opacity', 1)
    .attr('cy', function(d, i) {
      return Math.floor(i / 5) * maxRadius * 2 + maxRadius;
    })
    .duration(750);

  circles.on('click', function(d) {
    setCurrentCard(d);
    updateDisplay();
  });

  /** removes circles for flashcards (data) that has been deleted*/
  circles.exit()
    .transition()
    .attr('cy', 200)
    .style('opacity', 0)
    .duration(750)
    .remove();
}

/** @desc reloads screen to reset game*/
function resetGame() {
  window.location.reload();
}
