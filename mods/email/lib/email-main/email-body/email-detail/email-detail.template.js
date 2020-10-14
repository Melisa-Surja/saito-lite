
module.exports = EmailDetailTemplate = (app, data) => {
  let { selected_email, addrController }  = data.email;
  let { datetime_formatter } = data.helpers;

  let from  	= selected_email.transaction.from[0].add;
  let to  	= selected_email.transaction.to[0].add;
  let ts  	= selected_email.transaction.ts;
  let message	= selected_email.returnMessage();
  let subject   = message.title;

  let hr_from = addrController.returnAddressHTML(from);
  let hr_to   = addrController.returnAddressHTML(to);

  if (hr_from != "") { from = hr_from; }
  if (hr_to != "")   { to   = hr_to; }

  let datetime = datetime_formatter(ts);

  return `
    <div>
      <div class="email-detail-addresses">
        <div>
          <h4 class="email-detail-subject">${subject}</h4>
        </div>
        <div class="email-detail-address-row">
          <p>FROM:</p>
          <p class="email-detail-address-id">${from}</p>
        </div>
        <div class="email-detail-address-row">
          <p>TO:</p>
          <p class="email-detail-address-id">${to}</p>
        </div>
      </div>
      <div class="email-detail-message">
        <p class="email-detail-timestamp">${datetime.hours}:${datetime.minutes}</p>
        <div class="email-detail-text"><div>${message.message}</div></div>
      </div>
    </div>
  `;

}
