const ModalRegisterUsernameTemplate = require('./modal-register-username.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class ModalRegisterUsername {

    constructor(app) {
      this.app = app;
    }

    render(app, mod) {

      mod.modal_overlay = new SaitoOverlay(app);
      mod.modal_overlay.render(app, mod);
      mod.modal_overlay.attachEvents(app, mod);

      if (!document.querySelector(".add-user")) { 
	mod.modal_overlay.showOverlay(app, mod, ModalRegisterUsernameTemplate());
      }

    }

    attachEvents(app, mod) {

      document.querySelector('.username-registry-input').select();
      document.querySelector('.username-registry-input').setAttribute("placeholder", "");
      document.querySelector('.tutorial-skip').onclick = () => { mod.modal_overlay.hideOverlay(); }
      document.querySelector('#registry-modal-button').onclick = () => {

        //check identifier taken
        var identifier = document.querySelector('#registry-input').value;
        var hp = document.querySelector('#name').value;

        if (hp == "") {
          app.modules.returnActiveModule().sendPeerDatabaseRequestWithFilter(
                
                "Registry" ,
                
                `SELECT * FROM records WHERE identifier = "${identifier}@saito"`,
                
                (res) => {
                  if (res.rows) {
                    if (res.rows.length > 0) {
                      salert("Identifier already in use. Please select another");
                      return;
                    } else {
                      let register_mod = app.modules.returnModule("Registry");
                      if (register_mod) {
                        let register_success = app.modules.returnModule('Registry').registerIdentifier(identifier);
                        if (register_success) {
                          salert("Registering " + identifier + "@saito");
                          mod.modal_overlay.hideOverlay();
                        } else {
                          salert("Error 411413: Error Registering Username");
                        }
                      }
                    }
                  }
                }
        );
      }
    }
  }
}

module.exports = ModalRegisterUsername

