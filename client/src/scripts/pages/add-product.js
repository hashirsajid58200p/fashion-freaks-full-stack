document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageUpload");
  const previewContainer = document.getElementById("imagePreviewContainer");
  const productForm = document.getElementById("product-upload-form");
  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : "/api";

  // 1. Multiple Image Preview Logic
  imageInput.addEventListener("change", function () {
    previewContainer.innerHTML = ""; // Clear old previews
    const files = Array.from(this.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "preview-item";
        imgWrapper.innerHTML = `<img src="${e.target.result}">`;
        previewContainer.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  // 2. Form Submission
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.innerText = "🚀 Processing & Uploading...";
    submitBtn.disabled = true;

    const formData = new FormData(productForm);

    // Handle Sizes Checkboxes (Convert to Array for JSON.parse on backend)
    const selectedSizes = Array.from(
      document.querySelectorAll('input[name="sizes"]:checked'),
    ).map((cb) => cb.value);
    formData.delete("sizes"); // Purana data delete
    formData.append("sizes", JSON.stringify(selectedSizes));

    try {
      const response = await fetch(`${API_URL}/products/add`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        window.showNotification("Product has been added", "success");
        setTimeout(() => {
          window.location.reload(); // Refresh to clear
        }, 1500);

      } else {
        window.showNotification("Upload Failed: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      window.showNotification("Server connection error!", "error");
    } finally {
      submitBtn.innerText = "Confirm & Publish Product";
      submitBtn.disabled = false;
    }

  });
});
