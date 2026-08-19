console.log("Admin Products JS Loaded");

const productApi = `${API_BASE_URL}/product`;

let allProducts = [];


// Kept in step with ProductService.LOW_STOCK_THRESHOLD on the backend
const LOW_STOCK_THRESHOLD = 5;


// adminAuthHeaders() comes from common/api-config.js


// ================================
// Load Products
// ================================

window.onload = function () {

    console.log("Products Page Loaded");

    loadProducts();

};


function loadProducts() {

    fetch(productApi + "/getAll")

        .then(response => {

            console.log("Status :", response.status);

            return response.json();

        })

        .then(products => {

            console.log("Products :", products);

            allProducts = products;

            displayProducts(allProducts);

            loadCategoryFilter();

            loadInventorySummary();

        })

        .catch(error => {

            console.error("Product Error :", error);

        });

}


// ================================
// Inventory summary
// ================================

function loadInventorySummary() {

    fetch(productApi + "/admin/inventory-summary", {

        headers: adminAuthHeaders()

    })

        .then(response => {

            if (!response.ok) {

                throw new Error("Failed to load inventory summary");

            }

            return response.json();

        })

        .then(summary => {

            document.getElementById("invTotal").textContent =
                summary.totalProducts;

            document.getElementById("invLow").textContent =
                summary.lowStockCount;

            document.getElementById("invOut").textContent =
                summary.outOfStockCount;

        })

        .catch(error => {

            console.error("Inventory Summary Error :", error);

        });

}


// ================================
// Stock updates
// ================================

// Add or remove units relative to what is in stock now
function adjustStock(productId, delta) {

    fetch(
        productApi + "/admin/stock/" + productId
        + "/adjust?delta=" + delta,
        {
            method: "PUT",
            headers: adminAuthHeaders()
        }
    )
        .then(handleStockResponse)
        .catch(showStockError);

}


// Save the exact number typed into the box
function saveStock(productId) {

    const input =
        document.getElementById("stockInput-" + productId);

    if (!input) {

        return;

    }

    const quantity = parseInt(input.value, 10);

    if (isNaN(quantity) || quantity < 0) {

        alert("Enter a valid stock quantity (0 or more).");

        return;

    }

    fetch(
        productApi + "/admin/stock/" + productId
        + "?quantity=" + quantity,
        {
            method: "PUT",
            headers: adminAuthHeaders()
        }
    )
        .then(handleStockResponse)
        .catch(showStockError);

}


function handleStockResponse(response) {

    if (!response.ok) {

        return response.json()
            .then(body => {

                throw new Error(
                    body.message || "Could not update stock"
                );

            });

    }

    // Reload so the badge, summary tiles and any low-stock
    // filter all reflect the new number.
    loadProducts();

}


function showStockError(error) {

    console.error("Stock Error :", error);

    alert(error.message || "Could not update stock");

}


// ================================
// Display Products
// ================================

function displayProducts(products) {

    const tbody =
        document.getElementById("productTableBody");

    tbody.innerHTML = "";


    products.forEach(product => {

        const stock =
            product.stockQuantity == null
                ? 0
                : product.stockQuantity;


        let stockClass = "ok";
        let stockLabel = stock + " in stock";

        if (stock <= 0) {

            stockClass = "out";
            stockLabel = "Out of stock";

        } else if (stock <= LOW_STOCK_THRESHOLD) {

            stockClass = "low";
            stockLabel = "Low: " + stock;

        }


        tbody.innerHTML += `

            <tr>

                <td>
                    <img
                        src="${API_BASE_URL}/uploads/${product.imageUrl}"
                        class="product-image"
                    >
                </td>

                <td>
                    ${product.productName}
                </td>

                <td>
                    ${product.category.categoryName}
                </td>

                <td>
                    ₹${product.price}
                </td>

                <td>

                    <div class="stock-cell">

                        <span class="stock-tag ${stockClass}">
                            ${stockLabel}
                        </span>

                        <div class="stock-actions">

                            <button class="stock-step"
                                    title="Remove one unit"
                                    onclick="adjustStock(${product.productId}, -1)">
                                &minus;
                            </button>

                            <input class="stock-input"
                                   type="number"
                                   min="0"
                                   value="${stock}"
                                   id="stockInput-${product.productId}">

                            <button class="stock-step"
                                    title="Add one unit"
                                    onclick="adjustStock(${product.productId}, 1)">
                                +
                            </button>

                            <button class="stock-save"
                                    title="Save this exact quantity"
                                    onclick="saveStock(${product.productId})">
                                Set
                            </button>

                        </div>

                    </div>

                </td>

                <td>
                    <span class="available">
                        ${product.status}
                    </span>
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.productId})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.productId})">

                        <i class="fa-solid fa-trash "></i>

                    </button>

                </td>

            </tr>

        `;

    });

}


// ================================
// Search Product
// ================================

const searchInput =
    document.getElementById("search");


searchInput.addEventListener("input", function () {

    applyAdminFilters();

});


// ================================
// Category Filter
// ================================

const categoryFilter =
    document.getElementById("category");


function loadCategoryFilter() {

    const categories = [];


    allProducts.forEach(product => {

        const categoryName =
            product.category.categoryName;


        if (!categories.includes(categoryName)) {

            categories.push(categoryName);

        }

    });


    categoryFilter.innerHTML =
        `<option value="all">All Categories</option>`;


    categories.forEach(category => {

        categoryFilter.innerHTML += `

            <option value="${category}">
                ${category}
            </option>

        `;

    });

}


categoryFilter.addEventListener("change", function () {

    applyAdminFilters();

});


// ================================
// Low stock filter
// ================================

const lowStockOnly =
    document.getElementById("lowStockOnly");


if (lowStockOnly) {

    lowStockOnly.addEventListener("change", function () {

        applyAdminFilters();

    });

}


// Search, category and the low-stock toggle all narrow the same list,
// so they are applied together instead of overwriting each other.
function applyAdminFilters() {

    const searchValue =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const selectedCategory =
        categoryFilter ? categoryFilter.value : "all";

    const onlyLow =
        lowStockOnly ? lowStockOnly.checked : false;


    const filtered =
        allProducts.filter(product => {

            const matchesSearch =
                product.productName
                    .toLowerCase()
                    .includes(searchValue);


            const matchesCategory =
                selectedCategory === "all" ||
                (product.category &&
                    product.category.categoryName === selectedCategory);


            const stock =
                product.stockQuantity == null
                    ? 0
                    : product.stockQuantity;

            const matchesStock =
                !onlyLow || stock <= LOW_STOCK_THRESHOLD;


            return matchesSearch && matchesCategory && matchesStock;

        });


    displayProducts(filtered);

}




// ================================
// Delete Product
// ================================

function deleteProduct(productId) {

    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

    fetch(productApi + "/delete/" + productId, {

        method: "DELETE",

        headers: adminAuthHeaders()

    })

        .then(response => {

            console.log("Delete Status :", response.status);

            return response.text();

        })

        .then(message => {

            alert(message);

            loadProducts();

        })

        .catch(error => {

            console.error("Delete Error :", error);

        });

}



// ================================
// Edit Product
// ================================

function editProduct(productId) {

    console.log("Edit Product ID :", productId);

    window.location.href =
        "/pages/edit-product/edit-product.html?id=" + productId;

}

const addProductBtn = document.getElementById("add-product");

addProductBtn.addEventListener("click", function () {
    window.location.href = "/pages/add-products/add-products.html";
});