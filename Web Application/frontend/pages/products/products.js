console.log("User Products JS Loaded");


// =====================================================
// PRODUCT API
// =====================================================

const productApi = `${API_BASE_URL}/product`;


const wishlistApi = `${API_BASE_URL}/wishlist`;



// =====================================================
// LOGGED IN CUSTOMER
// =====================================================

const loggedInCustomer =
    JSON.parse(localStorage.getItem("loggedInCustomer"));


// =====================================================
// GLOBAL PRODUCTS
// =====================================================

let allProducts = [];


// =====================================================
// SEARCH / PAGINATION STATE
//
// Filtering used to happen in the browser over every product the
// server sent. Now the server does the work and returns one page at
// a time, so the page stays fast no matter how big the catalogue gets.
// =====================================================

const PAGE_SIZE = 12;

let currentPage = 0;
let totalPages = 0;
let totalItems = 0;

let searchDebounceTimer = null;


// =====================================================
// NAVBAR ELEMENTS
// =====================================================

const loginButton = document.getElementById("login-btn");

const signUpButton = document.getElementById("signup-btn");

const cartButton = document.getElementById("cart-btn");

const cartBadge = document.getElementById("cartBadge");


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Products Page Loaded");


    // Navbar
    setupNavbar();


    // Products
    loadProducts();


    // Search
    setupSearch();


    // Category
    setupCategoryFilter();


    // Search icon
    setupSearchButton();

}
);


// =====================================================
// NAVBAR
// =====================================================

function setupNavbar() {

    // =================================================
    // GUEST USER
    // =================================================

    if (!loggedInCustomer) {

        console.log("Guest User");


        // -----------------------------
        // Login
        // -----------------------------

        if (loginButton) {

            loginButton.textContent = "Login";


            loginButton.onclick = function () {

                window.location.href = "/pages/login/login.html";

            };

        }


        // -----------------------------
        // Sign Up
        // -----------------------------

        if (signUpButton) {

            signUpButton.textContent = "Sign Up";


            signUpButton.onclick = function () {

                window.location.href = "/pages/register/register.html";

            };

        }


        // -----------------------------
        // Cart
        // -----------------------------

        if (cartButton) {

            cartButton.onclick =
                function () {

                    window.location.href = "/pages/login/login.html";

                };

        }


        return;

    }


    // =================================================
    // LOGGED IN USER
    // =================================================

    console.log("Logged In Customer:", loggedInCustomer);


    // =================================================
    // PROFILE BUTTON
    // =================================================

    if (loginButton) {

        loginButton.textContent = loggedInCustomer.firstName || loggedInCustomer.email || "Profile";


        loginButton.onclick =
            function () {

                window.location.href = "/pages/profile/profile.html";

            };

    }


    // =================================================
    // LOGOUT BUTTON
    // =================================================

    if (signUpButton) {

        signUpButton.textContent =
            "Logout";


        signUpButton.onclick =
            function () {

                localStorage.removeItem("loggedInCustomer");


                window.location.href = "/index.html";

            };

    }


    // =================================================
    // CART BUTTON
    // =================================================

    if (cartButton) {

        cartButton.onclick =
            function () {

                window.location.href = "/pages/cart/cart.html";

            };

    }


    // =================================================
    // VERIFY JWT
    // =================================================

    verifyCustomer();

}


// =====================================================
// VERIFY CUSTOMER
// =====================================================

function verifyCustomer() {

    if (
        !loggedInCustomer ||
        !loggedInCustomer.token
    ) {

        return;

    }


    fetch(
        `${API_BASE_URL}/customer/profile`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }

    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Unauthorized"
                );

            }


            return response.text();

        })

        .then(profile => {

            console.log(
                "Verified Profile:",
                profile
            );

        })

        .catch(error => {

            console.error("Profile Verification Error:", error);


            localStorage.removeItem("loggedInCustomer");


            // Guest mode

            if (loginButton) {

                loginButton.textContent = "Login";

                loginButton.onclick =
                    function () {

                        window.location.href = "/pages/login/login.html";

                    };

            }


            if (signUpButton) {

                signUpButton.textContent = "Sign Up";

                signUpButton.onclick =
                    function () {

                        window.location.href = "/pages/register/register.html";

                    };

            }

        });

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

