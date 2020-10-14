let ArcadeGameCreateTemplate = require('./arcade-game-create.template.js');

const getOptions = () => {
  let options = {};
  document.querySelectorAll('form input, form select').forEach(element => {
    if (element.type == "checkbox") {
      if (element.checked) {
        options[element.name] = 1;
      }
    } else {
      options[element.name] = element.value;
    }
  });
  return options;
}

module.exports = ArcadeGameDreate = {

  render(app, data) {

    document.querySelector('.wizard-holder').innerHTML += ArcadeGameCreateTemplate();
    let game_id = data.active_game;

    for (let i = 0; i < data.arcade.mods.length; i++) {
      if (data.arcade.mods[i].name === game_id) {

        let gamemod = data.arcade.mods[i];
        let gamemod_url = "/" + gamemod.slug + "/img/arcade.jpg";

        document.querySelector('.game-image').src = gamemod_url;
        document.querySelector('.background-shim').style.backgroundImage = 'url(' + gamemod_url + ')';
        document.querySelector('.game-title').innerHTML = gamemod.name;
        document.querySelector('.game-description').innerHTML = gamemod.description;
        document.querySelector('.game-publisher-message').innerHTML = gamemod.publisher_message;
        let x = gamemod.returnGameOptionsHTML();
        if (x != "") {
          document.querySelector('.game-details').innerHTML = '<h3>' + gamemod.name + ': </h3><form id="options" class="options">' + x + '</form>'
        }

        setTimeout(() => {

          //
          // TODO: is this value supposed to be used?
          //
          // let current_sel = document.querySelector('.game-players-select').value;

          for (let p = gamemod.minPlayers; p <= gamemod.maxPlayers; p++) {
            var option = document.createElement("option");
            option.text = p + " player";
            option.value = p;
            document.querySelector('.game-players-select').add(option);
          }

        }, 100);

        //game-invite-btn
        document.getElementById('game-invite-btn')
          .addEventListener('click', (e) => {

            let options = getOptions();

            let gamedata = {
              name: gamemod.name,
              slug: gamemod.returnSlug(),
              options: gamemod.returnFormattedGameOptions(options),
              options_html: gamemod.returnGameRowOptionsHTML(options),
              players_needed: document.querySelector('.game-players-select').value,
            };


            var players_needed = document.querySelector('.game-players-select').value;

            if (players_needed == 1) {
              // 1 player games just launch
              data.arcade.launchSinglePlayerGame(app, data, gamedata);
              return;
            } else {
              document.querySelector('.game-details').toggleClass('hidden');
              document.querySelector('.game-start-controls').toggleClass('hidden');
              document.querySelector('.game-invite-controls').toggleClass('hidden');

              if (players_needed >= 3) {
                document.querySelector('#link-invite').toggleClass('hidden');
              }
            }



          });

        document.getElementById('game-create-btn')
          .addEventListener('click', (e) => {
            let options = getOptions();

            let gamedata = {
              ts: new Date().getTime(),
              name: gamemod.name,
              slug: gamemod.returnSlug(),
              options: gamemod.returnFormattedGameOptions(options),
              options_html: gamemod.returnGameRowOptionsHTML(options),
              players_needed: document.querySelector('.game-players-select').value,
            };

            let newtx = data.arcade.createOpenTransaction(gamedata);
            data.arcade.app.network.propagateTransaction(newtx);
            //document.querySelector('.arcade-main').innerHTML = '';
            document.querySelector('.background-shim').destroy();
            document.querySelector('.create-game-wizard').destroy();
            data.arcade.renderMain(app, data);

          });



        document.getElementById('friend-invite-btn')
          .addEventListener('click', (e) => {

            var players_needed = document.querySelector('.game-players-select').value;
            var players_invited = document.querySelector('#game-invitees').value.split(/[ ,]+/);

            if (players_needed == 1) {
              // 1 player games just launch
              data.arcade.launchSinglePlayerGame(app, data, gamedata);
              return;
            }

            if (players_invited.length >= players_needed - 1) {
              let options = getOptions();
              options['players_invited'] = players_invited;

              let gamedata = {
                ts: new Date().getTime(),
                name: gamemod.name,
                slug: gamemod.returnSlug(),
                options: gamemod.returnFormattedGameOptions(options),
                options_html: gamemod.returnGameRowOptionsHTML(options),
                players_needed: document.querySelector('.game-players-select').value,
              };


              let newtx = data.arcade.createOpenTransaction(gamedata);
              data.arcade.app.network.propagateTransaction(newtx);
              //document.querySelector('.arcade-main').innerHTML = '';
              //make more specific
              document.querySelector('.background-shim').destroy();
              document.querySelector('.create-game-wizard').destroy();
              data.arcade.renderMain(app, data);
            } else {
              salert('More players needed. Add a comma separated list of their names or addresses.');
              document.querySelector('#game-invitees').focus();
            }

          });

        //
        //link-invite-btn
        //
        
        document.getElementById('link-invite-btn')
          .addEventListener('click', (e) => {

            document.querySelector('.game-players-select').value = 2;

            let { active_game } = data;
            let game_module = app.modules.returnModule(active_game);
            let options = game_module.returnFormattedGameOptions(getOptions());

            let payload = {
              ts: new Date().getTime(),
              name: active_game,
              slug: game_module.returnSlug(),
              publickey: app.wallet.returnPublicKey(),
              options,
              players_needed: 2,
            };

            let newtx = data.arcade.createOpenTransaction(payload);
            let base64str = app.crypto.stringToBase64(JSON.stringify({
              tx: newtx.transaction
            }));

            //
            // TODO: include additional html for copy to clipboard functionality
            console.log(base64str);


            var inviteInput = document.getElementById("link-invite-input");
            //inviteInput.innerText = `${window.location}invite/${base64str}`;


            var link = `${window.location}invite/${base64str}`;
            const el = document.createElement('textarea');
            el.value = link;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
	    salert("invite link copied to clipboard and added to your list of open games...");
            //siteMessage('Invite Link Copied', 5000);


            data.arcade.addGameToOpenList(newtx);

          });

        return;
      }
    }
  },

  attachEvents(app, data) {

    document.querySelector('#return-to-arcade')
      .onclick = (e) => {
        //document.querySelector('.arcade-main').innerHTML = '';
        // make more specific
        document.querySelector('.background-shim').destroy();
        document.querySelector('.create-game-wizard').destroy();
        data.arcade.renderMain(app, data);
      }

    document.querySelector('.background-shim-cover')
      .onclick = (e) => {
        //document.querySelector('.arcade-main').innerHTML = '';
        // make more specific
        document.querySelector('.background-shim').destroy();
        document.querySelector('.create-game-wizard').destroy();
        data.arcade.renderMain(app, data);
      }


    document.getElementById('link-invite-btn')
      .onclick = () => {

        let { active_game } = data;
        let game_module = app.modules.returnModule(active_game);
        let options = game_module.returnFormattedGameOptions(getOptions());

	let gpselect = document.querySelector('.game-player-select');
	let plnum    = gpselect.options[gpselect.selectedIndex].value;


        let payload = {
          ts: new Date().getTime(),
          name: active_game,
          slug: game_module.returnSlug(),
          publickey: app.wallet.returnPublicKey(),
          options,
          players_needed: plnum,
        };

        let newtx = data.arcade.createOpenTransaction(payload);
        let base64str = app.crypto.stringToBase64(JSON.stringify({
          tx: newtx.transaction
        }));

        //
        // TODO: include additional html for copy to clipboard functionality
        console.log(base64str);

        var inviteInput = document.getElementById("link-invite-input");
        inviteInput.value = `${window.location}invite/${base64str}`;
        inviteInput.select()
        inviteInput.setSelectionRange(0, 99999); /* for mobile */
        document.execCommand("copy");
        salert(`Link copied to clipboard`);

        data.arcade.addGameToOpenList(newtx);
      }
  }

}
