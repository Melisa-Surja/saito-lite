  

  } // end initializeGameObjects



  initializeHTML(app) {
    super.initializeHTML(app);
    this.app.modules.respondTo("chat-manager").forEach(mod => {
      mod.respondTo('chat-manager').render(app, this);
      mod.respondTo('chat-manager').attachEvents(app, this);
    });
    $('.content').css('visibility', 'visible');
    $('.hud_menu_game-status').css('display', 'none');

    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {

        GameHammerMobile.render(this.app, this);
        GameHammerMobile.attachEvents(this.app, this, '.gameboard');

      } else {

        GameBoardSizer.render(this.app, this);
        GameBoardSizer.attachEvents(this.app, this, '#hexGrid'); // gameboard is hexGrid

      }
    } catch (err) {}


    this.hud.addCardType("textchoice", "", null);

  }



  
  async initializeGame(game_id) {

    //
    // start image preload as soon as we know we are really going to play RI
    //

    this.preloadImages();

    this.updateStatus("loading game...: " + game_id);
    this.loadGame(game_id);

    if (this.game.status != "") { this.updateStatus(this.game.status); }
    if (this.game.log != "") { 
      if (this.game.log.length > 0) {
        for (let i = this.game.log.length-1; i >= 0; i--) {
	  this.updateLog(this.game.log[i]);
        }
      }
    }
  
    //
    // specify players
    //
    this.totalPlayers = this.game.players.length;  


    //
    // initialize cross-game components
    //
    // this.tech
    // this.factions
    // this.units
    // this.strategy_cards
    // this.agenda_cards
    // this.action_cards
    // this.stage_i_objectives
    // this.stage_ii_objectives
    // this.secret_objectives
    // this.promissary_notes
    //

    //
    // initialize game objects /w functions
    //
    //
    this.initializeGameObjects();

    //
    // put homeworlds on board
    //
    let hwsectors = this.returnHomeworldSectors(this.totalPlayers);


    //
    // IF THIS IS A NEW GAME
    //
    let is_this_a_new_game = 0;
    if (this.game.board == null) {

      is_this_a_new_game = 1;

      //
      // dice
      //
      this.initializeDice();


      //
      // players first
      //
      this.game.players_info = this.returnPlayers(this.totalPlayers); // factions and player info


      //
      // initialize game state
      //
      // this.game.state
      // this.game.planets
      // this.game.sectors
      //
      this.game.state   = this.returnState();
      this.game.sectors = this.returnSectors();
      this.game.planets = this.returnPlanets();

      //
      // create the board
      //
      this.game.board = {};
      for (let i = 1, j = 4; i <= 7; i++) {
        for (let k = 1; k <= j; k++) {
          let slot      = i + "_" + k;
    	  this.game.board[slot] = { tile : "" };
        }
        if (i < 4) { j++; };
        if (i >= 4) { j--; };
      }


      //
      // some general-elements have game-specific elements
      //
      this.game.strategy_cards = [];
      for (let i in this.strategy_cards) {
        this.game.strategy_cards.push(i);
        this.game.state.strategy_cards_bonus.push(0); 
      }
 
 
      //
      // remove tiles in 3 player game
      //
      if (this.totalPlayers <= 3) {
        $('#1_3').attr('id', '');
        delete this.game.board["1_3"];
        $('#1_4').attr('id', '');
        delete this.game.board["1_4"];
        $('#2_5').attr('id', '');
        delete this.game.board["2_5"];
        $('#3_1').attr('id', '');
        delete this.game.board["3_1"];
        $('#4_1').attr('id', '');
        delete this.game.board["4_1"];
        $('#5_1').attr('id', '');
        delete this.game.board["5_1"];
        $('#6_5').attr('id', '');
        delete this.game.board["6_5"];
        $('#7_3').attr('id', '');
        delete this.game.board["7_3"];
        $('#7_4').attr('id', '');
        delete this.game.board["7_4"];
      }
  
  
      //
      // add other planet tiles
      //
      let tmp_sys = JSON.parse(JSON.stringify(this.returnSectors()));
      let seltil = [];
  
  
      //
      // empty space in board center
      //
      this.game.board["4_4"].tile = "new-byzantium";
  
      for (let i in this.game.board) {
        if (i != "4_4" && !hwsectors.includes(i)) {
          let oksel = 0;
          var keys = Object.keys(tmp_sys);
          while (oksel == 0) {
            let rp = keys[this.rollDice(keys.length)-1];
            if (this.game.sectors[rp].hw != 1 && seltil.includes(rp) != 1 && this.game.sectors[rp].mr != 1) {
              seltil.push(rp);
              delete tmp_sys[rp];
              this.game.board[i].tile = rp;
              oksel = 1;
            }
          }
        }
      }
 

      //
      // set homeworlds
      //
      for (let i = 0; i < this.game.players_info.length; i++) {
        this.game.players_info[i].homeworld = hwsectors[i];
        this.game.board[hwsectors[i]].tile = this.factions[this.game.players_info[i].faction].homeworld;
      }
  


      //
      // add starting units to player homewords
      //
      for (let i = 0; i < this.totalPlayers; i++) {
  
        let sys = this.returnSectorAndPlanets(hwsectors[i]); 
  
        let strongest_planet = 0;
        let strongest_planet_resources = 0;
        for (z = 0; z < sys.p.length; z++) {
  	  sys.p[z].owner = (i+1);
   	  if (sys.p[z].resources < strongest_planet_resources) {
  	    strongest_planet = z;
  	    strongest_planet_resources = sys.p[z].resources;
  	  }
        }


	//
	// assign starting units
	//
	for (let k = 0; k < this.factions[this.game.players_info[i].faction].space_units.length; k++) {
          this.addSpaceUnit(i + 1, hwsectors[i], this.factions[this.game.players_info[i].faction].space_units[k]);
	}
	for (let k = 0; k < this.factions[this.game.players_info[i].faction].ground_units.length; k++) {
          this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, this.factions[this.game.players_info[i].faction].ground_units[k]);
	}

	let technologies = this.returnTechnology();


	//
	// assign starting technology
	//
	for (let k = 0; k < this.factions[this.game.players_info[i].faction].tech.length; k++) {
	  let free_tech = this.factions[this.game.players_info[i].faction].tech[k];
	  let player = i+1;
          this.game.players_info[i].tech.push(free_tech);
        }
	//
	// assign starting promissary notes
	//
	for (let k = 0; k < this.factions[this.game.players_info[i].faction].promissary_notes.length; k++) {
	  let promissary = this.factions[this.game.players_info[i].faction].id + "-" + this.factions[this.game.players_info[i].faction].promissary_notes[k];
	  let player = i+1;
          this.game.players_info[i].promissary_notes.push(promissary);
        }

        this.saveSystemAndPlanets(sys);
  
      }



      //
      // initialize game queue
      //
      if (this.game.queue.length == 0) {

        this.game.queue.push("turn");
        this.game.queue.push("newround"); 
        //
        // add cards to deck and shuffle as needed
        //
        for (let i = 0; i < this.game.players_info.length; i++) {
          this.game.queue.push("gain\t"+(i+1)+"\tsecret_objectives\t2");
          this.game.queue.push("DEAL\t6\t"+(i+1)+"\t2");
        }
        this.game.queue.push("SHUFFLE\t1");
        this.game.queue.push("SHUFFLE\t2");
        this.game.queue.push("SHUFFLE\t3");
        this.game.queue.push("SHUFFLE\t4");
        this.game.queue.push("SHUFFLE\t5");
        this.game.queue.push("SHUFFLE\t6");
        this.game.queue.push("POOL\t3");   // stage ii objectives
        this.game.queue.push("POOL\t2");   // stage i objectives
        this.game.queue.push("POOL\t1");   // agenda cards
        this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnStrategyCards()));
        this.game.queue.push("DECK\t2\t"+JSON.stringify(this.returnActionCards()));	
        this.game.queue.push("DECK\t3\t"+JSON.stringify(this.returnAgendaCards()));
        this.game.queue.push("DECK\t4\t"+JSON.stringify(this.returnStageIPublicObjectives()));
        this.game.queue.push("DECK\t5\t"+JSON.stringify(this.returnStageIIPublicObjectives()));
        this.game.queue.push("DECK\t6\t"+JSON.stringify(this.returnSecretObjectives()));
  
      }
    }

    //
    // initialize all units / techs / powers (for all players)
    //
    let z = this.returnEventObjects();
    for (let i = 0; i < z.length; i++) {
      for (let k = 0; k < this.game.players_info.length; k++) {
        z[i].initialize(this, (k+1));
      }
    }


    //
    // if this is a new game, gainTechnology that we start with
    //
    if (is_this_a_new_game == 1) {
      for (let i = 0; i < z.length; i++) {
        for (let k = 0; k < this.game.players_info.length; k++) {
          for (let kk = 0; kk < this.game.players_info[k].tech.length; kk++) {
            z[i].gainTechnology(this, (k+1), this.game.players_info[k].tech[kk]);
          }
        }
      }
      for (let k = 0; k < this.game.players_info.length; k++) {
        this.upgradePlayerUnitsOnBoard((k+1));
      }
    }



    //
    // update planets with tile / sector info
    //
    for (let i in this.game.board) {
      let sector = this.game.board[i].tile;
      let sys = this.returnSectorAndPlanets(sector);
      sys.s.sector = sector;
      sys.s.tile = i;
      if (sys.p != undefined) {
        for (let ii = 0; ii < sys.p.length; ii++) {
          sys.p[ii].sector = sector;
          sys.p[ii].tile = i;
          sys.p[ii].idx = ii;
	  sys.p[ii].hw = sys.s.hw;
	  sys.p[ii].planet = sys.s.planets[ii];
	  if (sys.s.hw == 1) { sys.p[ii].hw = 1; }
        }
      }
      this.saveSystemAndPlanets(sys);
    }



    //
    // initialize laws
    //
    for (let k = 0; k < this.game.state.laws.length; k++) {
      let this_law = this.game.state.laws[k];
      let agenda_name = this_law.agenda;
      let agenda_option = this_law.option;
      if (this.agenda_cards[this_law.agenda]) {
	this.agenda_cards[this_law.agenda].initialize(this, agenda_option);
      }
    }




    //
    // HIDE HUD LOG
    //
    $('.hud-body > .log').remove();
    $('.status').css('display','block');


    //
    // display board
    //
    for (let i in this.game.board) {
  
      // add html to index
      let boardslot = "#" + i;
      $(boardslot).html(
        ' \
          <div class="hexIn" id="hexIn_'+i+'"> \
            <div class="hexLink" id="hexLink_'+i+'"> \
            <div class="hexInfo" id="hex_info_'+i+'"></div> \
              <div class="hex_bg" id="hex_bg_'+i+'"> \
                <img class="hex_img sector_graphics_background '+this.game.board[i].tile+'" id="hex_img_'+i+'" src="" /> \
                <img src="/imperium/img/frame/border_full_white.png" id="hex_img_faction_border_'+i+'" class="faction_border" /> \
                <img src="/imperium/img/frame/border_full_yellow.png" id="hex_img_hazard_border_'+i+'" class="hazard_border" /> \
                <div class="hex_activated" id="hex_activated_'+i+'"> \
              </div> \
                <div class="hex_space" id="hex_space_'+i+'"> \
              </div> \
                <div class="hex_ground" id="hex_ground_'+i+'"> \
              </div> \
              </div> \
            </div> \
          </div> \
        '
      );
  
      // insert planet
      let planet_div = "#hex_img_"+i;
      $(planet_div).attr("src", this.game.sectors[this.game.board[i].tile].img);

      // add planet info
  
      this.updateSectorGraphics(i);

        
          
    }
  
  
    this.updateLeaderboard();
  

    //
    // prevent hangs
    //
    this.game.state.playing_strategy_card_secondary = 0;


    //
    // add events to board 
    //
    this.addEventsToBoard();
    this.addUIEvents();



  }
  
  async preloadImages() {

    var allImages = ["img/influence/5.png", "img/influence/8.png", "img/influence/2.png", "img/influence/1.png", "img/influence/7.png", "img/influence/0.png", "img/influence/9.png", "img/influence/4.png", "img/influence/3.png", "img/influence/6.png", "img/agenda_card_template.png", "img/card_template.jpg", "img/strategy/EMPIRE.png", "img/strategy/DIPLOMACY.png", "img/strategy/BUILD.png", "img/strategy/INITIATIVE.png", "img/strategy/TRADE.png", "img/strategy/TECH.png", "img/strategy/MILITARY.png", "img/strategy/POLITICS.png", "img/secret_objective_ii_back.png", "img/units/fighter.png", "img/units/flagship.png", "img/units/spacedock.png", "img/units/warsun.png", "img/units/dreadnaught.png", "img/units/cruiser.png", "img/units/infantry.png", "img/units/pds.png", "img/units/carrier.png", "img/units/destroyer.png", "img/action_card_back.jpg", "img/sectors_unadorned/sector13.png", "img/sectors_unadorned/sector71.png", "img/sectors_unadorned/sector6.png", "img/sectors_unadorned/sector35.png", "img/sectors_unadorned/sector66.png", "img/sectors_unadorned/sector9.png", "img/sectors_unadorned/sector20.png", "img/sectors_unadorned/sector25.png", "img/sectors_unadorned/sector39.png", "img/sectors_unadorned/sector23.png", "img/sectors_unadorned/sector11.png", "img/sectors_unadorned/sector69.png", "img/sectors_unadorned/sector4.png", "img/sectors_unadorned/sector53.png", "img/sectors_unadorned/sector60.png", "img/sectors_unadorned/sector10.png", "img/sectors_unadorned/sector28.png", "img/sectors_unadorned/sector2.png", "img/sectors_unadorned/sector43.png", "img/sectors_unadorned/sector27.png", "img/sectors_unadorned/sector72.png", "img/sectors_unadorned/sector55.png", "img/sectors_unadorned/sector49.png", "img/sectors_unadorned/sector50.png", "img/sectors_unadorned/sector65.png", "img/sectors_unadorned/sector58.png", "img/sectors_unadorned/sector29.png", "img/sectors_unadorned/sector44.png", "img/sectors_unadorned/sector41.png", "img/sectors_unadorned/sector19.png", "img/sectors_unadorned/sector1.png", "img/sectors_unadorned/sector40.png", "img/sectors_unadorned/sector52.png", "img/sectors_unadorned/sector42.png", "img/sectors_unadorned/sector59.png", "img/sectors_unadorned/sector57.png", "img/sectors_unadorned/sector3.png", "img/sectors_unadorned/sector18.png", "img/sectors_unadorned/sector32.png", "img/sectors_unadorned/sector22.png", "img/sectors_unadorned/sector63.png", "img/sectors_unadorned/sector38.png", "img/sectors_unadorned/sector70.png", "img/sectors_unadorned/sector16.png", "img/sectors_unadorned/sector14.png", "img/sectors_unadorned/sector54.png", "img/sectors_unadorned/sector62.png", "img/sectors_unadorned/sector8.png", "img/sectors_unadorned/sector36.png", "img/sectors_unadorned/sector48.png", "img/sectors_unadorned/sector17.png", "img/sectors_unadorned/sector33.png", "img/sectors_unadorned/sector26.png", "img/sectors_unadorned/sector56.png", "img/sectors_unadorned/sector61.png", "img/sectors_unadorned/sector15.png", "img/sectors_unadorned/sector34.png", "img/sectors_unadorned/sector51.png", "img/sectors_unadorned/sector12.png", "img/sectors_unadorned/sector7.png", "img/sectors_unadorned/sector5.png", "img/sectors_unadorned/sector21.png", "img/sectors_unadorned/sector30.png", "img/sectors_unadorned/sector31.png", "img/sectors_unadorned/sector24.png", "img/sectors_unadorned/sector47.png", "img/sectors_unadorned/sector68.png", "img/sectors_unadorned/sector67.png", "img/sectors_unadorned/sector64.png", "img/sectors_unadorned/sector45.png", "img/sectors_unadorned/sector46.png", "img/arcade/arcade-banner-background.png", "img/secret_objective2.jpg", "img/objective_card_1_template.png", "img/techicons/Cyber D.png", "img/techicons/Warfare D.png", "img/techicons/Warfare L.png", "img/techicons/Biotic D.png", "img/techicons/Propultion Dark.png", "img/techicons/Biotic L.png", "img/techicons/Cybernetic D.png", "img/techicons/Propultion Light.png", "img/techicons/Cybernetic L.png", "img/secret_objective_back.png", "img/planet_card_template.png", "img/secret_objective.jpg", "img/arcade_release.jpg", "img/tech_card_template.jpg", "img/blank_influence_hex.png", "img/spaceb2.jpg", "img/frame/white_space_frame_1_5.png", "img/frame/white_space_frame_4_1.png", "img/frame/white_planet_center_1_9.png", "img/frame/white_planet_center_3_1.png", "img/frame/white_space_frame_full.png", "img/frame/white_space_frame_4_9.png", "img/frame/white_space_frame_6_3.png", "img/frame/white_space_frame_2_4.png", "img/frame/white_space_frame_3_2.png", "img/frame/white_space_frame_2_2.png", "img/frame/white_space_frame_2_3.png", "img/frame/white_space_frame_2_6.png", "img/frame/white_space_frame_7_4.png", "img/frame/white_planet_center_2_5.png", "img/frame/white_space_frame_5_8.png", "img/frame/white_space_frame_1_4.png", "img/frame/white_space_frame_4_4.png", "img/frame/white_space_frame_4_7.png", "img/frame/white_space_frame_2_1.png", "img/frame/white_planet_center_2_1.png", "img/frame/white_planet_center_2_9.png", "img/frame/white_space_frame_4_3.png", "img/frame/border_full_yellow.png", "img/frame/white_planet_center.png", "img/frame/white_space_frame_3_6.png", "img/frame/white_space_frame_7_8.png", "img/frame/white_planet_center_3_7.png", "img/frame/border_corner_red.png", "img/frame/white_space_frame_2_7.png", "img/frame/white_space_frame_3_3.png", "img/frame/white_space_frame_7_7.png", "img/frame/white_planet_center_3_5.png", "img/frame/white_planet_right_bottom.png", "img/frame/white_space_frame_6_2.png", "img/frame/white_planet_left_top.png", "img/frame/white_space_frame_5_7.png", "img/frame/white_space_frame_2_5.png", "img/frame/white_space_frame_1_3.png", "img/frame/white_space_frame_4_2.png", "img/frame/white_space_frame_3_8.png", "img/frame/white_space_frame_2_8.png", "img/frame/white_planet_center_1_8.png", "img/frame/white_space_frame_3_9.png", "img/frame/white_space_frame_3_5.png", "img/frame/white_space_frame_4_5.png", "img/frame/white_space_frame_5_3.png", "img/frame/white_planet_center_2_4.png", "img/frame/white_planet_center_2_3.png", "img/frame/white_space_frame_1_1.png", "img/frame/white_space_frame_1_7.png", "img/frame/white_space_frame_7_1.png", "img/frame/white_space_frame_7_9.png", "img/frame/white_space_frame_5_9.png", "img/frame/white_planet_center_2_7.png", "img/frame/white_space_frame_6_8.png", "img/frame/white_planet_center_3_4.png", "img/frame/white_space_frame_3_7.png", "img/frame/white_space_frame_6_7.png", "img/frame/white_space_frame_6_4.png", "img/frame/white_planet_center_2_6.png", "img/frame/white_space_warsun.png", "img/frame/border_corner_yellow.png", "img/frame/white_planet_center_3_9.png", "img/frame/white_planet_center_3_3.png", "img/frame/white_space_frame_5_6.png", "img/frame/white_space_frame_5_2.png", "img/frame/border_full_white.png", "img/frame/white_planet_center_3_6.png", "img/frame/white_space_carrier.png", "img/frame/border_full_red.png", "img/frame/white_space_flagship.png", "img/frame/white_space_destroyer.png", "img/frame/white_space_frame_4_6.png", "img/frame/white_planet_center_2_2.png", "img/frame/white_space_frame_4_8.png", "img/frame/white_space_cruiser.png", "img/frame/white_space_frame_3_4.png", "img/frame/white_planet_center_1_6.png", "img/frame/white_planet_center_1_1.png", "img/frame/white_space_frame_5_4.png", "img/frame/white_space_frame_6_9.png", "img/frame/white_space_frame_7_5.png", "img/frame/white_planet_center_1_7.png", "img/frame/white_space_frame_1_8.png", "img/frame/white_space_frame_7_6.png", "img/frame/white_planet_center_3_2.png", "img/frame/white_planet_center_1_4.png", "img/frame/white_space_frame_7_2.png", "img/frame/white_space_frame_5_1.png", "img/frame/white_space_frame_7_3.png", "img/frame/white_space_frame_6_6.png", "img/frame/white_space_frame_1_6.png", "img/frame/white_planet_center_3_8.png", "img/frame/white_space_frame.png", "img/frame/white_space_frame_1_9.png", "img/frame/white_space_frame_6_5.png", "img/frame/white_planet_center_1_2.png", "img/frame/white_planet_center_2_8.png", "img/frame/white_space_frame_5_5.png", "img/frame/white_space_frame_2_9.png", "img/frame/white_space_frame_3_1.png", "img/frame/white_space_frame_6_1.png", "img/frame/white_space_dreadnaught.png", "img/frame/white_planet_center_1_3.png", "img/frame/white_space_frame_1_2.png", "img/frame/white_space_fighter.png", "img/frame/white_planet_center_1_5.png", "img/sectors/sector13.png", "img/sectors/sector71.png", "img/sectors/sector6.png", "img/sectors/sector35.png", "img/sectors/sector66.png", "img/sectors/sector9.png", "img/sectors/sector20.png", "img/sectors/sector25.png", "img/sectors/sector39.png", "img/sectors/sector23.png", "img/sectors/sector11.png", "img/sectors/sector69.png", "img/sectors/sector4.png", "img/sectors/sector53.png", "img/sectors/sector60.png", "img/sectors/sector10.png", "img/sectors/sector28.png", "img/sectors/sector2.png", "img/sectors/sector43.png", "img/sectors/sector27.png", "img/sectors/sector72.png", "img/sectors/sector55.png", "img/sectors/sector49.png", "img/sectors/sector50.png", "img/sectors/sector65.png", "img/sectors/sector58.png", "img/sectors/sector29.png", "img/sectors/sector44.png", "img/sectors/sector41.png", "img/sectors/sector19.png", "img/sectors/sector1.png", "img/sectors/sector73.png", "img/sectors/sector40.png", "img/sectors/sector52.png", "img/sectors/sector42.png", "img/sectors/sector59.png", "img/sectors/sector57.png", "img/sectors/sector3.png", "img/sectors/sector18.png", "img/sectors/sector32.png", "img/sectors/sector22.png", "img/sectors/sector63.png", "img/sectors/sector38.png", "img/sectors/sector70.png", "img/sectors/sector16.png", "img/sectors/sector14.png", "img/sectors/sector54.png", "img/sectors/sector62.png", "img/sectors/sector8.png", "img/sectors/sector36.png", "img/sectors/sector48.png", "img/sectors/sector17.png", "img/sectors/sector33.png", "img/sectors/sector26.png", "img/sectors/sector56.png", "img/sectors/sector61.png", "img/sectors/sector15.png", "img/sectors/sector34.png", "img/sectors/sector51.png", "img/sectors/sector12.png", "img/sectors/sector7.png", "img/sectors/sector5.png", "img/sectors/sector21.png", "img/sectors/sector30.png", "img/sectors/sector31.png", "img/sectors/sector24.png", "img/sectors/sector47.png", "img/sectors/sector68.png", "img/sectors/sector67.png", "img/sectors/sector64.png", "img/sectors/sector45.png", "img/sectors/sector46.png", "img/arcade.jpg", "img/ships/ship_1.png", "img/ships/ship_16.png", "img/ships/ship_15.png", "img/ships/ship_5.png", "img/ships/ship_18.png", "img/ships/ship19.png", "img/ships/ship_17.png", "img/ships/ship_2.png", "img/ships/ship_12.png", "img/ships/ship_8.png", "img/ships/ship_3.png", "img/ships/ship_11.png", "img/ships/ship_10.png", "img/ships/ship_14.png", "img/ships/ship_9.png", "img/ships/ship_13.png", "img/ships/Ship_6.png", "img/blank_resources_hex.png", "img/factions/faction2.jpg", "img/factions/faction1.jpg", "img/factions/faction3.jpg", "img/spacebg.png", "img/resources/5.png", "img/resources/8.png", "img/resources/2.png", "img/resources/1.png", "img/resources/7.png", "img/resources/0.png", "img/resources/9.png", "img/resources/4.png", "img/resources/3.png", "img/resources/6.png", "img/planets/HARKON-CALEDONIA.png", "img/planets/KLENCORY.png", "img/planets/STARTIDE.png", "img/planets/UNSULLA.png", "img/planets/GRAVITYS-EDGE.png", "img/planets/OLYMPIA.png", "img/planets/OTHO.png", "img/planets/ARCHION-REX.png", "img/planets/KROEBER.png", "img/planets/COTILLARD.png", "img/planets/INCARTH.png", "img/planets/XERXES-IV.png", "img/planets/HEARTHSLOUGH.png", "img/planets/QUARTIL.png", "img/planets/SOUNDRA-IV.png", "img/planets/INDUSTRYL.png", "img/planets/VIGOR.png", "img/planets/CALTHREX.png", "img/planets/VESPAR.png", "img/planets/HIRAETH.png", "img/planets/LAZAKS-CURSE.png", "img/planets/CRYSTALIS.png", "img/planets/SINGHARTA.png", "img/planets/JOL.png", "img/planets/NOVA-KLONDIKE.png", "img/planets/QUANDAM.png", "img/planets/OLD-MOLTOUR.png", "img/planets/FIREHOLE.png", "img/planets/CONTOURI-I.png", "img/planets/CONTOURI-II.png", "img/planets/SIRENS-END.png", "img/planets/FJORDRA.png", "img/planets/LORSTRUCK.png", "img/planets/SHRIVA.png", "img/planets/EARTH.png", "img/planets/HOTH.png", "img/planets/KROMER.png", "img/planets/VOLUNTRA.png", "img/planets/EBERBACH.png", "img/planets/NEW-BYZANTIUM.png", "img/planets/TROTH.png", "img/planets/ARTIZZ.png", "img/planets/NEW-JYLANX.png", "img/planets/XIAO-ZUOR.png", "img/planets/NAR.png", "img/planets/GIANTS-DRINK.png", "img/planets/GRANTON-MEX.png", "img/planets/MIRANDA.png", "img/planets/HOPES-LURE.png", "img/planets/OUTERANT.png", "img/planets/BELVEDYR.png", "img/planets/YODERUX.png", "img/planets/YSSARI-II.png", "img/planets/QUAMDAM.png", "img/planets/ZONDOR.png", "img/planets/SIGURD.png", "img/planets/MECHANEX.png", "img/planets/RIFTVIEW.png", "img/planets/POPULAX.png", "img/planets/GROX-TOWERS.png", "img/planets/BREST.png", "img/planets/TERRA-CORE.png", "img/planets/QUANDOR.png", "img/planets/DOMINIC.png", "img/planets/LONDRAK.png", "img/planets/PESTULON.png", "img/planets/NEW-ILLIA.png", "img/planets/LEGUIN.png", "img/planets/UDON-I.png", "img/planets/CITADEL.png", "img/planets/UDON-II.png", "img/planets/PERTINAX.png", "img/planets/ARCHION-TAO.png", "img/planets/CRAW-POPULI.png", "img/planets/RIFVIEW.png", "img/planets/BROUGHTON.png", "img/planets/AANDOR.png", "img/tech_tree.png", "img/action_card_template.png", "img/objective_card_2_template.png"];

    var pre_images = new Array;

    for (i = 0; i < allImages.length; i++) {
      pre_images[i] = new Image;
      pre_images[i].src = "/imperium/" + allImages[i];
    }
  }




