const ArcadeMainTemplate = require('./arcade-main.template');

const ArcadeGameCarousel = require('./arcade-game-carousel/arcade-game-carousel');

const ArcadeStartGameList = require('./../arcade-start-game-list/arcade-start-game-list');

const ArcadeGameTemplate = require('./arcade-game.template');
const ArcadeGameListRowTemplate = require('./arcade-gamelist-row.template');

const ArcadeLoader = require('./arcade-loader');
const ArcadeGameCreate = require('./arcade-game-create/arcade-game-create');


module.exports = ArcadeMain = {

  render(app, data) {

    let arcade_main = document.querySelector(".arcade-main");
    if (!arcade_main) { return; }
    arcade_main.innerHTML = ArcadeMainTemplate();

    data.arcade.games.forEach(tx => {

      let game_id = tx.msg.game_id;
      let game = tx.msg.game;
      let players = tx.msg.players;
      let players_sigs = tx.msg.players_sigs;

//      console.log("\n\n\nSHOWING GAMES: ");
//      console.log("PLAYERS: " + JSON.stringify(tx.msg.players));
//      console.log("TX: " + JSON.stringify(tx));
//      console.log("PLAYERS: " + players);
//      console.log("PLAYER SIGS: " + players_sigs);






      if (game == '') { return; }

      let button_text = {};
      button_text.join = "JOIN";

      if (tx.msg.over == 1) {
        delete button_text.join;
      }

      if (players) {
        if (players.includes(app.wallet.returnPublicKey())) {
          delete button_text.join;
        }
        if (players.includes(app.wallet.returnPublicKey())) {
          button_text.cancel = "CANCEL";
        }
      }


      if (app.options.games) {

        let { games } = app.options;

        games.forEach(game => {

          if (game.initializing == 0 && game.id == game_id) {

            button_text.continue = "CONTINUE";
            delete button_text.join;

            if (tx.msg.over == 1) {
              delete button_text.continue;
            }

          }
        });
      }

      document.querySelector('.arcade-gamelist').innerHTML += ArcadeGameListRowTemplate(app, tx, button_text);
    });

  },







  attachEvents(app, data) {

    //
    // carousel
    //
    
    //document.querySelector('.arcade-carousel-wrapper').addEventListener('click', (e) => {
    //  ArcadeStartGameList.render(app, data);
    //  ArcadeStartGameList.attachEvents(app, data);
    //});

    //
    // big button (removed)
    //
    let big_create_button = document.querySelector('.big-create-game');
    if (big_create_button) {
      big_create_button.onclick = (e) => {
        ///////////////////////////////////////////
        // TUTORIAL - REGISTER USERNAME OVERRIDE //
        ///////////////////////////////////////////
        let tutorialmod = app.modules.returnModule("Tutorial");
        if (tutorialmod) {
          if (tutorialmod.username_registered == 0) {
            if (!app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey())) {
              try { tutorialmod.registerIdentifierModal(); } catch (err) { };
              return;
            }
          }
        }
        ArcadeStartGameList.render(app, data);
        ArcadeStartGameList.attachEvents(app, data);
      };
    }

    //
    // create game
    //
    Array.from(document.getElementsByClassName('game')).forEach(game => {
      game.addEventListener('click', (e) => {
        data.active_game = e.currentTarget.id;
        ArcadeGameCreate.render(app, data);
        ArcadeGameCreate.attachEvents(app, data);
      });
    });


    //
    // join game
    //
    Array.from(document.getElementsByClassName('arcade-game-row-join')).forEach(game => {
      game.onclick = (e) => {

        if (document.getElementById(e.target.id+"-pass").value != "") { return; }

        let game_id = e.currentTarget.id;
        game_id = game_id.split('-').pop();

        //
        // find our accepted game
        //
        let { games } = data.arcade;
        let accepted_game = null;

        games.forEach((g) => {
          if (g.transaction.sig === game_id) { accepted_game = g; }
        });

        if (!accepted_game) { return; }

  //
  // if there are not enough players, we will join not accept
  //
        let players_needed = parseInt(accepted_game.msg.players_needed);
        let players_available = accepted_game.msg.players.length;
        if ( players_needed > (players_available+1) ) {
          let newtx = data.arcade.createJoinTransaction(app, data, accepted_game);
          data.arcade.app.network.propagateTransaction(newtx);
          data.arcade.joinGameOnOpenList(newtx);
          salert("Joining game! Please wait a moment");
    return;
  }

  //
  // we are the final player, but first check we're not accepting our own game
  //
        if (accepted_game.transaction.from[0].add == app.wallet.returnPublicKey()) {
          let { players } = accepted_game.returnMessage();
          if (players.length > 1) {
            salert(`
              This is your game! Not enough players have joined the game for us to start,
              but we'll take you to the loading page since at least one other player is waiting for this game to start....
            `);
            ArcadeLoader.render(app, data);
            ArcadeLoader.attachEvents(app, data);
          } else {
            salert("You cannot accept your own game!");
          }

        } else {

          //
          // we are going to send a message to accept this game, but first check if we have
          // already done this, in which case we will have the game loaded in our local games list
          //
          if (app.options.games) {

            let existing_game = app.options.games.find(g => g.id == game_id);

            if (existing_game != -1 && existing_game) {
              if (existing_game.initializing == 1) {

                salert("Accepted Game! It may take a minute for your browser to update -- please be patient!");

                ArcadeLoader.render(app, data);
                ArcadeLoader.attachEvents(app, data);
                return;

              } else {

                //
                // solid game already created
                //
                existing_game.ts = new Date().getTime();
                existing_game.initialize_game_run = 0;
                app.storage.saveOptions();
                window.location = '/' + existing_game.module.toLowerCase();
                return;
              }
            }
          }

          //
          // check with server to see if this game is taken yet
          //
          data.arcade.sendPeerRequestWithFilter(
            () => {

              let msg = {};
                  msg.request = 'rawSQL';
                  msg.data = {};
                  msg.data.module = "Arcade";
                  msg.data.sql = `SELECT is_game_already_accepted FROM games WHERE game_id = "${game_id}"`;
                  msg.data.game_id = game_id;

              return msg;

            },

            (res) => {

              if (res.rows == undefined) {
                console.log("ERROR 458103: cannot fetch information on whether game already accepted!");
                return;
              }

              if (res.rows.length > 0) {
                if (res.rows[0].game_still_open == 1 || (res.rows[0].game_still_open == 0 && players_needed > 2)) {


                  //
                  // data re: game in form of tx
                  //
                  let { transaction } = accepted_game;
                  let game_tx = Object.assign({ msg: { players_array: null } }, transaction);

                  salert("Game accepted - please wait");
                  let newtx = data.arcade.createAcceptTransaction(accepted_game);
                  data.arcade.app.network.propagateTransaction(newtx);

                  ArcadeLoader.render(app, data);
                  ArcadeLoader.attachEvents(app, data);

                 return;

                } else {
                  salert("Sorry, this game has been accepted already!");
                }
              } else {
                salert("Sorry... game already accepted. Your list of open games will update shortly on next block!");
              }
            }
          );
        }
      };
    });



    Array.from(document.getElementsByClassName('arcade-game-row-delete')).forEach(game => {
      game.onclick = (e) => {

        let game_id = e.currentTarget.id;
        game_id = game_id.split('-').pop();
        salert(`Delete game id: ${game_id}`);

        if (app.options.games) {

          let { games } = app.options;

          for (let i = 0; i < app.options.games.length; i++) {
            if (app.options.games[i].id == game_id) {

              let resigned_game = app.options.games[i];

              if (resigned_game.over == 0) {

                let game_mod = app.modules.returnModule(resigned_game.module);
                game_mod.resignGame(game_id);

              } else {

                //
                // removing game someone else ended
                //
                app.options.games[i].over = 1;
                app.options.games[i].last_block = app.blockchain.last_bid;
                app.storage.saveOptions();

              }
            }
          }
          this.removeGameFromList(game_id);
        }
      };
    });


    Array.from(document.getElementsByClassName('arcade-game-row-continue')).forEach(game => {
      game.onclick = (e) => {
        let game_id = e.currentTarget.id;
        game_id = game_id.split('-').pop();

        if (app.options.games) {
          for (let i = 0; i < app.options.games.length; i++) {
            if (app.options.games[i].id == game_id) {
              app.options.games[i].ts = new Date().getTime();
              app.storage.saveOptions();
              let thismod = app.modules.returnModule(app.options.games[i].module);
              window.location = '/' + thismod.returnSlug();
            }
          }
        }
      };
    });


    Array.from(document.getElementsByClassName('arcade-game-row-cancel')).forEach(game => {
      game.onclick = (e) => {

        let game_id = e.currentTarget.id;
        sig = game_id.split('-').pop();
        var testsig = "";
        let players = [];

        if (app.options.games) {
          for (let i = 0; i < app.options.games.length; i++) {
            if(typeof(app.options.games[i].transaction) != 'undefined') {
              testsig = app.options.games[i].transaction.sig;
            } else if (typeof(app.options.games[i].id) != 'undefined') {
              testsig = app.options.games[i].id;
            }
            if ( testsig == sig) {
              app.options.games[i].over = 1;
              players = app.options.games[i].players;
              app.options.games.splice(i, 1);
              app.storage.saveOptions();
            }
          }
        }

        let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
        let my_publickey = app.wallet.returnPublicKey();

        for (let i = 0; i < players.length; i++) {
          if (players[i] != my_publickey) newtx.transaction.to.push(app.wallet.createSlip(players[i]));
        }

        let msg = {
          sig: sig,
          status: 'close',
          request: 'close',
          winner: players[0] == my_publickey ? players[1] : players[0],
          module: 'Arcade'
        }

        newtx.msg = msg;
        newtx = app.wallet.signTransaction(newtx);
        app.network.propagateTransaction(newtx);

        this.removeGameFromList(sig);
      }
    });
  },

  removeGameFromList(game_id) {
    document.getElementById(`arcade-gamelist`)
      .removeChild(document.getElementById(`arcade-game-${game_id}`));
  }

}
