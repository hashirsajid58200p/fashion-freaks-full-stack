document.addEventListener("DOMContentLoaded", () => {
  const order = JSON.parse(localStorage.getItem("currentOrder"));

  if (!order) {
    // Redirect if someone tries to access page ad-hoc
    window.location.href = "shop.html";
    return;
  }

  document.getElementById("receipt-name").innerText = order.name || "Guest Customer";
  document.getElementById("receipt-email").innerText = order.email || "N/A";
  document.getElementById("receipt-phone").innerText = order.phone || "N/A";
  document.getElementById("receipt-address").innerText = order.address || "N/A";
  document.getElementById("receipt-total").innerText = `$${parseFloat(order.total).toFixed(2)}`;

  const itemsContainer = document.getElementById("receipt-items");
  if (itemsContainer && order.items) {
    order.items.forEach(item => {
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";
      div.style.padding = "0.5rem";
      div.style.background = "var(--con-color)";
      div.style.borderRadius = "0.3rem";

      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 0.2rem;">
          <div>
            <span style="color: var(--title-color); font-weight: bold;">${item.name}</span>
            <br>
            <small style="color: var(--text-color);">Qty: ${item.quantity}</small>
          </div>
        </div>
        <span style="color: var(--first-color); font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      itemsContainer.appendChild(div);
    });
  }

  // Optionally clear current order after receipt display
  // localStorage.removeItem("currentOrder");
});
