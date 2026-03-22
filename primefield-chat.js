(function () {
  // ============================================
  // PRIMEFIELD LTD CHATBOT CONFIGURATION
  // ============================================
  const CONFIG = {
    // IMPORTANT: Replace with your actual Vercel URL
    apiUrl: "https://primefield-bot.vercel.app/api/chat",

    botName: "PrimeField Assistant",
    welcomeMessage:
      "Welcome to PrimeField Ltd! 🐔🐟 I can help you with egg orders, catfish orders, diaspora delivery, pricing, and more. What would you like to know?",
    placeholder: "Ask about eggs, catfish, delivery...",
    poweredBy: "PrimeField Ltd AI Assistant",

    // Green & earthy colors for agriculture
    primaryColor: "#16A34A",
    primaryDark: "#15803D",
    headerBg: "linear-gradient(135deg, #16A34A, #0D9488)",
    btnBg: "linear-gradient(135deg, #16A34A, #0D9488)",

    quickQuestions: [
      "🥚 Egg prices?",
      "🐟 Catfish prices?",
      "🌍 Diaspora delivery?",
      "📞 How to order?",
    ],
  };

  // ============================================
  // STATE
  // ============================================
  let isOpen = false;
  let messages = [{ role: "assistant", content: CONFIG.welcomeMessage }];
  let isLoading = false;

  // ============================================
  // STYLES
  // ============================================
  const style = document.createElement("style");
  style.textContent = `
    #pf-chat-container * {
      margin: 0; padding: 0; box-sizing: border-box;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    #pf-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 64px; height: 64px; border-radius: 50%;
      background: ${CONFIG.btnBg};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(22, 163, 74, 0.4);
      transition: transform 0.3s, box-shadow 0.3s;
      animation: pf-pulse 3s infinite;
    }

    #pf-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 32px rgba(22, 163, 74, 0.5);
    }

    @keyframes pf-pulse {
      0%, 100% { box-shadow: 0 4px 24px rgba(22, 163, 74, 0.4); }
      50% { box-shadow: 0 4px 36px rgba(22, 163, 74, 0.7); }
    }

    #pf-chat-btn-icon {
      font-size: 28px; line-height: 1;
    }

    #pf-chat-btn-badge {
      position: absolute; top: -4px; right: -4px;
      width: 22px; height: 22px; background: #EF4444;
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 11px; color: white;
      font-weight: bold; border: 2px solid white;
    }

    #pf-chat-btn-tooltip {
      position: absolute; bottom: calc(100% + 12px); right: 0;
      background: white; color: #1a1a1a; font-size: 13px;
      font-weight: 600; padding: 8px 16px; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); white-space: nowrap;
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
    }

    #pf-chat-btn:hover #pf-chat-btn-tooltip { opacity: 1; }

    #pf-chat-btn-tooltip::after {
      content: ''; position: absolute; top: 100%; right: 24px;
      border: 6px solid transparent; border-top-color: white;
    }

    #pf-chat-window {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 390px; height: 560px;
      background: #0f1419; border-radius: 20px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.5);
      border: 1px solid #1e2a35;
      display: none; flex-direction: column; overflow: hidden;
      animation: pf-slideUp 0.3s ease;
    }

    @media (max-width: 480px) {
      #pf-chat-window {
        width: calc(100% - 32px); height: calc(100% - 100px);
        bottom: 16px; right: 16px; left: 16px;
      }
    }

    @keyframes pf-slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    #pf-chat-header {
      background: ${CONFIG.headerBg};
      padding: 18px 20px; display: flex; align-items: center;
      justify-content: space-between; flex-shrink: 0;
    }

    #pf-chat-header-left { display: flex; align-items: center; gap: 12px; }

    #pf-chat-header-avatar {
      width: 44px; height: 44px; background: rgba(255,255,255,0.2);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 24px;
    }

    #pf-chat-header h3 { color: white; font-size: 15px; font-weight: 700; }

    #pf-chat-header-status {
      display: flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.8); font-size: 12px;
    }

    #pf-chat-header-status .dot {
      width: 8px; height: 8px; background: #86EFAC;
      border-radius: 50%; animation: pf-blink 2s infinite;
    }

    @keyframes pf-blink {
      0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
    }

    #pf-chat-close {
      width: 34px; height: 34px; background: rgba(255,255,255,0.15);
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px; transition: background 0.3s;
    }

    #pf-chat-close:hover { background: rgba(255,255,255,0.25); }

    #pf-chat-messages {
      flex-grow: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 14px;
    }

    #pf-chat-messages::-webkit-scrollbar { width: 4px; }
    #pf-chat-messages::-webkit-scrollbar-thumb { background: #2a3a45; border-radius: 4px; }

    .pf-msg-row { display: flex; gap: 10px; align-items: flex-start; }
    .pf-msg-row.user { flex-direction: row-reverse; }

    .pf-msg-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }

    .pf-msg-avatar.bot { background: ${CONFIG.headerBg}; }
    .pf-msg-avatar.user { background: #1e3a5f; }

    .pf-msg-bubble {
      max-width: 75%; padding: 12px 16px; border-radius: 18px;
      font-size: 14px; line-height: 1.6; word-wrap: break-word;
    }

    .pf-msg-bubble.bot {
      background: #1a2730; color: #d4e0e8;
      border: 1px solid #253540; border-top-left-radius: 4px;
    }

    .pf-msg-bubble.user {
      background: ${CONFIG.primaryColor}; color: white;
      border-top-right-radius: 4px;
    }

    .pf-loading {
      display: flex; align-items: center; gap: 8px;
      color: #7a9aaa; font-size: 14px;
    }

    .pf-spinner {
      width: 18px; height: 18px; border: 2px solid #253540;
      border-top-color: ${CONFIG.primaryColor};
      border-radius: 50%; animation: pf-spin 0.8s linear infinite;
    }

    @keyframes pf-spin { to { transform: rotate(360deg); } }

    #pf-chat-quick {
      padding: 8px 16px 4px; display: flex; flex-wrap: wrap;
      gap: 8px; flex-shrink: 0;
    }

    .pf-quick-btn {
      background: #1a2730; border: 1px solid #253540;
      color: #8ab4c8; font-size: 12px; padding: 7px 14px;
      border-radius: 20px; cursor: pointer; transition: all 0.3s;
    }

    .pf-quick-btn:hover {
      background: #253540; color: white;
      border-color: ${CONFIG.primaryColor};
    }

    #pf-chat-input-area {
      padding: 14px 16px; border-top: 1px solid #1e2a35; flex-shrink: 0;
    }

    #pf-chat-input-wrap {
      display: flex; align-items: center; gap: 8px;
      background: #1a2730; border: 1px solid #253540;
      border-radius: 14px; padding: 4px 4px 4px 16px;
      transition: border-color 0.3s;
    }

    #pf-chat-input-wrap:focus-within { border-color: ${CONFIG.primaryColor}; }

    #pf-chat-input {
      flex-grow: 1; background: transparent; border: none;
      outline: none; color: white; font-size: 14px;
    }

    #pf-chat-input::placeholder { color: #4a6575; }
    #pf-chat-input:disabled { opacity: 0.5; }

    #pf-chat-send {
      width: 38px; height: 38px; background: ${CONFIG.primaryColor};
      border: none; border-radius: 10px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.3s; flex-shrink: 0;
    }

    #pf-chat-send:hover { background: ${CONFIG.primaryDark}; }
    #pf-chat-send:disabled { opacity: 0.3; cursor: not-allowed; }

    #pf-chat-send svg { width: 18px; height: 18px; fill: white; }

    #pf-chat-powered {
      text-align: center; color: #3a4f5f; font-size: 10px; padding-top: 8px;
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // CREATE CONTAINER
  // ============================================
  const container = document.createElement("div");
  container.id = "pf-chat-container";
  document.body.appendChild(container);

  // ============================================
  // SEND MESSAGE FUNCTION
  // ============================================
  async function sendMessage(text) {
    if (!text || !text.trim() || isLoading) return;

    messages.push({ role: "user", content: text.trim() });
    isLoading = true;
    render();

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(function (m) {
            return { role: m.role, content: m.content };
          }),
        }),
      });

      const data = await res.json();

      if (data.reply) {
        messages.push({ role: "assistant", content: data.reply });
      } else {
        messages.push({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again! 😊",
        });
      }
    } catch (err) {
      messages.push({
        role: "assistant",
        content: "Oops! I'm having trouble connecting. Please try again. 🔄",
      });
    }

    isLoading = false;
    render();
  }

  // ============================================
  // RENDER FUNCTION
  // ============================================
  function render() {
    container.innerHTML = "";

    // CLOSED STATE — Show button
    if (!isOpen) {
      var btn = document.createElement("button");
      btn.id = "pf-chat-btn";
      btn.innerHTML =
        '<span id="pf-chat-btn-icon">🐔</span>' +
        '<div id="pf-chat-btn-badge">1</div>' +
        '<div id="pf-chat-btn-tooltip">Chat with PrimeField Assistant 🐟</div>';
      btn.onclick = function () {
        isOpen = true;
        render();
      };
      container.appendChild(btn);
      return;
    }

    // OPEN STATE — Show chat window
    var win = document.createElement("div");
    win.id = "pf-chat-window";
    win.style.display = "flex";

    // Build quick questions HTML
    var quickHTML = "";
    if (messages.length <= 2) {
      quickHTML = '<div id="pf-chat-quick">';
      CONFIG.quickQuestions.forEach(function (q) {
        quickHTML +=
          '<button class="pf-quick-btn" data-q="' + q + '">' + q + "</button>";
      });
      quickHTML += "</div>";
    }

    win.innerHTML =
      '<div id="pf-chat-header">' +
      '  <div id="pf-chat-header-left">' +
      '    <div id="pf-chat-header-avatar">🌾</div>' +
      "    <div>" +
      "      <h3>" + CONFIG.botName + "</h3>" +
      '      <div id="pf-chat-header-status">' +
      '        <span class="dot"></span> Online — Ready to help' +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      '  <button id="pf-chat-close">✕</button>' +
      "</div>" +
      '<div id="pf-chat-messages"></div>' +
      quickHTML +
      '<div id="pf-chat-input-area">' +
      '  <div id="pf-chat-input-wrap">' +
      '    <input id="pf-chat-input" type="text" placeholder="' +
      CONFIG.placeholder +
      '"' +
      (isLoading ? " disabled" : "") +
      ">" +
      '    <button id="pf-chat-send"' +
      (isLoading ? " disabled" : "") +
      ">" +
      '      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      "    </button>" +
      "  </div>" +
      '  <div id="pf-chat-powered">' +
      CONFIG.poweredBy +
      "</div>" +
      "</div>";

    container.appendChild(win);

    // Render messages
    var msgBox = document.getElementById("pf-chat-messages");

    messages.forEach(function (msg) {
      var row = document.createElement("div");
      row.className = "pf-msg-row" + (msg.role === "user" ? " user" : "");
      row.innerHTML =
        '<div class="pf-msg-avatar ' +
        (msg.role === "user" ? "user" : "bot") +
        '">' +
        (msg.role === "user" ? "👤" : "🌾") +
        "</div>" +
        '<div class="pf-msg-bubble ' +
        (msg.role === "user" ? "user" : "bot") +
        '">' +
        msg.content +
        "</div>";
      msgBox.appendChild(row);
    });

    // Loading indicator
    if (isLoading) {
      var loadRow = document.createElement("div");
      loadRow.className = "pf-msg-row";
      loadRow.innerHTML =
        '<div class="pf-msg-avatar bot">🌾</div>' +
        '<div class="pf-msg-bubble bot">' +
        '  <div class="pf-loading">' +
        '    <div class="pf-spinner"></div> Thinking...' +
        "  </div>" +
        "</div>";
      msgBox.appendChild(loadRow);
    }

    // Scroll to bottom
    msgBox.scrollTop = msgBox.scrollHeight;

    // EVENT LISTENERS

    // Close button
    document.getElementById("pf-chat-close").onclick = function () {
      isOpen = false;
      render();
    };

    // Send button
    var input = document.getElementById("pf-chat-input");
    var sendBtn = document.getElementById("pf-chat-send");

    sendBtn.onclick = function () {
      sendMessage(input.value);
    };

    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage(input.value);
      }
    };

    // Quick question buttons
    document.querySelectorAll(".pf-quick-btn").forEach(function (qBtn) {
      qBtn.onclick = function () {
        sendMessage(qBtn.getAttribute("data-q"));
      };
    });

    // Focus input
    input.focus();
  }

  // ============================================
  // START
  // ============================================
  render();
})();