document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const productsList = document.getElementById("checkout-products-list");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const totalEl = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");

  if (cart.length === 0) {
    window.showNotification("Your cart is empty. Redirecting to shop...", "info");
    setTimeout(() => {
      window.location.href = "shop.html";
    }, 2000);
    return;
  }

  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;
    
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";
    div.style.padding = "0.5rem";
    div.style.background = "var(--body-color)";
    div.style.borderRadius = "0.5rem";

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.3rem;" alt="${item.name}">
        <div>
          <h4 style="font-size: 1rem; color: var(--title-color);">${item.name}</h4>
          <span style="font-size: 0.8rem; color: var(--text-color);">Qty: ${item.quantity}</span>
        </div>
      </div>
      <span style="font-weight: bold; color: var(--first-color);">$${(item.price * item.quantity).toFixed(2)}</span>
    `;

    productsList.appendChild(div);
  });

  subtotalEl.innerText = `$${totalPrice.toFixed(2)}`;
  totalEl.innerText = `$${totalPrice.toFixed(2)}`;

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("checkout-name").value;
    const email = document.getElementById("checkout-email").value;
    const phone = document.getElementById("checkout-phone").value;
    const address = document.getElementById("checkout-address").value;

    const orderDetails = {
      name, email, phone, address,
      items: cart,
      total: totalPrice
    };

    localStorage.setItem("currentOrder", JSON.stringify(orderDetails));
    window.location.href = "payment.html";
  });
});
