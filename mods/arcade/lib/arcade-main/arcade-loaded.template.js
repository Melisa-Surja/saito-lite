module.exports = ArcadeLoadedTemplate = (game_id) => {
  return `
      <div class="arcade-initialize-game-container">
        <center>Your game is ready to start!</center>
        <button class="start-game-btn" id="${game_id}">start game</button>
        <!--center><div id="status" class="status"></div></center-->
      </div>
  `;
}
