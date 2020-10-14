

    this.importStrategyCard("politics", {
      name     			:       "Politics",
      rank			:	3,
      img			:	"/strategy/POLITICS.png",
      text			:	"Pick a new Speaker. If New Byzantium is controlled vote on two agendas. Other players may spend a strategy token to purchase two action cards. ",
      strategyPrimaryEvent 	:	function(imperium_self, player, strategy_card_player) {

        if (imperium_self.game.player == player) {

          //
          // refresh votes --> total available
          //
          imperium_self.game.state.votes_available = [];
          imperium_self.game.state.votes_cast = [];
          imperium_self.game.state.how_voted_on_agenda = [];
          imperium_self.game.state.voted_on_agenda = [];
          imperium_self.game.state.voting_on_agenda = 0;

          for (let i = 0; i < imperium_self.game.players_info.length; i++) {
            imperium_self.game.state.votes_available.push(imperium_self.returnAvailableVotes(i+1));
            imperium_self.game.state.votes_cast.push(0);
            imperium_self.game.state.how_voted_on_agenda[i] = "abstain";
            imperium_self.game.state.voted_on_agenda[i] = [];
            //
            // add extra 0s to ensure flexibility if extra agendas added
            //
            for (let z = 0; z < imperium_self.game.state.agendas_per_round+2; z++) {
              imperium_self.game.state.voted_on_agenda[i].push(0);
            }
          }
        }

        //
        // card player goes for primary
        //
        if (imperium_self.game.player === strategy_card_player && player == strategy_card_player) {

          //
          // two action cards
          //
          imperium_self.addMove("resolve\tstrategy");
          imperium_self.addMove("gain\t2\t"+imperium_self.game.player+"\taction_cards"+"\t"+2);
          imperium_self.addMove("DEAL\t2\t"+imperium_self.game.player+"\t2");
          imperium_self.addMove("NOTIFY\tdealing action cards to " + imperium_self.returnFaction(player));
          imperium_self.addMove("strategy\t"+"politics"+"\t"+strategy_card_player+"\t2");
          imperium_self.addMove("resetconfirmsneeded\t"+imperium_self.game.players_info.length);

          //
          // pick the speaker
          //
          let factions = imperium_self.returnFactions();
          let html = 'Make which player the speaker? <ul>';
          for (let i = 0; i < imperium_self.game.players_info.length; i++) {
            html += '<li class="option" id="'+i+'">' + factions[imperium_self.game.players_info[i].faction].name + '</li>';
          }
          html += '</ul>';
          imperium_self.updateStatus(html);

          let chancellor = imperium_self.game.player;
          let selected_agendas = [];

          $('.option').off();
          $('.option').on('click', function() {

            let chancellor = (parseInt($(this).attr("id")) + 1);
            let laws = imperium_self.returnAgendaCards();
            let laws_selected = 0;

	    //
	    // if New Byzantium is unoccupied, we skip the voting stage
	    //
	    if (imperium_self.game.planets['new-byzantium'].owner == -1) {
	      imperium_self.playerAcknowledgeNotice("The Galactic Senate has yet to be established on New Byzantium. Occupy the planet to establish the Senate and earn 1 VP: ", function() {
                imperium_self.addMove("change_speaker\t"+chancellor);
		imperium_self.endTurn();
	      });
	      return 0;
	    }


            let html = '';
            if (imperium_self.game.state.agendas_per_round == 1) {
              html += 'Select one agenda to advance for consideration in the Galactic Senate.<ul>';
            }
            if (imperium_self.game.state.agendas_per_round == 2) {
              html += 'Select two agendas to advance for consideration in the Galactic Senate.<ul>';
            }
            if (imperium_self.game.state.agendas_per_round == 3) {
              html += 'Select three agendas to advance for consideration in the Galactic Senate.<ul>';
            }

            for (i = 0; i < 3 && i < imperium_self.game.state.agendas.length; i++) {
              html += '<li class="option" id="'+imperium_self.game.state.agendas[i]+'">' + laws[imperium_self.game.state.agendas[i]].name + '</li>';
            }
            html += '</ul>';

            imperium_self.updateStatus(html);

            $('.option').off();
            $('.option').on('mouseenter', function() { let s = $(this).attr("id"); imperium_self.showAgendaCard(s); });
            $('.option').on('mouseleave', function() { let s = $(this).attr("id"); imperium_self.hideAgendaCard(s); });
            $('.option').on('click', function() {

              laws_selected++;
              selected_agendas.push($(this).attr('id'));

              $(this).hide();
              imperium_self.hideAgendaCard(selected_agendas[selected_agendas.length-1]);

              if (laws_selected >= imperium_self.game.state.agendas_per_round) {
                for (i = 1; i >= 0; i--) {
                  imperium_self.addMove("resolve_agenda\t"+selected_agendas[i]);
                  imperium_self.addMove("post_agenda_stage_post\t"+selected_agendas[i]);
                  imperium_self.addMove("post_agenda_stage\t"+selected_agendas[i]);
                  imperium_self.addMove("agenda\t"+selected_agendas[i]+"\t"+i);
                  imperium_self.addMove("pre_agenda_stage_post\t"+selected_agendas[i]);
                  imperium_self.addMove("pre_agenda_stage\t"+selected_agendas[i]);
                  imperium_self.addMove("resetconfirmsneeded\t"+imperium_self.game.players_info.length);
                }
                imperium_self.addMove("change_speaker\t"+chancellor);
                imperium_self.endTurn();
              }
            });
          });
        }
      },

      strategySecondaryEvent 	:	function(imperium_self, player, strategy_card_player) {

        if (imperium_self.game.player == player) {
          if (imperium_self.game.player != strategy_card_player && imperium_self.game.players_info[player-1].strategy_tokens > 0) {
            imperium_self.playerBuyActionCards(2);
          } else {
            imperium_self.addMove("resolve\tstrategy\t1\t"+imperium_self.app.wallet.returnPublicKey());
            imperium_self.endTurn();
          }
        }
      },

    });



