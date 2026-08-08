document.addEventListener("DOMContentLoaded", () => {
  const shopItemsContainer = document.getElementById("shop-items-container");
  const paginationContainer = document.getElementById("pagination-container");

  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const itemsPerPage = 8;
  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  async function loadShopSkeletons() {
    try {
      if (!shopItemsContainer) return;
      const res = await fetch("../components/skeletonAnimation.html");
      const textHTML = await res.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(textHTML, 'text/html');
      const cardSkel = doc.getElementById('card-skeleton').innerHTML;
      
      shopItemsContainer.innerHTML = cardSkel.repeat(8);
    } catch (e) {
      console.error("Skeleton fetch error:", e);
    }
  }
  loadShopSkeletons();

  async function fetchProducts() {
    try {
      const response = await fetch(`${API_URL}/products/all`);
      if (!response.ok) throw new Error("Network response error");
      
      allProducts = await response.json();
      applyFilters(); 
    } catch (error) {
      console.error("Fetch Products Error:", error);
      if (shopItemsContainer) {
        shopItemsContainer.innerHTML = `<p class="error-message" style="grid-column: 1/-1; text-align: center; color: var(--first-color); margin-top: 2rem;">Unable to load products at the moment.</p>`;
      }
    }
  }

  function applyFilters() {
    const selectedConditions = Array.from(document.querySelectorAll('.filter-condition:checked')).map(el => el.value);
    const selectedSizes = Array.from(document.querySelectorAll('.filter-size:checked')).map(el => el.value);
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked')).map(el => el.value);

    filteredProducts = allProducts.filter(product => {
      const conditionMatch = selectedConditions.length === 0 || selectedConditions.includes(product.condition);
      const sizeMatch = selectedSizes.length === 0 || (product.sizes && product.sizes.some(size => selectedSizes.includes(size)));
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);

      return conditionMatch && sizeMatch && categoryMatch;
    });

    currentPage = 1;
    renderProducts();
  }

  function renderProducts() {
    if (!shopItemsContainer) return;

    shopItemsContainer.innerHTML = ""; 

    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

    if (paginatedItems.length === 0) {
      shopItemsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-color); margin-top: 2rem;">No products match your filter preferences.</p>`;
      renderPagination();
      return;
    }

    paginatedItems.forEach(product => {
      const card = document.createElement("div");
      card.className = "shop-content";

      let badgeHTML = "";
      if (product.condition === "New" || product.condition === "Sale") {
        badgeHTML = `<div class="tag">${product.condition}</div>`;
      }

      const imageUrl = (product.images && product.images.length > 0) 
        ? product.images[0].url 
        : "../../public/images/azure-button-down-shirt.png";

      let oldPriceHTML = "";
      if (product.oldPrice) {
        oldPriceHTML = `<span class="shop-discount">$${product.oldPrice}</span>`;
      }

      card.innerHTML = `
        ${badgeHTML}
        <a href="details.html?id=${product._id}">
          <img class="shop-img" src="${imageUrl}" alt="${product.name}">
        </a>
        <h3 class="shop-title"><a href="details.html?id=${product._id}" style="color: inherit;">${product.name}</a></h3>
        <span class="shop-subtitle">${product.subCategory}</span>
        <div class="shop-prices">
            <span class="shop-price">$${product.price}</span>
            ${oldPriceHTML}
        </div>
        <a class="button shop-button add-to-cart-btn" href="#" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">
            <i class="fas fa-shopping-cart shop-icon"></i>
        </a>
      `;

      shopItemsContainer.appendChild(card);
    });

    setupAddToCartListeners();
    renderPagination();
  }

  function renderPagination() {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (totalPages <= 1) return;

    const prevBtn = document.createElement("i");
    prevBtn.className = "fas fa-chevron-left";
    prevBtn.style.cursor = "pointer";
    prevBtn.style.margin = "0 0.5rem";
    prevBtn.style.color = currentPage > 1 ? "var(--first-color)" : "#ccc";
    if (currentPage > 1) {
      prevBtn.addEventListener("click", () => {
        currentPage -= 1;
        renderProducts();
      });
    }
    paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("span");
      pageBtn.innerText = i;
      pageBtn.style.cursor = "pointer";
      pageBtn.style.margin = "0 0.25rem";
      pageBtn.style.width = "35px";
      pageBtn.style.height = "35px";
      pageBtn.style.display = "inline-flex";
      pageBtn.style.justifyContent = "center";
      pageBtn.style.alignItems = "center";
      pageBtn.style.borderRadius = "0.3rem";
      
      if (i === currentPage) {
        pageBtn.style.background = "var(--first-color)";
        pageBtn.style.color = "#fff";
        pageBtn.style.fontWeight = "bold";
      } else {
        pageBtn.style.color = "var(--text-color)";
      }

      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderProducts();
      });

      paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("i");
    nextBtn.className = "fas fa-chevron-right";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.margin = "0 0.5rem";
    nextBtn.style.color = currentPage < totalPages ? "var(--first-color)" : "#ccc";
    if (currentPage < totalPages) {
      nextBtn.addEventListener("click", () => {
        currentPage += 1;
        renderProducts();
      });
    }
    paginationContainer.appendChild(nextBtn);
  }

  function setupAddToCartListeners() {
    const cartBtns = document.querySelectorAll(".add-to-cart-btn");
    cartBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-id");
        const name = btn.getAttribute("data-name");
        const price = parseFloat(btn.getAttribute("data-price"));
        const image = btn.getAttribute("data-image");

        addToCart({ id, name, price, image });
      });
    });
  }

  function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      item.quantity = 1;
      cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.showNotification(`${item.name} added to cart!`, "success");
    
    if (window.updateCartUI) {
      window.updateCartUI();
    }
  }

  const filters = document.querySelectorAll('.sidebar input[type="checkbox"]');
  filters.forEach(f => f.addEventListener('change', applyFilters));

  fetchProducts();
});