function loadProducts() {

    loadCategories();

    fetchProducts(0);

}


// =====================================================
// FETCH ONE PAGE FROM THE SERVER
// =====================================================

function fetchProducts(page) {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const sortFilter =
        document.getElementById("sortFilter");


    const params = new URLSearchParams();

    params.set("page", page);
    params.set("size", PAGE_SIZE);


    const keyword =
        searchInput ? searchInput.value.trim() : "";

    if (keyword) {
        params.set("q", keyword);
    }


    const category =
        categoryFilter ? categoryFilter.value : "all";

    if (category && category !== "all") {
        params.set("categoryId", category);
    }


    const sort =
        sortFilter ? sortFilter.value : "";

    if (sort) {
        params.set("sort", sort);
    }


    showProductsLoading();


    fetch(`${productApi}/search?${params.toString()}`)

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to load products"
                );

            }


            return response.json();

        })

        .then(pageData => {

            allProducts = pageData.content || [];

            currentPage = pageData.page;
            totalPages = pageData.totalPages;
            totalItems = pageData.totalItems;


            displayProducts(allProducts);

            renderPagination();

            loadWishlistStatus();

        })

        .catch(error => {

            console.error(
                "Product Error:",
                error
            );


            const productGrid =
                document.getElementById(
                    "productGrid"
                );


            if (productGrid) {

                productGrid.innerHTML = `

                    <p class="no-products">

                        Unable to load products.

                    </p>

                `;

            }

        });

}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {

    const productGrid = document.getElementById("productGrid");


    if (!productGrid) {

        return;

    }


    productGrid.innerHTML = "";


    // =================================================
    // NO PRODUCTS
    // =================================================

    if (products.length === 0) {

        productGrid.innerHTML = `

            <p class="no-products">

                No products found.

            </p>

        `;

        return;

    }


    // =================================================
    // PRODUCT CARDS
    // =================================================

    products.forEach(product => {


        // Category safety

        const categoryName =
            product.category
                ? product.category.categoryName
                : "Uncategorized";


        // ---- stock state ----

        const stock =
            product.stockQuantity == null
                ? 0
                : product.stockQuantity;


        let stockClass = "in-stock";
        let stockLabel = stock + " in stock";

        if (stock <= 0) {

            stockClass = "out-of-stock";
            stockLabel = "Out of stock";

        } else if (stock <= 5) {

            stockClass = "low-stock";
            stockLabel = "Only " + stock + " left";

        }


        productGrid.innerHTML += `

            <div class="product-card ${stock <= 0 ? "is-unavailable" : ""}">


                <!-- ================= WISHLIST ================= -->

                <button

                    id="wishlist-${product.productId}"
                    class="wishlist"

                    onclick="toggleWishlist(${product.productId})"
                    ">

                    <i class="fa-solid fa-heart"></i>

                </button>


                <!-- ================= IMAGE ================= -->

                <a

                    class="image-link"

                    href="/pages/product-details/product-details.html?id=${product.productId}">

                    <img src="${API_BASE_URL}/uploads/${product.imageUrl.trim()}" alt="${product.productName}" onerror="this.onerror=null; this.src='/assets/images/sofa1.jpg';">

                </a>


                <!-- ================= NAME ================= -->

                <h3>

                    <a href="/pages/product-details/product-details.html?id=${product.productId}" class="product-title"> ${product.productName}</a>

                </h3>


                <!-- ================= CATEGORY ================= -->

                <div class="category-name">

                    ${categoryName}

                </div>


                <!-- ================= RATING ================= -->

                <div class="rating">

                    ⭐⭐⭐⭐⭐

                </div>


                <!-- ================= PRICE ================= -->

                <div class="price">

                    <span class="new-price">

                        ₹${product.price}

                    </span>

                </div>


                <!-- ================= STOCK ================= -->

                <div class="stock-badge ${stockClass}">

                    ${stockLabel}

                </div>


                <!-- ================= CART ================= -->

                <button

                    class="cart-btn"

                    ${stock <= 0 ? "disabled" : ""}

                    onclick="
                        addToCart(
                            ${product.productId}
                        )
                    ">

                    ${stock <= 0 ? "Out of stock" : "Add To Cart"}

                </button>


            </div>

        `;

    });

}


