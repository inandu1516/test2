var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);      //web-sockets server

// middleware
app.use(express.static('public'));

var started = false;


/** --------------- GAME LOGIC --------------- **/


/** donar una id a cada serp de cada jugador:
 * jugador1: SNAKE = 1
 * jugador2: SNAKE = 2
 * **/
var
    ROWS = 5, COLS = 10, FRUIT = 8, LEFT  = 0, UP = 1, RIGHT = 2, DOWN = 3,
    KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN  = 40,
    SCORE_1 = 0, GAME_STARTED = false, GAME_OVER = false;

// //JSON GRID
// var jsnGrid = [];
// for (var x = 0; x < ROWS; x++) {
//     jsnGrid.push([]);
//     for (var y = 0; y < COLS; y++) {
//         jsnGrid[x].push({x: 0, y: 0});
//     }
// }
// console.log(jsnGrid);
// io.sockets.emit('serverGrid', jsnGrid);

grid = {
    _grid: [],
    init: function () {
        this._grid = [];
        for (var x = 0; x < ROWS; x++) {
            this._grid.push([]);
            for (var y = 0; y < COLS; y++) {
                this._grid[x].push(0);
            }
        }
    },
    set: function(val, x, y) {
        this._grid[x][y] = val;
    },
    get: function(x, y) {
        return this._grid[x][y];
    }
};

function snake() {
    this.direction = null; /* number */
    this.last = null;		 /* Object, pointer to the last element in the queue */
    this._queue = null;	 /* Array */

    this.init = function(d, x, y) {
        this.direction = d;
        this._queue = [];
        this.insert(x, y);
    };

     this.insert = function(x, y) {
        this._queue.unshift( {x:x, y:y} );
        this.last = this._queue[0];
    };

    this.remove = function() {
        return this._queue.pop();   //returns the last element
    };

    this.delete = function(ID) {
        for (var x = 0; x < ROWS; x++) {
            for (var y = 0; y < COLS; y++) {
                if(grid.get(x, y) === ID){
                    grid.set(0, x, y);
                }
            }
        }
    };
}

var snake_1 = new snake();
var snake_2 = new snake();
var snakes = {'snake_1': snake_1, 'snake_2': snake_2};

var sp_1 = {x:0, y:0};                            //snake start point for snake_1
var sp_2 = {x:4, y:9};                            //snake start point for snake_2

function setFood() {
    var empty = [];
    // iterate through the grid and find all empty cells
    for (var x=0; x < ROWS; x++) {
        for (var y=0; y < COLS; y++) {
            if (grid.get(x, y) === 0) {
                empty.push({x:x, y:y});
            }
        }
    }
    // chooses a random cell
    var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
    grid.set(FRUIT, randpos.x, randpos.y);
}

function init() {
    grid.init();
    grid.set(FRUIT, 2, 4);

    snake_1.init(UP, sp_1.x, sp_1.y);                     //initialize snake queue with start point
    snake_2.init(UP, sp_2.x, sp_2.y);                     //initialize snake queue with start point

    grid.set(1, sp_1.x, sp_1.y);                         //show the snake position on the  grid
    grid.set(2, sp_2.x, sp_2.y);                         //show the snake position on the  grid

}

