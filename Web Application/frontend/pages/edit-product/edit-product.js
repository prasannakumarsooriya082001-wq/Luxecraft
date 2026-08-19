console.log("Edit Product JS Loaded");


// ==========================
// Get Product ID
// ==========================

const urlParams = new URLSearchParams(window.location.search);

const productId = urlParams.get("id");

console.log("Product ID :", productId);


// ==========================
// API URLs
// ==========================

const productApi = `${API_BASE_URL}/product`;
const categoryApi = `${API_BASE_URL}/category`;


// ==========================
// HTML Elements
// ==========================

const productImage = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");

const productName = document.getElementById("productName");
const category = document.getElementById("category");
const price = document.getElementById("price");
const stockQuantity = document.getElementById("stockQuantity");
const status = document.getElementById("status");
const description = document.getElementById("description");

const updateBtn = document.getElementById("updateBtn");


// ==========================
// Image Preview
// ==========================

productImage.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {

        previewImage.src = URL.createObjectURL(file);

    }

});


// ==========================
// Window Load
// ==========================

window.onload = function () {

    console.log("Edit Page Loaded");

    if (!productId) {

        alert("Product ID not found");

        return;

    }

    loadCategories();

};


// ==========================
// Load Categories
// ==========================

function loadCategories() {

    console.log("Loading Categories...");

    fetch(categoryApi + "/getAll")

        .then(response => {

            console.log(
                "Category Status :",
                response.status
            );

            return response.json();

        })

        .then(categories => {

            console.log(
                "Categories :",
                categories
            );

            category.innerHTML =
                '<option value="">Select Category</option>';


            categories.forEach(cat => {

                category.innerHTML += `

                    <option value="${cat.categoryId}">
                        ${cat.categoryName}
                    </option>

                `;

            });


            console.log(
                "Categories Loaded Successfully"
            );


            // Categories loaded
            // Now load product

            loadProduct();

        })

        .catch(error => {

            console.error(
                "Category Error :",
                error
            );

        });

}


// ==========================
// Load Product
// ==========================

function loadProduct() {

    console.log("Loading Product...");

    fetch(productApi + "/get/" + productId)

        .then(response => {

            console.log(
                "Product Status :",
                response.status
            );

            return response.json();

        })

        .then(product => {

            console.log(
                "Product :",
                product
            );


            // ==========================
            // Product Details
            // ==========================

            productName.value =
                product.productName;

            price.value =
                product.price;

            stockQuantity.value =
                product.stockQuantity;

            status.value =
                product.status;

            description.value =
                product.description;


            // ==========================
            // Category
            // ==========================

            category.value =
                product.category.categoryId;


            console.log(
                "Selected Category :",
                category.value
            );


            // ==========================
            // Existing Image
            // ==========================

            if (product.imageUrl) {

                previewImage.src =
                    `${API_BASE_URL}/uploads/`
                    + product.imageUrl;

            }


            console.log(
                "Product Loaded Successfully"
            );

        })

        .catch(error => {

            console.error(
                "Product Error :",
                error
            );

        });

}


// ==========================
// Update Product
// ==========================

updateBtn.addEventListener("click", function () {

    console.log("🔥 Update Button Clicked");


    // ==========================
    // Validation
    // ==========================

    if (
        productName.value.trim() === "" ||
        category.value === "" ||
        price.value === "" ||
        stockQuantity.value === "" ||
        status.value === "" ||
        description.value.trim() === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }


    // ==========================
    // Create FormData
    // ==========================

    const formData = new FormData();


    formData.append(
        "productId",
        productId
    );


    formData.append(
        "productName",
        productName.value.trim()
    );


    formData.append(
        "description",
        description.value.trim()
    );


    formData.append(
        "price",
        price.value
    );


    formData.append(
        "stockQuantity",
        stockQuantity.value
    );


    formData.append(
        "status",
        status.value
    );


    formData.append(
        "categoryId",
        category.value
    );


    // ==========================
    // New Image
    // ==========================

    const imageFile =
        productImage.files[0];


    if (imageFile) {

        console.log(
            "New Image Selected :",
            imageFile.name
        );

        formData.append(
            "image",
            imageFile
        );

    }


    console.log("🔥 Before Update Fetch");


    // ==========================
    // Update API
    // ==========================

    fetch(productApi + "/update", {

        method: "PUT",

        // Authorization only - the browser must set the multipart
        // Content-Type itself so the boundary is correct.
        headers: adminAuthHeaders(),

        body: formData

    })

        .then(response => {

            console.log(
                "Update Status :",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Product update failed"
                );

            }


            return response.json();

        })

        .then(updatedProduct => {

            console.log(
                "Updated Product :",
                updatedProduct
            );


            alert(
                "Product Updated Successfully"
            );


            // ==========================
            // Redirect
            // ==========================

            window.location.href =
                "/pages/admin-products/admin-products.html";

        })

        .catch(error => {

            console.error(
                "Update Error :",
                error
            );

            alert(
                "Failed to update product"
            );

        });

});