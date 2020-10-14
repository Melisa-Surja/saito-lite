

    this.importActionCard('leadership-rider', {
  	name : "Leadership Rider" ,
  	type : "rider" ,
  	text : "Gain two strategy tokens and 1 command token" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {
	  if (imperium_self.game.player == action_card_player) {
	    let active_agenda = imperium_self.returnActiveAgenda();
	    let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
	    let elect = imperium_self.agenda_cards[active_agenda].elect;
            let msg  = 'On which choice do you wish to place your Leadership rider?';
	    imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
	      imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"diplomacy-rider"+"\t"+choice);
	      imperium_self.addMove("NOTIFY\t"+imperium_self.game.player+" has placed a Leadership Rider on "+choice);
	      imperium_self.endTurn();
	    });
	  }
	  return 0;
	},
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {
          imperium_self.game.players_info[action_card_player-1].strategy_tokens += 2;
          imperium_self.game.players_info[action_card_player-1].command_tokens += 1;
	  imperium_self.updateLog(imperium_self.returnFaction(action_card_player) + " gains 2 strategy tokens and 1 command token");
	  return 1;
	}
    });






    this.importActionCard('diplomacy-rider', {
  	name : "Diplomacy Rider" ,
  	type : "rider" ,
  	text : "Select a planet and destroy all PDS units on that planet" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {

	  if (imperium_self.game.player == action_card_player) {

	    let active_agenda = imperium_self.returnActiveAgenda();
	    let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
	    let elect = imperium_self.agenda_cards[active_agenda].elect;

            let msg  = 'On which choice do you wish to place your Diplomacy rider?';
	    imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
	      imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"diplomacy-rider"+"\t"+choice);
	      imperium_self.addMove("NOTIFY\t"+imperium_self.game.player+" has placed a Diplomacy Rider on "+choice);
	      imperium_self.endTurn();
	    });
	  }
	  return 0;
	},
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {

	  //
	  // rider is executed
	  //
	  if (action_card_player == imperium_self.game.player) {

            imperium_self.playerSelectSectorWithFilter(
              "Select a sector with a planet you control to mire in diplomatic conflict: ",
              function(sector) {
		for (let i = 0; i < imperium_self.game.sectors[sector].planets.length; i++) {
  		  if (imperium_self.game.planets[imperium_self.game.sectors[sector].planets[i]].owner == imperium_self.game.player) { return 1; } return 0;
                }
              },
              function(sector) {
                for (let b = 0; b < imperium_self.game.players_info.length; b++) {
                  imperium_self.addMove("activate\t"+(b+1)+"\t"+sector);
                }
                imperium_self.addMove("NOTIFY\t" + imperium_self.returnFaction(imperium_self.game.player) + " uses Diplomacy Rider to protect " + sector);
                imperium_self.endTurn();
                return 0;
              },
              null
            );
	  }
	  return 0;
	}
    });





    this.importActionCard('politics-rider', {
  	name : "Politics Rider" ,
  	type : "rider" ,
  	text : "Gain three action cards and the speaker token" ,
        playActionCard : function(imperium_self, player, action_card_player, card) {
          if (imperium_self.game.player == action_card_player) {
            let active_agenda = imperium_self.returnActiveAgenda();
            let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
            let elect = imperium_self.agenda_cards[active_agenda].elect;
            let msg  = 'On which choice do you wish to place your Politics rider?';
            imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
              imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"politics-rider"+"\t"+choice);
              imperium_self.addMove("NOTIFY\t"+imperium_self.game.player+" has placed a Politics Rider on "+choice);
              imperium_self.endTurn();
            });
          }
          return 0;
        },
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {
	
	  if (imperium_self.game.player == action_card_player) {

	    // three action cards
            imperium_self.addMove("gain\t"+imperium_self.game.player+"\taction_cards\t3");
            imperium_self.addMove("DEAL\t2\t"+imperium_self.game.player+"\t3");
            imperium_self.addMove("NOTIFY\tdealing two action cards to player "+player);

	    // and change speaker
	    let html = 'Make which player the speaker? <ul>';
            for (let i = 0; i < imperium_self.game.players_info.length; i++) {
              html += '<li class="textchoice" id="'+i+'">' + factions[imperium_self.game.players_info[i].faction].name + '</li>';
            }
            html += '</ul>';
            imperium_self.updateStatus(html);

            let chancellor = imperium_self.game.player;

            $('.textchoice').off();
            $('.textchoice').on('click', function() {
              let chancellor = (parseInt($(this).attr("id")) + 1);
	      imperium_self.addMove("change_speaker\t"+chancellor);
	      imperium_self.endTurn();
	    });
	  } 

 	  return 0;
	}
    });




    this.importActionCard('construction-rider', {
  	name : "Construction Rider" ,
  	type : "rider" ,
  	text : "Player may place a space dock on a planet they control" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {
	  if (action_card_player == imperium_self.game.player) {

            let active_agenda = imperium_self.returnActiveAgenda();
            let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
            let elect = imperium_self.agenda_cards[active_agenda].elect;

            let msg = 'On which choice do you wish to place the Construction rider?';
            imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
              imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"construction-rider"+"\t"+choice);
              imperium_self.addMove("NOTIFY\t"+imperium_self.game.player+" has placed a Construction Rider on "+choice);
              imperium_self.endTurn();
            });

	  }
	  return 0;
	},
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {
	  if (action_card_player == imperium_self.game.player) {
            imperium_self.playerSelectPlanetWithFilter(
              "Select a planet you control without a Space Dock: ",
              function(planet) {
  		if (imperium_self.game.planets[planet].owner == imperium_self.game.player && imperium_self.doesPlanetHaveSpaceDock(planet) == 0) { return 1; } return 0;
              },
              function(planet) {
                imperium_self.addMove("produce\t"+imperium_self.game.player+"\t1\t"+imperium_self.game.planets[planet].idx+"\t"+"spacedock"+"\t"+imperium_self.game.planets[planet].sector);
                imperium_self.addMove("NOTIFY\t" + imperium_self.returnFaction(imperium_self.game.player) + " builds a Space Dock in " + imperium_self.game.sectors[imperium_self.game.planets[planet].sector].name);
                imperium_self.endTurn();
                return 0;
              },
              null
            );
	  }
	  return 0;
	}
    });



    this.importActionCard('trade-rider', {
  	name : "Trade Rider" ,
  	type : "rider" ,
  	text : "Select a planet and destroy all PDS units on that planet" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {

	  if (imperium_self.game.player == action_card_player) {

	    let active_agenda = imperium_self.returnActiveAgenda();

            let html  = 'On which choice do you wish to place your Trade rider?';
	    let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
	    let elect = imperium_self.agenda_cards[active_agenda].elect;
	    imperium_self.playerSelectChoice(html, choices, elect, function(choice) {
	      imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"trade-rider"+"\t"+choice);
	      imperium_self.endTurn();
	    });
	  }
 
 	  return 0;
	},
	playActionCardEvent(imperium_self, player, action_card_player, card) {
	  imperium_self.game.queue.push("purchase\t"+action_card_player+"\t"+"goods"+"\t"+5);
	  imperium_self.game.queue.push(returnFaction(imperium_self.game.player) + " gains 5 Trade Goods through their Trade Rider");
	  return 1;
	}
    });




    this.importActionCard('warfare-rider', {
  	name : "Warfare Rider" ,
  	type : "rider" ,
  	text : "Place a dreadnaught in a system with one of your ships: " ,
        playActionCard : function(imperium_self, player, action_card_player, card) {

          if (imperium_self.game.player == action_card_player) {

            let active_agenda = imperium_self.returnActiveAgenda();

            let msg  = 'On which choice do you wish to place your Warfare Rider?';
            let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
            let elect = imperium_self.agenda_cards[active_agenda].elect;
            imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
              imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"warfare-rider"+"\t"+choice);
              imperium_self.endTurn();
            });
          }

          return 0;
        },
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {

	  if (imperium_self.game.player == action_card_player) {

            imperium_self.playerSelectSectorWithFilter(
              "Select a sector which contains at least one of your ships: ",
              function(sector) {
                return imperium_self.doesSectorContainPlayerShips(action_card_player, sector);
              },
              function(sector) {

                imperium_self.addMove("produce\t"+imperium_self.game.player+"\t1\t-1\tdreadnaught\t"+sector);
                imperium_self.addMove("NOTIFY\tAdding dreadnaught to board");
                imperium_self.endTurn();
                return 0;

              },
              null
            );
          }
	  return 0;
	}
    });


    this.importActionCard('technology-rider', {
  	name : "Technology Rider" ,
  	type : "rider" ,
  	text : "Research a technology for free" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {

	  if (imperium_self.game.player == action_card_player) {

	    let active_agenda = imperium_self.returnActiveAgenda();

            let msg  = 'On which choice do you wish to place your Technology rider?';
	    let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
	    let elect = imperium_self.agenda_cards[active_agenda].elect;
	    imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
	      imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"technology-rider"+"\t"+choice);
	      imperium_self.endTurn();
	    });
	  }
 
 	  return 0;
	},
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {
	  if (imperium_self.game.player == action_card_player) {
	    imperium_self.playerResearchTechnology(function(tech) {
	      imperium_self.endTurn();
	    });
	  } 
 	  return 0;
	}
    });


    this.importActionCard('imperial-rider', {
  	name : "Imperial Rider" ,
  	type : "rider" ,
  	text : "Player gains 1 VP" ,
	playActionCard : function(imperium_self, player, action_card_player, card) {

	  if (imperium_self.game.player == action_card_player) {

	    let active_agenda = imperium_self.returnActiveAgenda();
	    let choices = imperium_self.agenda_cards[active_agenda].returnAgendaOptions(imperium_self);
	    let elect = imperium_self.agenda_cards[active_agenda].elect;

            let msg = 'On which choice do you wish to place the Imperial rider?';	
	    imperium_self.playerSelectChoice(msg, choices, elect, function(choice) {
	      imperium_self.addMove("rider\t"+imperium_self.game.player+"\t"+"imperial-rider"+"\t"+choice);
	      imperium_self.addMove("NOTIFY\t"+imperium_self.game.player+" has placed an Imperial Rider on "+choice);
	      imperium_self.endTurn();
	    });

	  }

	},
	playActionCardEvent : function(imperium_self, player, action_card_player, card) {
          imperium_self.game.players_info[action_card_player-1].vp += 1;
          imperium_self.game.players_info[action_card_player-1].objectives_scored.push("imperial-rider");
	  return 1;
	}
    });