// =====================================================
// LOAD CATEGORIES
// =====================================================

// Categories now come from their own endpoint. Deriving them from the
// product list no longer works, because one page only contains a
// handful of products.
function loadCategories() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) {

        return;

    }


    fetch(`${API_BASE_URL}/category/getAll`)

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to load categories"
                );

            }


            return response.json();

        })

        .then(categories => {

            categoryFilter.innerHTML =
                `<option value="all">All Categories</option>`;


            categories.forEach(category => {

                categoryFilter.innerHTML += `
                    <option value="${category.categoryId}">
                        ${category.categoryName}
                    </option>
                `;

            });

        })

        .catch(error => {

            console.error("Category Error:", error);

        });

}


// =====================================================
// SEARCH
// =====================================================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "input",
        function () {

            applyFilters();

        }
    );

}


// =====================================================
// CATEGORY FILTER
// =====================================================

function setupCategoryFilter() {

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!categoryFilter) {

        return;

    }


    categoryFilter.addEventListener(
        "change",
        function () {

            applyFilters();

        }
    );


    const sortFilter =
        document.getElementById("sortFilter");


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            function () {

                applyFilters();

            }
        );

    }

}


// =====================================================
// APPLY SEARCH + CATEGORY
// =====================================================

// Any filter change starts again from page 1. Typing is debounced so a
// long search term does not fire a request per keystroke.
function applyFilters() {

    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(function () {

        fetchProducts(0);

    }, 300);

}


// =====================================================
// LOADING STATE
// =====================================================

function showProductsLoading() {

    const productGrid =
        document.getElementById("productGrid");


    if (productGrid) {

        productGrid.innerHTML = `
            <p class="no-products">Loading products...</p>
        `;

    }

}


// =====================================================
// PAGINATION
// =====================================================

function renderPagination() {

    const container =
        document.getElementById("pagination");


    if (!container) {

        return;

    }


    if (totalPages <= 1) {

        container.innerHTML = totalItems > 0
            ? `<span class="page-info">${totalItems} product${totalItems === 1 ? "" : "s"}</span>`
            : "";

        return;

    }


    const from = currentPage * PAGE_SIZE + 1;

    const to = Math.min(
        (currentPage + 1) * PAGE_SIZE,
        totalItems
    );


    let html = `
        <span class="page-info">
            Showing ${from}-${to} of ${totalItems}
        </span>

        <div class="page-buttons">

            <button class="page-btn"
                    ${currentPage === 0 ? "disabled" : ""}
                    onclick="goToPage(${currentPage - 1})">
                Prev
            </button>
    `;


    // Show at most 5 page numbers around the current page
    const first = Math.max(0, currentPage - 2);
    const last = Math.min(totalPages - 1, first + 4);


    for (let i = first; i <= last; i++) {

        html += `
            <button class="page-btn ${i === currentPage ? "active" : ""}"
                    onclick="goToPage(${i})">
                ${i + 1}
            </button>
        `;

    }


    html += `
            <button class="page-btn"
                    ${currentPage >= totalPages - 1 ? "disabled" : ""}
                    onclick="goToPage(${currentPage + 1})">
                Next
            </button>

        </div>
    `;


    container.innerHTML = html;

}


function goToPage(page) {

    if (page < 0 || page >= totalPages) {

        return;

    }


    fetchProducts(page);

    window.scrollTo({ top: 0, behavior: "smooth" });

}


// =====================================================
// SEARCH ICON
// =====================================================

function setupSearchButton() {

    const searchButton =
        document.getElementById(
            "searchButton"
        );


    if (!searchButton) {

        return;

    }


    searchButton.onclick =
        function () {

            const searchInput =
                document.getElementById(
                    "searchInput"
                );


            if (searchInput) {

                searchInput.focus();

            }

        };

}





// =====================================================
// TOGGLE WISHLIST
// =====================================================

