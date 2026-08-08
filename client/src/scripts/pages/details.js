document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.showNotification("No product specified", "error");
    return;
  }

  async function loadSkeletons() {
    try {
      const res = await fetch("../components/skeletonAnimation.html");
      const textHTML = await res.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(textHTML, 'text/html');
      
      const detailsSkel = doc.getElementById('details-skeleton').innerHTML;
      const cardSkel = doc.getElementById('card-skeleton').innerHTML;
      
      const mainContainer = document.getElementById("details-main-container");
      const relatedContainer = document.getElementById("real-related-products-container");
      
      if (mainContainer) {
        mainContainer.style.visibility = "hidden";
        const overlay = document.createElement("div");
        overlay.id = "skeleton-overlay";
        overlay.className = "details-container grid";
        overlay.innerHTML = detailsSkel;
        mainContainer.parentElement.insertBefore(overlay, mainContainer);
      }

      if (relatedContainer) relatedContainer.innerHTML = cardSkel + cardSkel + cardSkel;
    } catch (e) {
      console.error("Skeleton fetch error:", e);
    }
  }
  
  loadSkeletons();


  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  async function fetchProductDetails() {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch details");

      const product = await response.json();
      renderDetails(product);
      fetchRelatedProducts(product.category);
    } catch (error) {
      console.error("Details Fetch Error:", error);
      window.showNotification("Unable to load product details.", "error");
    }
  }

  function renderDetails(product) {
    const overlay = document.getElementById("skeleton-overlay");
    if (overlay) overlay.remove();
    const mainContainer = document.getElementById("details-main-container");
    if (mainContainer) mainContainer.style.visibility = "visible";

    document.querySelector(".details-subtitle").innerText = `${product.category} > ${product.subCategory}`;

    document.querySelector(".details-title").innerText = product.name;
    document.querySelector(".details-price").innerText = `$${product.price}`;
    
    const oldPriceEl = document.querySelector(".details-discount");
    const discountPercEl = document.querySelector(".discount-percentage");

    if (product.oldPrice) {
      oldPriceEl.innerText = `$${product.oldPrice}`;
      const perc = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      discountPercEl.innerText = `${perc}% OFF`;
    } else {
      oldPriceEl.style.display = "none";
      discountPercEl.style.display = "none";
    }

    document.querySelector(".discription-details p").innerText = product.description;

    const mainDetailsImg = document.getElementById("main-details-img");
    const primaryTag = document.getElementById("primary-tag");
    const thumbsContainer = document.getElementById("details-thumbnails");
    
    let currentImgIdx = 0;

    if (product.images && product.images.length > 0) {
      if (mainDetailsImg) mainDetailsImg.src = product.images[0].url;
      
      const prevBtn = document.querySelector(".gallery-nav-btn.prev");
      const nextBtn = document.querySelector(".gallery-nav-btn.next");
      if (product.images.length <= 1) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        if (thumbsContainer) thumbsContainer.style.display = "none";
      } else {
        if (prevBtn) prevBtn.style.display = "flex";
        if (nextBtn) nextBtn.style.display = "flex";
        if (thumbsContainer) thumbsContainer.style.display = "flex";
      }

      if (primaryTag) {
        if (product.condition === "New" || product.condition === "Sale") {
          primaryTag.innerText = product.condition;
          primaryTag.style.display = "block";
        } else {
          primaryTag.style.display = "none";
        }
      }

      if (thumbsContainer) {
        thumbsContainer.innerHTML = "";
        product.images.forEach((img, index) => {
          const thumb = document.createElement("img");
          thumb.src = img.url;
          thumb.alt = product.name;
          thumb.style.width = "60px";
          thumb.style.height = "60px";
          thumb.style.objectFit = "cover";
          thumb.style.borderRadius = "0.3rem";
          thumb.style.cursor = "pointer";
          thumb.style.border = index === 0 ? "2px solid var(--first-color)" : "2px solid transparent";
          
          thumb.addEventListener("click", () => {
            currentImgIdx = index;
            updateGallery();
          });

          thumbsContainer.appendChild(thumb);
        });
      }

      function updateGallery() {
        if (mainDetailsImg) mainDetailsImg.src = product.images[currentImgIdx].url;
        const thumbs = thumbsContainer.querySelectorAll("img");
        thumbs.forEach((t, i) => {
          t.style.border = i === currentImgIdx ? "2px solid var(--first-color)" : "2px solid transparent";
        });
      }

      window.shiftMainImage = function(dir) {
        currentImgIdx += dir;
        if (currentImgIdx < 0) currentImgIdx = product.images.length - 1;
        if (currentImgIdx >= product.images.length) currentImgIdx = 0;
        updateGallery();
      };

      setupLightbox(product.images);
    }


    const cartBtn = document.querySelector(".product-info .button");
    if (cartBtn) {
      cartBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Add To Cart`;
      cartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const qty = parseInt(document.querySelector(".card-amount-number").innerText) || 1;
        
        const imageUrl = (product.images && product.images.length > 0) 
          ? product.images[0].url 
          : "../../public/images/azure-button-down-shirt.png";

        addToCart({
          id: product._id,
          name: product.name,
          price: product.price,
          image: imageUrl,
          quantity: qty
        });
      });
    }

    const plusBtn = document.querySelector(".cart-amount-content .fa-plus");
    const minusBtn = document.querySelector(".cart-amount-content .fa-minus");
    const qtyNumber = document.querySelector(".card-amount-number");

    if (plusBtn && minusBtn && qtyNumber) {
      plusBtn.parentElement.addEventListener("click", () => {
        let curr = parseInt(qtyNumber.innerText);
        qtyNumber.innerText = curr + 1;
      });

      minusBtn.parentElement.addEventListener("click", () => {
        let curr = parseInt(qtyNumber.innerText);
        if (curr > 1) qtyNumber.innerText = curr - 1;
      });
    }
    const heartBtn = document.querySelector(".cart-amount-heart");
    if (heartBtn) {
      heartBtn.addEventListener("click", () => {
        heartBtn.style.color = heartBtn.style.color === "red" ? "var(--text-color)" : "red";
      });
    }

    const stars = document.querySelectorAll(".rating i");
    stars.forEach((star, index) => {
      star.style.cursor = "pointer";
      star.addEventListener("click", () => {
        stars.forEach((s, i) => {
          if (i <= index) {
            s.style.color = "#f1c40f"; 
          } else {
            s.style.color = "var(--text-color)";
          }
        });
      });
    });
  }

  function setupLightbox(images) {
    const mainImg = document.getElementById("main-details-img");
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;
    
    const lightboxImage = lightbox.querySelector(".lightbox-img");
    const lightboxClose = lightbox.querySelector(".lightbox-close");
    const lightboxCounter = lightbox.querySelector(".caption-counter");
    
    let itemIndex = 0;

    if (mainImg) {
      mainImg.style.cursor = "pointer";
      mainImg.addEventListener("click", () => {
        itemIndex = currentImgIdx;
        if (images && images[itemIndex]) lightboxImage.src = images[itemIndex].url;
        if (lightboxCounter) lightboxCounter.innerHTML = `${itemIndex + 1} of ${images.length}`;
        lightbox.classList.add("open");
      });
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
    }
    
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });

    window.nextItem = () => {
      if (!images || images.length === 0) return;
      itemIndex = (itemIndex + 1) % images.length;
      if (images[itemIndex]) lightboxImage.src = images[itemIndex].url;
      if (lightboxCounter) lightboxCounter.innerHTML = `${itemIndex + 1} of ${images.length}`;
    };

    window.prevItem = () => {
      if (!images || images.length === 0) return;
      itemIndex = (itemIndex - 1 + images.length) % images.length;
      if (images[itemIndex]) lightboxImage.src = images[itemIndex].url;
      if (lightboxCounter) lightboxCounter.innerHTML = `${itemIndex + 1} of ${images.length}`;
    };
  }

  async function fetchRelatedProducts(category) {
    try {
      const res = await fetch(`${API_URL}/products/all`);
      const products = await res.json();
      const related = products.filter(p => p.category === category && p._id !== productId);
      renderRelated(related.slice(0, 6));
    } catch (e) {
      console.error("Related fetch error:", e);
    }
  }

  function renderRelated(products) {
    const relatedContainer = document.getElementById("real-related-products-container");

    if (!relatedContainer) return;

    relatedContainer.innerHTML = "";

    if (products.length === 0) {
      relatedContainer.innerHTML = `<p style="text-align: center; width: 100%; padding: 2rem; color: var(--text-color);">No related items found.</p>`;
      return;
    }

    products.forEach(product => {
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
        <a class="button new-button" href="details.html?id=${product._id}">
            <i class="fas fa-shopping-cart"></i>
        </a>
      `;

      relatedContainer.appendChild(slide);
    });

    const relatedSwiper = new Swiper(".new-swiper", {
      spaceBetween: 25,
      centeredSlides: true,
      slidesPerView: "auto",
      loop: products.length > 3,
      navigation: {
        nextEl: ".new-swiper-button-next",
        prevEl: ".new-swiper-button-prev",
      },
    });
  }

  function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.showNotification(`${item.name} added to cart!`, "success");
    
    if (window.updateCartUI) {
      window.updateCartUI();
    }
  }

  fetchProductDetails();
});
