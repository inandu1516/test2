var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var objectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/snake';
var collection = null;

function iniciar(operacio, param) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connectat a snake DB\n");
        collection = db.collection('jugadors');

        if(operacio == "llistarJugadors") {
            findJugadors(db, function () {
                db.close();
            });
        }else if(operacio == "augmentaPunts"){
            augmentaPunts(db, function () {
                db.close();
            });
        }else if(operacio == "creaUsuari"){
            creaUsuari(db, param, function () {
                db.close();
            });
        }

    });
}

jugadors = [];

var findJugadors = function(db, callback) {
    console.log('llistant jugadors...');
    var cursor = db.collection('jugadors').find().toArray(function (err, results) {
        jugadors = results;
        console.log(jugadors);
    });
};

//simple json record
var usuari_1 = {nom:"David", score:"About MongoDB"};

collection.insert({nom: 'taco', score: 99}, function(err, result) {
    db.close();
});

var creaUsuari = function (db, nom, callback) {
    console.log('creant usuari...');
    db.collection('jugadors').insert(usuari_1, function(err, records) {
        if (err) throw err;
        console.log("Record added as "+records[0]._id);
    });
    // db.collection('jugadors').insert(   //db.jugadors.insert( {nom: "nolose"}, { score: 10 } )
    //     { nom: nom },
    //     { score: 0 }
    // );
    callback();
};

var augmentaPunts = function (db, callback) {
    console.log('aumentant puntuació...');
    db.collection('jugadors').update(
        { nom: "inge" },
        { $inc: {score: +1} }
    );
    callback();
};

// iniciar("augmentaPunts", 0);
// iniciar("creaUsuari", "yolo");
iniciar("llistarJugadors", 0);

console.log(jugadors);
// console.log(results);
// console.log(results.length);
// console.log(results[2].nom);
// console.log(results[2].score);

/**
 * use snake
 * show collections
 * db.jugadors.find()
 * db.jugadors.count()
 * db.jugadors.drop() //esborra colleccio
 * db.jugadors.update( {nom: "inge"}, { $inc: {score: +1} } )
 * db.jugadors.insert( {nom: "nolose"}, { score: 10 } )
 */