function toggleWishlist(productId) {

    console.log(
        "Wishlist clicked:",
        productId
    );


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!loggedInCustomer) {

        alert(
            "Please login to manage your wishlist."
        );

        window.location.href =
            "/pages/login/login.html";

        return;

    }


    // =================================================
    // TOKEN CHECK
    // =================================================

    if (!loggedInCustomer.token) {

        alert(
            "Session expired. Please login again."
        );

        localStorage.removeItem(
            "loggedInCustomer"
        );

        window.location.href =
            "/pages/login/login.html";

        return;

    }


    // =================================================
    // FIND HEART BUTTON
    // =================================================

    const heartButton =
        document.getElementById(
            "wishlist-" + productId
        );


    if (!heartButton) {

        console.error(
            "Wishlist button not found:",
            productId
        );

        return;

    }


    // =================================================
    // CHECK CURRENT STATUS
    // =================================================

    const isActive =
        heartButton.classList.contains("active");


    // =================================================
    // ALREADY ADDED → REMOVE
    // =================================================

    if (isActive) {

        removeFromWishlist(
            productId,
            heartButton
        );

        return;

    }


    // =================================================
    // NOT ADDED → ADD
    // =================================================

    addWishlistProduct(
        productId,
        heartButton
    );

}

// =====================================================
// ADD PRODUCT TO WISHLIST
// =====================================================

function addWishlistProduct(
    productId,
    heartButton
) {

    console.log(
        "Adding wishlist product:",
        productId
    );


    fetch(
        wishlistApi +
        "/add?productId=" +
        productId,
        {

            method: "POST",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }
    )

        .then(response => {

            console.log(
                "Add Wishlist Status:",
                response.status
            );


            if (!response.ok) {

                return response.text()
                    .then(message => {

                        throw new Error(
                            message ||
                            "Failed to add wishlist"
                        );

                    });

            }


            return response.json();

        })

        .then(wishlistItem => {

            console.log(
                "Wishlist Added:",
                wishlistItem
            );


            // =========================================
            // MAKE HEART RED
            // =========================================

            heartButton.classList.add(
                "active"
            );


            alert(
                "Product added to wishlist ❤️"
            );

        })

        .catch(error => {

            console.error(
                "Add Wishlist Error:",
                error
            );


            alert(
                error.message ||
                "Unable to add product to wishlist."
            );

        });

}

// =====================================================
// REMOVE PRODUCT FROM WISHLIST
// =====================================================

function removeFromWishlist(
    productId,
    heartButton
) {

    console.log(
        "Removing wishlist product:",
        productId
    );


    fetch(
        wishlistApi +
        "/remove/" +
        productId,
        {

            method: "DELETE",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }
    )

        .then(response => {

            console.log(
                "Remove Wishlist Status:",
                response.status
            );


            if (!response.ok) {

                return response.text()
                    .then(message => {

                        throw new Error(
                            message ||
                            "Failed to remove wishlist"
                        );

                    });

            }


            return response.text();

        })

        .then(message => {

            console.log(
                "Wishlist Removed:",
                message
            );


            // =========================================
            // MAKE HEART NORMAL
            // =========================================

            heartButton.classList.remove(
                "active"
            );


            alert(
                "Product removed from wishlist ❤️"
            );

        })

        .catch(error => {

            console.error(
                "Remove Wishlist Error:",
                error
            );


            alert(
                error.message ||
                "Unable to remove product from wishlist."
            );

        });

}


// function addToWishlist(productId) {

//     console.log(
//         "Wishlist Product ID:",
//         productId
//     );


//     // -----------------------------
//     // Login Check
//     // -----------------------------

//     if (!loggedInCustomer) {

//         window.location.href =
//             "/pages/login/login.html";

//         return;

//     }


//     // -----------------------------
//     // Find Product
//     // -----------------------------

//     const product =
//         allProducts.find(
//             p => p.productId === productId
//         );


//     if (!product) {

//         alert("Product not found.");

//         return;

//     }


//     console.log(
//         "Wishlist Product:",
//         product
//     );


//     // -----------------------------
//     // User Wishlist Key
//     // -----------------------------

//     const wishlistKey =
//         "wishlist_" +
//         loggedInCustomer.email;


//     // -----------------------------
//     // Get Existing Wishlist
//     // -----------------------------

//     let wishlist =
//         JSON.parse(
//             localStorage.getItem(wishlistKey)
//         ) || [];


//     // -----------------------------
//     // Check Already Exists
//     // -----------------------------

