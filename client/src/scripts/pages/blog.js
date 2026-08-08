document.addEventListener("DOMContentLoaded", async () => {
  const blogContainer = document.querySelector(".blog-container");
  const paginationContainer = document.querySelector(".pagination");
  if (!blogContainer) return;

  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 4;

  const blogTitles = [
    "Top Trends for the Upcoming Season",
    "How to Style Your Everyday Essentials",
    "The Art of Layering: A Complete Guide",
    "Sustainable Fashion: Why It Matters Now",
    "Accessorizing 101: Elevate Any Outfit",
    "Behind the Scenes of Our Latest Drop",
    "Color Palettes That Will Define This Year",
    "Capsule Wardrobes: Less Is Definitely More",
    "Footwear Trends to Step Up Your Game"
  ];

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  async function fetchProductsForBlogs() {
    try {
      const response = await fetch(`${API_URL}/products/all`);
      if (!response.ok) throw new Error("Failed to fetch products");
      allProducts = await response.json();

      renderBlogs();
    } catch (error) {
      console.error("Error rendering blogs:", error);
    }
  }

  function renderBlogs() {
    blogContainer.innerHTML = "";
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = allProducts.slice(startIdx, startIdx + itemsPerPage);

    if (paginatedItems.length === 0) {
      blogContainer.innerHTML = `<p style="text-align: center; color: var(--text-color);">No blog entries available.</p>`;
      renderPagination();
      return;
    }

    paginatedItems.forEach((product, index) => {
      const globalIdx = startIdx + index;
      const imageUrl = (product.images && product.images.length > 0) 
        ? product.images[0].url 
        : "../../public/images/azure-button-down-shirt.png";
      
      const title = blogTitles[globalIdx % blogTitles.length];
      const date = new Date(Date.now() - globalIdx * 86400000 * 3).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const richDescription = `${product.description}. This premium piece is designed with absolute perfection, utilizing curated organic fabrics to create the ultimate modern aesthetic. Whether worn for a casual outing or a high-end event, its flawless tailoring guarantees outstanding confidence. Our design philosophy emphasizes timeless styles that adapt effortlessly to your dynamic lifestyle, bringing together maximum comfort and uncompromised luxury. Elevate your wardrobe seamlessly today!`;
      const words = richDescription.split(" ");
      const briefText = words.slice(0, 15).join(" ") + "...";

      const blogPost = document.createElement("div");
      blogPost.className = "blog-post grid";
      blogPost.innerHTML = `
        <img class="blog-img" src="${imageUrl}" alt="Blog cover" style="width: 200px; height: 200px; object-fit: cover; border-radius: 1.5rem; justify-self: center;">
        <div class="blog-info">
          <p class="up-info brief-desc" style="font-size: 1.1rem;">${briefText}</p>
          <p class="up-info full-desc" style="display: none; font-size: 1.1rem;">${richDescription}</p>
          <h3 class="info-title" style="font-size: 1.4rem;">${title}</h3>
          <p class="info-discription">By Admin / ${date} /</p>
          <div class="more">
            <span class="read-more" style="cursor: pointer;">
              Read More
              <i class="fas fa-arrow-right button-icon"></i>
            </span>
          </div>
        </div>
      `;
      
      const readMoreBtn = blogPost.querySelector(".read-more");
      const briefDesc = blogPost.querySelector(".brief-desc");
      const fullDesc = blogPost.querySelector(".full-desc");

      readMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (fullDesc.style.display === "none") {
          fullDesc.style.display = "block";
          briefDesc.style.display = "none";
          readMoreBtn.innerHTML = `Show Less <i class="fas fa-arrow-up button-icon"></i>`;
        } else {
          fullDesc.style.display = "none";
          briefDesc.style.display = "block";
          readMoreBtn.innerHTML = `Read More <i class="fas fa-arrow-right button-icon"></i>`;
        }
      });

      blogContainer.appendChild(blogPost);
    });

    renderPagination();
  }

  function renderPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Prev Arrow
    const prevBtn = document.createElement("i");
    prevBtn.className = "fas fa-chevron-left";
    prevBtn.style.cursor = "pointer";
    prevBtn.style.margin = "0 0.5rem";
    prevBtn.style.color = currentPage > 1 ? "var(--first-color)" : "#ccc";
    if (currentPage > 1) {
      prevBtn.addEventListener("click", () => {
        currentPage -= 1;
        renderBlogs();
      });
    }
    paginationContainer.appendChild(prevBtn);

    // Numbered Pages
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
        renderBlogs();
      });

      paginationContainer.appendChild(pageBtn);
    }

    // Next Arrow
    const nextBtn = document.createElement("i");
    nextBtn.className = "fas fa-chevron-right";
    nextBtn.style.cursor = "pointer";
    nextBtn.style.margin = "0 0.5rem";
    nextBtn.style.color = currentPage < totalPages ? "var(--first-color)" : "#ccc";
    if (currentPage < totalPages) {
      nextBtn.addEventListener("click", () => {
        currentPage += 1;
        renderBlogs();
      });
    }
    paginationContainer.appendChild(nextBtn);
  }

  fetchProductsForBlogs();
});
