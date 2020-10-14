module.exports = ArcadeGameListRowTemplate = (app, tx, button_map) => {

  let { sig, from, to } = tx.transaction;
  let msg = tx.msg;
  let { players_array, options_html, game } = msg;
  let txmsg = tx.returnMessage();

  let players_needed = 2;
  let players = txmsg.players;
  if (txmsg.players_needed > 2) { players_needed = txmsg.players_needed; }

  if (options_html == undefined) { options_html = ""; }
  if (txmsg.over == 1) { options_html = "Opponent Resigned"; }

  let publickeys = players;

  let added_identicons = [];
  let identicons = "";

  for (let i = 0; i < publickeys.length; i++) {
    if (!added_identicons.includes(publickeys[i])) {
      identicons += `<span class="tip"><img class="identicon" src="${app.keys.returnIdenticon(publickeys[i])}"><div class="tiptext">${app.keys.returnIdentifierByPublicKey(publickeys[i], true)}</div></span>`;
      added_identicons.push(publickeys[i]);
    }
  }


  var button_html = Object.entries(button_map).map(([key, value]) => {
    return `
    <input style="display: var(--saito-wu);" id="arcade-game-${key}-row-${sig}-pass" type="text"></input>
    <button class="arcade-game-row-${key}" id="arcade-game-${key}-row-${sig}">${value}</button>`
  }).join('');

  return `
    <div class="arcade-game-invitation" id="arcade-game-${sig}">
      <div class="arcade-game-row-name" id="arcade-game-name-${sig}">${game}</div>
      <div class="arcade-game-row-avi">${identicons}</div>
      <div class="arcade-game-row-options" id="arcade-game-options-${sig}">
      <div class="game-options-html">${options_html}</div>
      </div>

      <div class="arcade-game-row-buttons">
        ${button_html}
      </div>
    </div>
  `;

}
