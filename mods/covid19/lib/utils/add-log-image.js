const AddLogImageTemplate = require('./add-log-photo.template');

module.exports = AddLogImage = {

  async render(app, data) {

    document.querySelector('.footer').innerHTML += AddLogImageTemplate();

    data.covid19.returnFormFromPragma("covid19", "log", function(res) {
      document.querySelector('.modal-form').innerHTML = res;

      document.getElementById('ts').value = new Date().getTime();
      data.covid19.treatHide(document.getElementById('ts'));
      
      document.getElementById('author').value = app.wallet.returnPublicKey();
      data.covid19.treatHide(document.getElementById('author'));
      
      document.getElementById('order_id').value = data.order_id;
      data.covid19.treatHide(document.getElementById('order_id'));
      
      if(data.covid19.isAdmin()){
        data.covid19.treatBoolean(document.getElementById('public'));
      } else {
        data.covid19.treatHide(document.getElementById('public'));
      }

      
      document.getElementById('type').value = 'photo';
      data.covid19.treatHide(document.getElementById('type'));
      
      data.covid19.treatMobilePhoto(document.getElementById('body'));
      document.getElementById('body').parentElement.previousElementSibling.innerHTML = "Image";
      
    });
    
   
  },

  attachEvents(app, data) {
       
    document.getElementById('add-log').addEventListener('click', (e) => {
      data.covid19.submitForm(document.querySelector('.modal-form'));
      document.querySelector('.log-template').destroy();
      UpdateSuccess.render(app, data);
      UpdateSuccess.attachEvents(app, data);
    });

    document.getElementById('cancel-log').addEventListener('click', (e) => {
     document.querySelector('.log-template').destroy();
    });

  }
}