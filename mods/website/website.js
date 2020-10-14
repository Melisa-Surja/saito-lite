var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const Header = require('../../lib/ui/header/header');
const Data = require('./lib/data');
const elParser = require('../../lib/helpers/el_parser');


class Website extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Website";
    this.description    = "Adds the front-page Saito website to core Saito servers";
    this.categories     = "Core Web Dev"; 

    this.description = "Module that creates a root website on a Saito node.";
    this.categories  = "Utilities Communications";


    return this;
  }


/*
  initialize(app){

    x = this.app.modules.respondTo("email-chat");
    for (let i = 0; i < x.length; i++) {
      this.mods.push(x[i]);
    }
  }
*/

  initializeHTML(app) {

    super.initializeHTML(app);

    Header.render(app, this.uidata);
    Header.attachEvents(app, this.uidata);

    Data.render(app);

    this.app.modules.respondTo("chat-manager").forEach(mod => {
      mod.respondTo('chat-manager').render(this.app, this);
    });

    var html = `
    <a class="header-icon-fullscreen tip" target="_blank" href="https://org.saito.tech/blog">
    <i id="blog" class="header-icon icon-med fas fa-rss-square">
    <div class="redicon"></div></i>
    <div class="tiptext headertip">Saito Blog</div>
    </a>
    `;
    var iconlist = document.querySelector('.header-icon-links');
    iconlist.insertBefore(elParser(html), iconlist.firstChild);
    
  }

  onConfirmation(blk, tx, conf, app) {
    if(this.browser_active == 1){
      try {
        if (document.querySelector('.netstats')) {
          Data.render(app)
        }
      } catch(err) {
        console.error(err);
      }
    }
  }

  shouldAffixCallbackToModule() { return 1; }

}



module.exports = Website;
