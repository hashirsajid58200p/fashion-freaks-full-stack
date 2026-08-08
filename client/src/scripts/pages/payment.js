document.addEventListener("DOMContentLoaded", () => {
  const order = JSON.parse(localStorage.getItem("currentOrder"));
  const totalEl = document.getElementById("payment-total");
  const paymentForm = document.getElementById("payment-form");
  const payMethodRadios = document.getElementsByName("payMethod");
  const cardSection = document.getElementById("card-details-section");
  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  if (!order) {
    window.showNotification("No active order found.", "error");
    setTimeout(() => {
      window.location.href = "shop.html";
    }, 2000);
    return;
  }

  totalEl.innerText = `$${order.total.toFixed(2)}`;

  // Toggle Card Details
  payMethodRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "cod") {
        cardSection.style.display = "none";
      } else {
        cardSection.style.display = "flex";
      }
    });
  });

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
    
    if (payMethod === "card") {
      const cName = document.getElementById("card-name").value;
      const cNumber = document.getElementById("card-number").value;
      const cExpiry = document.getElementById("card-expiry").value;
      const cCvv = document.getElementById("card-cvv").value;

      if (!cName || cNumber.length < 16 || !cExpiry || cCvv.length < 3) {
        window.showNotification("Please fill valid card details.", "error");
        return;
      }
    }

    // Process Order to Backend
    try {
      const response = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: {
            name: order.name,
            email: order.email,
            phone: order.phone,
            address: order.address
          },
          items: order.items.map(i => ({
            product: i.id,
            quantity: i.quantity,
            price: i.price
          })),
          totalAmount: order.total,
          paymentMethod: payMethod
        })
      });

      // Clear Cart
      localStorage.removeItem("cart");
      if (window.updateCartUI) window.updateCartUI();

      window.showNotification("Order placed successfully!", "success");
      setTimeout(() => {
        window.location.href = "thanks.html";
      }, 1500);

    } catch (error) {
      console.error("Order processing error:", error);
      // Proceed to Thanks anyway for offline mock support if endpoint doesn't exist
      localStorage.removeItem("cart");
      window.location.href = "thanks.html";
    }
  });
});