function update(key, ID) {
    // change direction of the snake depending on which keys are pressed

    var WhichSnake = 'snake_'.concat(ID);

    if (key == KEY_LEFT) {
        snakes[WhichSnake].direction = LEFT;
    }
    if (key == KEY_UP) {
        snakes[WhichSnake].direction = UP;
    }
    if (key == KEY_RIGHT) {
        snakes[WhichSnake].direction = RIGHT;
    }
    if (key == KEY_DOWN) {
        snakes[WhichSnake].direction = DOWN;
    }

    // pop the last element from the snake queue (the head)

    // var nx = snakes[WhichSnake].last.x;
    // var ny = snakes[WhichSnake].last.y;

    var nx_1 = snake_1.last.x;
    var ny_1 = snake_1.last.y;

    var nx_2 = snake_2.last.x;
    var ny_2 = snake_2.last.y;


    // updates the position depending on the snake direction
    switch (snakes[WhichSnake].direction) {
        case LEFT:
            ny_1--;
            break;
        case UP:
            nx_1--;       //CAMBIAT ELS ORDRES X - Y !!!
            break;
        case RIGHT:
            ny_1++;
            break;
        case DOWN:
            nx_1++;
            break;
    }

    switch (snake_2.direction) {
        case LEFT:
            ny_2--;
            break;
        case UP:
            nx_2--;
            break;
        case RIGHT:
            ny_2++;
            break;
        case DOWN:
            nx_2++;
            break;
    }

    // checks all gameover conditions

    if (0 > nx_1 || nx_1 > 4 || 0 > ny_1 || ny_1 > 9) {
        console.log('Snake 1 reached the border !!');
        GAME_OVER = true;
        snake_1.delete(1);
        snake_1.init(UP, sp_1.x, sp_1.y);
        grid.set(1, sp_1.x, sp_1.y);
        return;
    }else if(grid.get(nx_1, ny_1) === 1){                   //grid.get() !=== 0 || FRUIT
        console.log('Snake 1 reached himself !!');
        GAME_OVER = true;
        snake_1.delete(1);
        snake_1.init(UP, sp_1.x, sp_1.y);
        grid.set(1, sp_1.x, sp_1.y);
        return;
    }else if(grid.get(nx_1, ny_1) === 2){
        console.log('Snake 1 reached Snake 2 !!');
        GAME_OVER = true;
        snake_1.delete(1);
        snake_1.init(UP, sp_1.x, sp_1.y);
        grid.set(1, sp_1.x, sp_1.y);
        return;
    }else{
        GAME_OVER = false;
    }
    
    if (0 > nx_2 || nx_2 > 4 || 0 > ny_2 || ny_2 > 9) {
        console.log('Snake 2 reached the border !!');
        GAME_OVER = true;
        snake_2.delete(2);
        snake_2.init(UP, sp_2.x, sp_2.y);
        grid.set(2, sp_2.x, sp_2.y);
        return;
    }else if(grid.get(nx_2, ny_2) === 2){
        console.log('Snake 2 reached himself !!');
        GAME_OVER = true;
        snake_1.delete(2);
        snake_2.init(UP, sp_2.x, sp_2.y);
        grid.set(2, sp_2.x, sp_2.y);
        return;
    }else if(grid.get(nx_2, ny_2) === 1){
        console.log('Snake 2 reached Snake 1 !!');
        GAME_OVER = true;
        snake_1.delete(2);
        snake_2.init(UP, sp_2.x, sp_2.y);
        grid.set(2, sp_2.x, sp_2.y);
        return;
    }else{
        GAME_OVER = false;
    }

    // // add a snake at the new position and append it to the snake queue
    if(ID == 1 && GAME_OVER == false){
        if (grid.get(nx_1, ny_1) === FRUIT) {
            setFood();      //sets a new fruit position
        }else{
            var tail_1 = snake_1.remove();
            grid.set(0, tail_1.x, tail_1.y);
        }
        grid.set(1, nx_1, ny_1);
        snake_1.insert(nx_1, ny_1);
        console.log('nx_1: ' + nx_1 + ' - ny_1: ' + ny_1);
    }
    if (ID == 2 && GAME_OVER == false){
        if (grid.get(nx_2, ny_2) === FRUIT) {
            setFood();      //sets a new fruit position
        }else{
            var tail_2 = snake_2.remove();
            grid.set(0, tail_2.x, tail_2.y);
        }
        grid.set(2, nx_2, ny_2);
        snake_2.insert(nx_2, ny_2);
        console.log('nx_2: ' + nx_2 + ' - ny_2: ' + ny_2);
    }

}

init();
/** ---------------------------------------------------- **/

io.on('connection', function (socket) {     //sever listens connections to it

    console.log('User connected');
    console.log('game started: ' + started);

    io.sockets.emit('serverGrid', grid._grid.join(" "));

    socket.on('update', function (key, ID) {
        update(key, ID);
        io.sockets.emit('serverGrid', grid._grid.join(" "));
    });

    socket.on('gameStarted', function (gameStarted) {
        if(gameStarted){
            started = true;
            console.log('game started: ' + started);
            io.sockets.emit('started', started);
        }
    });

    socket.on('snakeSelected', function (id) {
        console.log('snakeSelected: ' + id);
        io.sockets.emit('snakeChecked', id);
    });

});

server.listen(3000, function () {
   console.log('Server running at http://localhost:3000 ... KK');
});