//     const alreadyExists =
//         wishlist.some(
//             item =>
//                 item.productId === productId
//         );


//     if (alreadyExists) {

//         alert(
//             "Product already exists in your wishlist ❤️"
//         );

//         return;

//     }


//     // -----------------------------
//     // Add Product
//     // -----------------------------

//     wishlist.push(product);


//     // -----------------------------
//     // Save Wishlist
//     // -----------------------------

//     localStorage.setItem(
//         wishlistKey,
//         JSON.stringify(wishlist)
//     );


//     // -----------------------------
//     // Success
//     // -----------------------------

//     alert(
//         "Product added to wishlist ❤️"
//     );


//     console.log(
//         "Wishlist:",
//         wishlist
//     );

// }




// =====================================================
// ADD TO CART
// =====================================================

function addToCart(productId) {

    console.log(
        "Cart Product ID:",
        productId
    );


    // -----------------------------
    // Login Check
    // -----------------------------

    if (!loggedInCustomer) {

        window.location.href =
            "/pages/login/login.html";

        return;

    }


    // -----------------------------
    // Token Check
    // -----------------------------

    if (!loggedInCustomer.token) {

        alert(
            "Session expired. Please login again."
        );


        localStorage.removeItem(
            "loggedInCustomer"
        );


        window.location.href =
            "/pages/login/login.html";

        return;

    }


    console.log(
        "Adding product for:",
        loggedInCustomer.email
    );


    // -----------------------------
    // CART API
    // -----------------------------

    fetch(
        `${API_BASE_URL}/cart/add` +
        "?productId=" +
        productId +
        "&quantity=1",
        {

            method: "POST",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }

    )

        .then(response => {

            console.log(
                "Cart API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to add product to cart"
                );

            }


            return response.json();

        })

        .then(cartItem => {

            console.log(
                "Cart Item:",
                cartItem
            );


            alert(
                "Product added to cart successfully!"
            );


            // Update cart badge

            loadCartCount();

        })

        .catch(error => {

            console.error(
                "Cart Error:",
                error
            );


            alert(
                "Unable to add product to cart"
            );

        });

}


// =====================================================
// CART COUNT
// =====================================================

function loadCartCount() {

    if (!loggedInCustomer) {

        return;

    }


    if (!loggedInCustomer.token) {

        return;

    }


    fetch(
        `${API_BASE_URL}/cart`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }

    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Cart API failed"
                );

            }


            return response.json();

        })

        .then(cart => {

            console.log(
                "My Cart:",
                cart
            );


            if (!cartBadge) {

                return;

            }


            // If backend returns array

            if (Array.isArray(cart)) {

                cartBadge.textContent =
                    cart.length;

                return;

            }


            // If backend returns object

            if (cart.items &&
                Array.isArray(cart.items)) {

                cartBadge.textContent =
                    cart.items.length;

                return;

            }


            cartBadge.textContent = "0";

        })

        .catch(error => {

            console.log(
                "Cart Count Error:",
                error
            );

        });

}


// =====================================================
// INITIAL CART COUNT
// =====================================================

if (loggedInCustomer) {

    loadCartCount();

}

// =====================================================
// LOAD WISHLIST STATUS
// =====================================================

function loadWishlistStatus() {

    // Guest user
    if (
        !loggedInCustomer ||
        !loggedInCustomer.token
    ) {

        return;

    }


    console.log(
        "Loading wishlist status..."
    );


    fetch(
        wishlistApi + "/my-wishlist",
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }
    )

        .then(response => {

            console.log(
                "Wishlist Status API:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load wishlist status"
                );

            }


            return response.json();

        })

        .then(wishlist => {

            console.log(
                "My Wishlist:",
                wishlist
            );


            // -----------------------------
            // Mark wishlist products
            // -----------------------------

            wishlist.forEach(item => {

                const productId =
                    item.product
                        ? item.product.productId
                        : item.productId;


                const heartButton =
                    document.getElementById(
                        "wishlist-" + productId
                    );


                if (heartButton) {

                    heartButton.classList.add(
                        "active"
                    );

                }

            });

        })

        .catch(error => {

            console.error(
                "Wishlist Status Error:",
                error
            );

        });

}