/* Global Floating Notification Toast Utility */
window.showNotification = function(message, type = "info") {
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `notification-toast ${type}`;
  
  let icon = "fa-info-circle";
  if (type === "success") icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-triangle";

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) {
      container.remove();
    }
  }, 3000);
};

document.addEventListener("DOMContentLoaded", () => {
  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  if (headerPlaceholder) {
    fetch("../components/header.html")
      .then(res => res.text())
      .then(html => {
        headerPlaceholder.innerHTML = html;
        initHeader();
        if (window.applyThemeColors) window.applyThemeColors();
      });
  }

  if (footerPlaceholder) {
    fetch("../components/footer.html")
      .then(res => res.text())
      .then(html => {
        footerPlaceholder.innerHTML = html;
        if (window.applyThemeColors) window.applyThemeColors();
      });
  }

  function initHeader() {
    function scrollHeader() {
      const header = document.getElementById("header");
      if (window.scrollY >= 15) header.classList.add("scroll-header");
      else header.classList.remove("scroll-header");
    }
    window.addEventListener("scroll", scrollHeader);

    const cart = document.getElementById("cart"),
      cartShop = document.getElementById("cart-shop"),
      cartClose = document.getElementById("cart-close"),
      login = document.getElementById("login");

    if (cartShop) {
      cartShop.addEventListener("click", () => {
        cart.classList.toggle("show-cart");
        if (login) login.classList.remove("show-login");
      });
    }

    if (cartClose) {
      cartClose.addEventListener("click", () => {
        cart.classList.remove("show-cart");
      });
    }

    const loginToggel = document.getElementById("login-toggle"),
      loginClose = document.getElementById("login-close");

    if (loginToggel) {
      loginToggel.addEventListener("click", () => {
        login.classList.toggle("show-login");
        if (cart) cart.classList.remove("show-cart");
      });
    }

    if (loginClose) {
      loginClose.addEventListener("click", () => {
        login.classList.remove("show-login");
      });
    }

    const nav = document.getElementById("nav-items"),
      navToggel = document.getElementById("nav-toggle"),
      iconToggel = document.getElementById("icon-toggel");

    if (navToggel) {
      navToggel.addEventListener("click", () => {
        if (nav) nav.classList.toggle("nav-show");
        if (iconToggel) iconToggel.classList.toggle("fa-times");
      });
    }

    // Dynamic Cart Mapping Logic
    function updateCartUI() {
      const cartContainer = document.querySelector(".cart-container");
      const cartPricesItem = document.querySelector(".cart-prices-item");
      const cartPricesTotal = document.querySelector(".cart-prices-total");

      if (!cartContainer) return;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cartContainer.innerHTML = "";

      const badge = document.getElementById("cart-count-badge");

      if (cart.length === 0) {
        cartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--text-color);">Your cart is empty.</p>`;
        if (cartPricesItem) cartPricesItem.innerText = "0 Items";
        if (cartPricesTotal) cartPricesTotal.innerText = "$0";
        if (badge) {
          badge.style.display = "none";
          badge.innerText = "0";
        }
        return;
      }


      let totalItems = 0;
      let totalPrice = 0;

      cart.forEach((item, index) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const article = document.createElement("article");
        article.className = "cart-card";
        article.innerHTML = `
          <div class="cart-box"><img class="cart-img" src="${item.image}" alt="${item.name}" /></div>
          <div class="cart-details">
            <h3 class="cart-title-center">${item.name}</h3>
            <span class="cart-price">$${item.price}</span>
            <div class="cart-amount">
              <div class="cart-amount-content">
                <span class="cart-amount-box minus-btn" data-index="${index}"><i class="fas fa-minus"></i></span>
                <span class="card-amount-number">${item.quantity}</span>
                <span class="cart-amount-box plus-btn" data-index="${index}"><i class="fas fa-plus"></i></span>
              </div>
              <i class="fas fa-trash cart-amount-trash trash-btn" data-index="${index}"></i>
            </div>
          </div>
        `;
        cartContainer.appendChild(article);
      });

      if (cartPricesItem) cartPricesItem.innerText = `${totalItems} Item${totalItems > 1 ? 's' : ''}`;
      if (cartPricesTotal) cartPricesTotal.innerText = `$${totalPrice.toFixed(2)}`;
      
      if (badge) {
        badge.style.display = "flex";
        badge.innerText = totalItems;
      }


      // Bind Increments / Decrements
      cartContainer.querySelectorAll(".minus-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
          } else {
            cart.splice(idx, 1);
          }
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });

      cartContainer.querySelectorAll(".plus-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          cart[idx].quantity += 1;
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });

      cartContainer.querySelectorAll(".trash-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = btn.getAttribute("data-index");
          cart.splice(idx, 1);
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartUI();
        });
      });
    }

    window.updateCartUI = updateCartUI;
    updateCartUI();

    // Dynamic Active Nav Link Logic
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");
    
    let matched = false;
    navLinks.forEach(link => {
      link.classList.remove("active-link");
      const href = link.getAttribute("href");
      if (href && currentPath.includes(href)) {
        link.classList.add("active-link");
        matched = true;
      }
    });
    
    if (!matched && navLinks.length > 0) {
      // Default to Home if no match (like root index path)
      const homeLink = Array.from(navLinks).find(el => el.getAttribute("href") === "index.html");
      if (homeLink) homeLink.classList.add("active-link");
    }

    themesColors();

  }

  function showScrollUp() {
    const scrollUpBtn = document.getElementById("scroll-up");
    if (window.scrollY >= 350) scrollUpBtn.classList.add("show-scroll");
    else scrollUpBtn.classList.remove("show-scroll");
  }
  window.addEventListener("scroll", showScrollUp);

  const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
  if (styleSwitcherToggle) {
    styleSwitcherToggle.addEventListener("click", () => {
      document.querySelector(".style-switcher").classList.toggle("open");
    });
  }

  window.addEventListener("scroll", () => {
    const switcher = document.querySelector(".style-switcher");
    if (switcher && switcher.classList.contains("open")) {
      switcher.classList.remove("open");
    }
  });

  function setColors() {
    const color = localStorage.getItem("color") || "color-2";
    document.documentElement.setAttribute("data-theme", color);

    const logoImg = document.querySelector(".nav-logo-img");
    const footerLogoImg = document.querySelector(".footer-logo-img");
    const logoMap = {
      "color-1": "logo-red.png",
      "color-2": "logo-purple.png",
      "color-3": "logo-pink.png",
      "color-4": "logo-lavender.png",
      "color-5": "logo-orange.png"
    };

    if (logoImg) {
      logoImg.src = `../../public/images/logos/${logoMap[color]}`;
    }
    if (footerLogoImg) {
      footerLogoImg.src = `../../public/images/logos/${logoMap[color]}`;
    }

    if (document.querySelector(".js-theme-color-item.active")) {
      document.querySelector(".js-theme-color-item.active").classList.remove("active");
    }
    const activeBtn = document.querySelector(`[data-js-themes-color="${color}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }

  window.applyThemeColors = setColors;

  function themesColors() {
    const themesColorsContainer = document.querySelector(".js-theme-colors");
    if (!themesColorsContainer) return;

    themesColorsContainer.addEventListener("click", ({ target }) => {
      if (target.classList.contains("js-theme-color-item")) {
        localStorage.setItem(
          "color",
          target.getAttribute("data-js-themes-color"),
        );
        setColors();
      }
    });

    setColors();
  }

  themesColors();

  // --------------------- AI Chatbot Widget ---------------------
  function initAIChatbot() {
    const chatbotBtn = document.createElement("div");
    chatbotBtn.id = "ai-chatbot-btn";
    chatbotBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
    chatbotBtn.style.cssText = `
      position: fixed; 
      bottom: 2rem; 
      right: 2rem; 
      width: 60px; 
      height: 60px; 
      background-color: var(--first-color); 
      color: white; 
      border-radius: 50%; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      font-size: 1.8rem; 
      cursor: pointer; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
      z-index: 9000; 
      transition: 0.3s;
    `;

    const chatbotStyle = document.createElement("style");
    chatbotStyle.textContent = `
      #ai-chatbot-send:hover {
        opacity: 0.92;
        transform: scale(1.05);
      }
      #ai-chatbot-send:active {
        transform: scale(0.95);
      }
      @media (max-width: 480px) {
        #ai-chatbot-window {
          right: 1rem !important;
          bottom: 5.5rem !important;
          width: calc(100vw - 2rem) !important;
          max-width: 100% !important;
          height: 75vh !important;
        }
        #ai-chatbot-btn {
          right: 1rem !important;
          bottom: 1rem !important;
          width: 52px !important;
          height: 52px !important;
        }
      }
    `;
    document.head.appendChild(chatbotStyle);

    const chatbotWindow = document.createElement("div");
    chatbotWindow.id = "ai-chatbot-window";
    chatbotWindow.style.cssText = `
      display: none; 
      flex-direction: column; 
      position: fixed; 
      bottom: 6.5rem; 
      right: 2rem; 
      width: 350px; 
      max-width: calc(100vw - 2.5rem);
      max-height: calc(100vh - 8rem);
      height: 460px; 
      background-color: var(--con-color); 
      border-radius: 1rem; 
      box-shadow: 0 8px 30px var(--shadow); 
      border: 1px solid var(--body-color); 
      z-index: 9000; 
      overflow: hidden;
      box-sizing: border-box;
    `;
    chatbotWindow.innerHTML = `
      <div style="background-color: var(--first-color); color: white; padding: 1rem 1.2rem; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <img src="../../public/images/logos/logo-red.png" style="width: 26px; height: 26px; border-radius: 50%; background: white; object-fit: contain;" onerror="this.style.display='none'" />
          <span style="font-weight: bold; font-size: 1rem;">Fashion Freaks AI</span>
        </div>
        <i class="fas fa-times" id="ai-chatbot-close" style="cursor: pointer; font-size: 1.2rem; padding: 0.2rem;"></i>
      </div>
      
      <div id="ai-chatbot-messages" style="flex: 1; padding: 1.2rem 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.85rem; color: var(--text-color); box-sizing: border-box;">
        <div style="background: var(--body-color); padding: 0.7rem 0.9rem; border-radius: 0.6rem; align-self: flex-start; max-width: 85%; box-shadow: 0 2px 5px var(--shadow); line-height: 1.4;">
          Welcome to Fashion Freaks! How can I assist you with your styles today?
        </div>
      </div>
      
      <div style="padding: 0.75rem 0.9rem; background: var(--body-color); display: flex; align-items: center; gap: 0.6rem; border-top: 1px solid var(--con-color); box-sizing: border-box; width: 100%;">
        <input type="text" id="ai-chatbot-input" placeholder="Ask me anything..." style="flex: 1; min-width: 0; padding: 0.65rem 0.85rem; font-size: 0.85rem; border-radius: 0.5rem; border: 1px solid var(--first-color); background: var(--con-color); color: var(--text-color); outline: none; box-sizing: border-box; font-family: inherit;">
        <button id="ai-chatbot-send" style="background: var(--first-color); color: white; border: none; padding: 0 1.1rem; height: 38px; border-radius: 0.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; box-sizing: border-box;" aria-label="Send Message"><i class="fas fa-paper-plane" style="font-size: 0.9rem;"></i></button>
      </div>
    `;

    document.body.appendChild(chatbotBtn);
    document.body.appendChild(chatbotWindow);

    // Shift other elements UP and center them with chatbot
    const switcher = document.querySelector(".style-switcher");
    const scroller = document.querySelector(".scroll-up, .scrollup, #scroll-up");
    
    if (switcher) {
      switcher.style.bottom = "8.5rem";
      const sIcon = switcher.querySelector(".s-icon");
      if (sIcon) {
        sIcon.style.marginRight = "calc(2rem + 10px)";
      }
    }
    if (scroller) {
      scroller.style.bottom = "13.5rem";
      scroller.style.right = "calc(2rem + 10px)";
      scroller.style.width = "40px";
      scroller.style.height = "40px";
      scroller.style.display = "none";
      scroller.style.justifyContent = "center";
      scroller.style.alignItems = "center";
      scroller.style.borderRadius = "50%";
      
      window.addEventListener("scroll", () => {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollTotal > 0 && (window.scrollY / scrollTotal) >= 0.6) {
          scroller.style.display = "flex";
        } else {
          scroller.style.display = "none";
        }
      });
    }

    // Toggle functionality
    chatbotBtn.addEventListener("click", () => {
      if (chatbotWindow.style.display === "none") {
        chatbotWindow.style.display = "flex";
        chatbotBtn.style.transform = "scale(0.9)";
      } else {
        chatbotWindow.style.display = "none";
        chatbotBtn.style.transform = "scale(1)";
      }
    });

    const closeBtn = chatbotWindow.querySelector("#ai-chatbot-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        chatbotWindow.style.display = "none";
        chatbotBtn.style.transform = "scale(1)";
      });
    }

    const inputField = chatbotWindow.querySelector("#ai-chatbot-input");
    const sendBtn = chatbotWindow.querySelector("#ai-chatbot-send");
    const msgContainer = chatbotWindow.querySelector("#ai-chatbot-messages");

    let chatHistory = [];

    async function handleSend() {
      const text = inputField.value.trim();
      if (!text) return;
      inputField.value = "";

      // User Message
      const userDiv = document.createElement("div");
      userDiv.style.cssText = "background: var(--first-color); color: white; padding: 0.6rem 0.8rem; border-radius: 0.5rem; align-self: flex-end; max-width: 85%; box-shadow: 0 2px 5px rgba(0,0,0,0.1);";
      userDiv.innerText = text;
      msgContainer.appendChild(userDiv);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      chatHistory.push({ role: "user", content: text });

      // Typing Indicator
      const typingDiv = document.createElement("div");
      typingDiv.style.cssText = "background: var(--body-color); padding: 0.6rem 0.8rem; border-radius: 0.5rem; align-self: flex-start; max-width: 85%; font-style: italic; opacity: 0.8;";
      typingDiv.innerText = "Thinking...";
      msgContainer.appendChild(typingDiv);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      try {
        const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";
        const res = await fetch(`${API_URL}/chatbot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatHistory })
        });
        
        const data = await res.json();
        typingDiv.remove();

        const aiDiv = document.createElement("div");
        aiDiv.style.cssText = "background: var(--body-color); padding: 0.6rem 0.8rem; border-radius: 0.5rem; align-self: flex-start; max-width: 85%; box-shadow: 0 2px 5px var(--shadow);";
        
        if (data.response) {
          aiDiv.innerText = data.response;
          chatHistory.push({ role: "assistant", content: data.response });
        } else {
          aiDiv.innerText = "Sorry, I'm unable to respond right now.";
        }

        msgContainer.appendChild(aiDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      } catch (err) {
        typingDiv.remove();
        const errDiv = document.createElement("div");
        errDiv.style.cssText = "background: var(--body-color); color: #e74c3c; padding: 0.6rem 0.8rem; border-radius: 0.5rem; align-self: flex-start; max-width: 85%;";
        errDiv.innerText = "Connection lost. Please retry.";
        msgContainer.appendChild(errDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    }

    sendBtn.addEventListener("click", handleSend);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });
  }
  initAIChatbot();
});


