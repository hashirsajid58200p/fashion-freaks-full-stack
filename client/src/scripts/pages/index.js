document.addEventListener("DOMContentLoaded", () => {
  const newArrivalsContainer = document.getElementById("real-new-arrivals-container");

  const heroSliderContainer = document.getElementById("real-hero-slider-container");

  async function loadSkeletons() {
    try {
      const res = await fetch("../components/skeletonAnimation.html");
      const textHTML = await res.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(textHTML, 'text/html');
      
      const heroSkel = doc.getElementById('hero-skeleton').innerHTML;
      const cardSkel = doc.getElementById('card-skeleton').innerHTML;
      
      if (heroSliderContainer) heroSliderContainer.innerHTML = `<section class="swiper-slide">${heroSkel}</section>`;
      
      if (newArrivalsContainer) {
        newArrivalsContainer.innerHTML = cardSkel + cardSkel + cardSkel + cardSkel;
      }
    } catch (e) {
      console.error("Skeleton fetch error:", e);
    }
  }
  loadSkeletons();




  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  async function fetchHomeData() {
    try {
      const response = await fetch(`${API_URL}/products/all`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      
      renderHero(products);
      renderNewArrivals(products);
    } catch (error) {
      console.error("Fetch Home Data Error:", error);
    }
  }

  function renderHero(products) {
    if (!heroSliderContainer) return;

    heroSliderContainer.innerHTML = "";
    let heroProducts = products.filter(p => 
      p.name.toLowerCase().includes("crimson storm")
    );

    const others = products.filter(p => 
      !p.name.toLowerCase().includes("crimson storm") && 
      !p.name.toLowerCase().includes("navy")
    );

    heroProducts = [...heroProducts, ...others].slice(0, 3);


    if (heroProducts.length === 0) {
      heroSliderContainer.innerHTML = `<p style="text-align: center; color: white;">No featured products found.</p>`;
      return;
    }

    heroProducts.forEach((product, index) => {
      const slide = document.createElement("section");
      slide.className = "swiper-slide";

      const imageUrl = (product.images && product.images.length > 0) 
        ? product.images[0].url 
        : "../../public/images/azure-button-down-shirt.png";

      slide.innerHTML = `
        <div class="home-content grid">
          <div class="home-group">
            <img class="home-img" src="${imageUrl}" alt="${product.name}" />


          </div>
          <div class="home-data">
            <h3 class="home-subtitle">#${index + 1} TRENDING ITEM</h3>
            <h1 class="home-title">
              ${product.condition === 'Sale' ? 'SALE 20% <br /> OFF ON <br /> THIS ITEM' : 'ORIGINAL <br /> IS NEVER <br /> FINISHED!!'}
            </h1>
            <p class="home-disc">
              ${product.description}
            </p>
            <div class="home-buttons">
              <a href="shop.html" class="button">Buy Now!</a>
            </div>
          </div>
        </div>
      `;
      heroSliderContainer.appendChild(slide);
    });

    new Swiper(".home-swiper", {
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  }

  function renderNewArrivals(products) {
    if (!newArrivalsContainer) return;

    newArrivalsContainer.innerHTML = ""; 

    const displayProducts = products.slice(0, 8);

    displayProducts.forEach(product => {
      const slide = document.createElement("div");
      slide.className = "new-content swiper-slide";

      let badgeHTML = "";
      if (product.condition === "New" || product.condition === "Sale") {
        badgeHTML = `<div class="new-tag">${product.condition}</div>`;
      }

      const imageUrl = (product.images && product.images.length > 0) 
        ? product.images[0].url 
        : "../../public/images/azure-button-down-shirt.png";

      let oldPriceHTML = "";
      if (product.oldPrice) {
        oldPriceHTML = `<span class="new-discount">$${product.oldPrice}</span>`;
      }

      slide.innerHTML = `
        ${badgeHTML}
        <a href="details.html?id=${product._id}">
          <img class="new-img" src="${imageUrl}" alt="${product.name}">
        </a>
        <h3 class="new-title"><a href="details.html?id=${product._id}" style="color: inherit;">${product.name}</a></h3>
        <span class="new-subtitle">${product.subCategory}</span>
        <div class="new-prices">
            <span class="new-price">$${product.price}</span>
            ${oldPriceHTML}
        </div>
        <a class="button new-button add-to-cart-btn" href="#" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">
            <i class="fas fa-shopping-cart"></i>
        </a>
      `;

      newArrivalsContainer.appendChild(slide);
    });

    new Swiper(".new-swiper", {
      spaceBetween: 25,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: displayProducts.length > 3,
      navigation: {
        nextEl: ".new-swiper-button-next",
        prevEl: ".new-swiper-button-prev",
      },
    });

    setupAddToCartListeners();
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

  fetchHomeData();
});
