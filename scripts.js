var bodyHTML =
  '<div id="gameStats"></div>' +
  '<div id="postGameMessage">' +
  '<h1 class="gameResult"></h1>' +
  '<p class="levelsSurvived"></p>' +
  '</div>' +
  '<div id="mainMenu">' +
  '<p id="title">Scots Skirmish</p>' + // Customize - Game Title
  '<button id="startButton">Start Game</button>' +
  '<p id="sub-title">Objective:</h1>' +
  '<p id="instructions">Eliminate all 10 waves of enemy forces.</p>' +
  '<p id="sub-title">Controls:</h1>' +
  '<p id="instructions">Use the WASD keys to control your movement.</p>' +
  '<p id="instructions">Left click in the direction of your target to fire.</p>' +
  '</div>' +
  '<div id="arena"></div>' +
  '<div id="objectLayer"></div>' +
  '<div id="shotLayer"></div>';

$(document).ready(function () {
  // Add the body HTML.
  document.body.innerHTML = bodyHTML;

  // Gets the initial screen size.
  screenDimensions();

  // Get the current screen size (if such has changed).
  window.onresize = function (event) {
    screenDimensions();
  };

  // Adjusts the playing arena accordingly to the screen's size.
  function screenDimensions() {
    arenaWidth = parseInt($('body').css('width'));
    arenaHeight = parseInt($('body').css('height'));

    if (arenaWidth / 1920 < arenaHeight / 1080) {
      $('#arena').css({ width: 'auto', height: '100%' });
    } else {
      $('#arena').css({ width: '100%', height: 'auto' });
    }
  }

  // Starts the game.
  $('#startButton').click(function () {
    initializeGame();
  });

  // Puts the game into an initial state.
  function initializeGame() {
    // Starting settings
    level = 1;
    lives = 10;
    enemyList = {};
    shotList = {};
    keys = {};
    numOfEnemies = 0;
    numOfShots = 0;
    numOfExplosions = 0;
    enemyXRadius = 50;
    enemyYRadius = 50;
    shotRadius = 10;
    randomXNum = 0;
    randomYNum = 0;

    $('#mainMenu').hide();
    $('#gameStats').show();
    $('#gameStats').html(
      '<h3>Level: ' + level + '</h3><h3>Lives: ' + lives + '</h3>'
    );

    // Create the player and set it's movement interval.
    createPlayer();

    // Create enemies.
    spawnNewEnemies(level);

    // Set intervals.
    moveEnemyInterval = setInterval(moveEnemy, 10);

    movePlayerInterval = setInterval(function () {
      movePlayer();
    }, 10);

    changeRandomNumInterval = setInterval(changeRandomNum, 500);

    enemyBulletInterval = setInterval(enemyShoot, 2000);

    bulletInterval = setInterval(manageBullets, 10);
  }

  // Initializes and "paints" the player character.
  function createPlayer() {
    Player = {
      xVel: 0,
      yVel: 0,
      xPos: arenaWidth / 2,
      yPos: arenaHeight / 2,
      xRadius: 50,
      yRadius: 50,
    };

    $('body').append('<div id="player"></div>');
    $('#player').css('height', 50);
    $('#player').css('width', 50);
    $('#player').css('background-color', '#ED6E00'); // Customize - Primary
    $('#player').css('left', arenaWidth / 2);
    $('#player').css('top', arenaHeight / 2);
  }

  // Handles key down events.
  $('body').keydown(function (event) {
    if (gameOn()) {
      keys[event.which] = event.which;
    }
  });

  // Handles key up events.
  $('body').keyup(function (event) {
    if (gameOn()) {
      delete keys[event.which];
    }
  });

  // Allows the player to move using the WASD keys.
  function movePlayer() {
    for (var i in keys) {
      switch (i) {
        case '65':
          Player.xVel -= 1 / 20;
          break;
        case '87':
          Player.yVel -= 1 / 20;
          break;
        case '68':
          Player.xVel += 1 / 20;
          break;
        case '83':
          Player.yVel += 1 / 20;
          break;
      }
    }

    movePlayerX();
    movePlayerY();
  }

  // Moves the player along the X axis.
  function movePlayerX() {
    if (
      Player.xPos + Player.xVel >= Player.xRadius - 50 &&
      Player.xPos + Player.xVel <= arenaWidth - Player.xRadius
    ) {
      Player.xPos += Player.xVel;
      xPos = Player.xPos + 'px';

      $('#player').css('left', xPos);
    } else {
      Player.xVel = 0;
    }
  }

  // Moves the player along the Y axis.
  function movePlayerY() {
    if (
      Player.yPos + Player.yVel >= Player.yRadius - 50 &&
      Player.yPos + Player.yVel <= arenaHeight - Player.yRadius
    ) {
      Player.yPos += Player.yVel;
      yPos = Player.yPos + 'px';

      $('#player').css('top', yPos);
    } else {
      Player.yVel = 0;
    }
  }

  // Produce a player bullet on the click of the body.
  $('body').click(function (event) {
    if (gameOn()) {
      calculateShot(event.pageX, event.pageY);
    }
  });

  // Fire a bullet towards where the cursor clicked.
  function calculateShot(xPos, yPos) {
    if (gameOn()) {
      var distanceDenominator = Math.sqrt(
        Math.pow(xPos - Player.xPos, 2) + Math.pow(yPos - Player.yPos, 2)
      );

      shotList[numOfShots] = {
        xPos:
          Player.xPos +
          ((Player.xRadius + 15) * (xPos - Player.xPos)) / distanceDenominator,
        yPos:
          Player.yPos +
          ((Player.yRadius + 15) * (yPos - Player.yPos)) / distanceDenominator,
        xShot:
          xPos +
          ((Player.xRadius + 15) * (xPos - Player.xPos)) / distanceDenominator,
        yShot:
          yPos +
          ((Player.yRadius + 15) * (yPos - Player.yPos)) / distanceDenominator,
      };

      var index = numOfShots;

      numOfShots += 1;

      $('#shotLayer').append(
        '<div id="' + index + '" class="playerShot"></div>'
      );
      $('#' + index).css({
        left: shotList[index].xPos - shotRadius + 'px',
        top: shotList[index].yPos - shotRadius + 'px',
      });
    }
  }

  // Manages bullets.
  function manageBullets() {
    for (var i in shotList) {
      var shot = shotList[parseInt(i)];

      if (
        shot.xPos >= 0 &&
        shot.xPos <= arenaWidth &&
        shot.yPos >= 0 &&
        shot.yPos <= arenaHeight
      ) {
        var movementDenominator = Math.sqrt(
          Math.pow(shot.xShot - shot.xPos, 2) +
            Math.pow(shot.yShot - shot.yPos, 2)
        );

        var xMovement = (shot.xShot - shot.xPos) / movementDenominator;
        var yMovement = (shot.yShot - shot.yPos) / movementDenominator;

        shot.xPos += 5 * xMovement;
        shot.yPos += 5 * yMovement;
        shot.xShot += 5 * xMovement;
        shot.yShot += 5 * yMovement;

        $('#' + i).css({ left: shot.xPos + 'px', top: shot.yPos + 'px' });
      } else {
        delete shotList[i];
        $('#' + i).remove();
      }

      for (var j in enemyList) {
        enemy = enemyList[j];
        enemyDistance =
          Math.pow((enemy.xPos - shot.xPos) / (enemyXRadius + shotRadius), 2) +
          Math.pow((enemy.yPos - shot.yPos) / (enemyYRadius + shotRadius), 2);

        if (enemyDistance <= 0.75) {
          delete shotList[i];
          $('#' + i).remove();
          destroyEnemy(j);
        }
      }

      playerDistance =
        Math.pow((Player.xPos - shot.xPos) / (Player.xRadius + shotRadius), 2) +
        Math.pow((Player.yPos - shot.yPos) / (Player.yRadius + shotRadius), 2);

      if (playerDistance <= 0.75) {
        // Delete the bullet
        delete shotList[i];
        $('#' + i).remove();

        // Adjust player accordingly
        self.lives -= 1;

        if (self.lives > 1) {
          $('#gameStats').html(
            '<h3>Level: ' + level + '</h3><h3>Lives: ' + lives + '</h3>'
          );
        } else {
          $('#gameStats').html(
            '<h3>Level: ' + level + '</h3><h3>Life: ' + lives + '</h3>'
          );
        }

        if (self.lives <= 0) {
          gameOver();
        }
      }
    }
  }

  // Sets new randomly calculated values.
  function changeRandomNum() {
    randomXNum = Math.pow(Math.random() + 0.5, 3);
    randomYNum = Math.pow(Math.random() + 0.5, 3);
  }

  // Spawns the amount of enemies designated by the 'num' parameter.
  function spawnNewEnemies(num) {
    for (i = 0; i < num; i++) {
      spawnEnemy(
        (Math.random() - 0.5) * (arenaWidth - 100) + arenaWidth / 2,
        (Math.random() - 0.5) * (arenaHeight - 100) + arenaHeight / 2
      );
    }
  }

  // Spawns and 'paints' an enemy and assigns it to a unique id.
  function spawnEnemy(xPos, yPos) {
    var index = 'enemy' + numOfEnemies;

    // Not getting summoned correctly
    $('#objectLayer').append(
      '<div id="' + index + '" class="enemy" draggable="false"></div>'
    );

    $('#' + index).css('background-color', 'white'); // Customize - Secondary
    $('#' + index).css('height', 50);
    $('#' + index).css('width', 50);

    var enemy = {
      xAcc: 0,
      yAcc: 0,
      xVel: 0,
      yVel: 0,
      xPos: 0,
      yPos: 0,
    };

    enemyList[numOfEnemies] = enemy;
    numOfEnemies += 1;

    $('#' + index).css({ left: xPos + 'px', top: yPos + 'px' });
    $('objectLayer > .enemy').css('left', -enemyXRadius - 50 / 2);
    $('objectLayer > .enemy').css('top', -enemyYRadius - 50 / 2);
  }

  // Moves every enemy available.
  function moveEnemy() {
    $('#objectLayer')
      .children()
      .each(function () {
        moveEnemyX(this);
        moveEnemyY(this);
      });
  }

  // Moves an enemy along the X axis based on a randomly calculated coordinate location.
  function moveEnemyX(self) {
    // Gets only the 'id' from the enemy name
    var enemy = enemyList[$(self).attr('id').substring(5)];

    enemy.xPos = parseFloat($(self).css('left'));

    var xAcc =
      Math.pow(
        Math.abs(arenaWidth / (parseFloat($(self).css('left')) - enemyXRadius)),
        0.5
      ) -
      Math.pow(
        Math.abs(
          arenaWidth /
            (arenaWidth - parseFloat($(self).css('left')) - enemyXRadius)
        ),
        0.5
      );

    enemy.xAcc = (randomXNum * xAcc) / 50;
    enemy.xVel += enemy.xAcc;

    if (
      enemy.xPos + enemy.xVel >= enemyXRadius &&
      enemy.xPos + enemy.xVel <= arenaWidth - enemyXRadius
    ) {
      enemy.xPos += enemy.xVel;
      xPos = enemy.xPos + 'px';

      $(self).css('left', xPos);
    } else {
      enemy.xVel = 0;
    }
  }

  // Moves an enemy along the Y axis based on a randomly calculated coordinate location.
  function moveEnemyY(self) {
    var enemy = enemyList[$(self).attr('id').substring(5)];

    enemy.yPos = parseFloat($(self).css('top'));

    var yAcc =
      Math.pow(
        Math.abs(arenaHeight / (parseFloat($(self).css('top')) - enemyYRadius)),
        0.5
      ) -
      Math.pow(
        Math.abs(
          arenaHeight /
            (arenaHeight - parseFloat($(self).css('top')) - enemyYRadius)
        ),
        0.5
      );

    enemy.yAcc = (randomYNum * yAcc) / 50;
    enemy.yVel += enemy.yAcc;

    if (
      enemy.yPos + enemy.yVel >= enemyYRadius &&
      enemy.yPos + enemy.yVel <= arenaHeight - enemyYRadius
    ) {
      enemy.yPos += enemy.yVel;
      yPos = enemy.yPos + 'px';

      $(self).css('top', yPos);
    } else {
      enemy.yVel = 0;
    }
  }

  // Fires a bullet from an enemy's current location towards the player's locations.
  function enemyShoot() {
    $('#objectLayer')
      .children()
      .each(function () {
        var enemy = enemyList[$(this).attr('id').substring(5)];

        var distanceDenominator = Math.sqrt(
          Math.pow(enemy.xPos - Player.xPos, 2) +
            Math.pow(enemy.yPos - Player.yPos, 2)
        );

        shotList[numOfShots] = {
          xPos:
            enemy.xPos +
            ((enemyXRadius + 15) * (Player.xPos - enemy.xPos)) /
              distanceDenominator,
          yPos:
            enemy.yPos +
            ((enemyYRadius + 15) * (Player.yPos - enemy.yPos)) /
              distanceDenominator,
          xShot: Player.xPos,
          yShot: Player.yPos,
        };

        var index = numOfShots;
        numOfShots += 1;

        $('#shotLayer').append(
          '<div id="' + index + '" class="enemyShot"></div>'
        );
        $('#' + index).css({
          left: shotList[index].xPos - shotRadius + 'px',
          top: shotList[index].yPos - shotRadius + 'px',
        });
      });
  }

  // Deletes the enemies from the screen once they have been shot. Sets up the next level if neccessary.
  function destroyEnemy(i) {
    delete enemyList[i];

    $('#enemy' + i).remove();

    if (jQuery.isEmptyObject(enemyList)) {
      if (level < 10) {
        level += 1;

        $('#gameStats').html('Level ' + level);

        spawnNewEnemies(level);
      } else {
        gameWon();
      }

      $('#gameStats').html(
        '<h3>Level: ' + level + '</h3><h3>Lives: ' + lives + '</h3>'
      );
    }
  }

  // Display a loss summary message and then reset the game.
  function gameOver() {
    // Clear intervals
    clearInterval(moveEnemyInterval);
    clearInterval(movePlayerInterval);
    clearInterval(changeRandomNumInterval);
    clearInterval(enemyBulletInterval);
    clearInterval(bulletInterval);

    // Clear the game arena
    $('#objectLayer')
      .children()
      .each(function () {
        $(this).remove();
      });

    $('#shotLayer')
      .children()
      .each(function () {
        $(this).remove();
      });

    $('#player').remove();

    // Display a loss message
    $('#gameStats').hide();
    $('.gameResult').html('You Lose.');

    if (level > 1) {
      $('.levelsSurvived').html('You survived ' + level + ' levels.');
    } else {
      $('.levelsSurvived').html('You survived ' + level + ' level.');
    }

    $('#postGameMessage')
      .show()
      .delay(3000)
      .fadeOut(1000)
      .queue(function (n) {
        $(this).hide();
        n();

        $('#mainMenu').show();
      });
  }

  // Display a win summary message and then reset the game.
  function gameWon() {
    // Clear intervals
    clearInterval(moveEnemyInterval);
    clearInterval(movePlayerInterval);
    clearInterval(changeRandomNumInterval);
    clearInterval(enemyBulletInterval);
    clearInterval(bulletInterval);

    // Clear the game arena
    $('#objectLayer')
      .children()
      .each(function () {
        $(this).remove();
      });

    $('#shotLayer')
      .children()
      .each(function () {
        $(this).remove();
      });

    $('#player').remove();

    // Display a win message
    $('#gameStats').hide();
    $('.gameResult').html('You Win!');
    $('.levelsSurvived').html('You survived all 10 levels!');

    $('#postGameMessage')
      .show()
      .delay(3000)
      .fadeOut(1000)
      .queue(function (n) {
        $(this).hide();
        n();

        $('#mainMenu').show();
      });
  }

  // Allows for randomized enemy interactions.
  function changeRandomNum() {
    randomXNum = Math.pow(Math.random() + 0.5, 3);
    randomYNum = Math.pow(Math.random() + 0.5, 3);
  }

  // Returns true if the player is rendered.
  function gameOn() {
    const height = document.querySelector('#postGameMessage').offsetHeight;

    return $('#player').css('left');
  }
});
