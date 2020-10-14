module.exports = ChatBoxTemplate = (name="", group_id="") => {
  return `
    <div class="chat-box" id="chat-box-${group_id}">
      <div class="chat-box-header" id="chat-box-header-${group_id}">
        <span><h2 class="chat-box-header-title">${name}</h2></span>
        <span class="chat-box-close" id="chat-box-close-${group_id}" style="justify-self:end;font-size: 0.75em">&#x2715</span>
      </div>
      <div class="chat-box-main" id="chat-box-main-${group_id}">
      </div>
      <div class="chat-box-input" id="chat-box-input-${group_id}">
        <textarea class="chat-box-new-message-input" id="chat-box-new-message-input-${group_id}"></textarea>
        <div class="chat-room-submit-button" id="chat-room-submit-button-${group_id}"><i class="icon-small fas fa-arrow-circle-right"></i></div>
      </div>
    </div>
  `;
}

