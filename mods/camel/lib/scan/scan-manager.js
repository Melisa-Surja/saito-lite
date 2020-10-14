const ScanManagerTemplate = require('./scan-manager.template');


module.exports = ScanManager = {

  render(app, data) {
    document.querySelector(".main").innerHTML = ScanManagerTemplate();

    this.generateQRCode("Hello World!");

  },

  //
  // test QR Code for scanning
  //
  generateQRCode(data) {
    try {
      const QRCode = require('../../../../lib/helpers/qrcode');
      return new QRCode(
        document.getElementById("qrcode"),
        data
      );
    } catch (err) {}
  },

  attachEvents(app, data) {

    let scanner_self = this;
    let qrscanner = app.modules.returnModule("QRScanner");
    try {
      document.querySelector('.launch-scanner').addEventListener('click', function(e) {
        qrscanner.startScanner(scanner_self.handleDecodedMessage);
      });
    } catch (err) {}

  },

  handleDecodedMessage(msg) {
    try {
      document.body.innerHTML = `This is the data in the QR Code: <p></p> ${msg} <p></p>In a production system, this could be a signed transaction which the receiver could broadcast onto the network, or sign themselves and then return to the originator.`;
    } catch (err) {
    }
  }

}
