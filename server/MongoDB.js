var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var objectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/snake';

function iniciar(operacio) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connectat a snake DB\n");

        if(operacio == "llistarJugadors") {
            findJugadors(db, function () {
                db.close();
            });
        }else if(operacio == "aumgentaPunts"){
            augmentaPunts(db, function () {
                db.close();
            });
        }

    });
}

jugadors = [];

var findJugadors = function(db, callback) {
    var cursor = db.collection('jugadors').find().toArray(function (err, results) {
        jugadors = results;
        console.log(jugadors);
    });
};

var augmentaPunts = function (db, err, callback) {
    db.collection('jugadors').update(
        { nom: "inge" },
        { $set: {score: 10} }
        // { $inc: {score: +1} }
    );
    assert.equal(err, null);
    callback();
};

iniciar("augmentaPunts");
iniciar("llistarJugadors");

console.log(jugadors);
// console.log(results);
// console.log(results.length);
// console.log(results[2].nom);
// console.log(results[2].score);

/**
 * show collections
 * use snake
 * db.jugadors.find()
 * db.jugadors.count()
 * db.jugadors.drop() //esborra colleccio
 * db.jugadors.update( {nom: "inge"}, { $inc: {score: +1} } )
 */
