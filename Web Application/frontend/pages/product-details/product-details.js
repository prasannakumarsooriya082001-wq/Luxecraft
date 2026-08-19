console.log("Product Details JS Loaded");


// =====================================================
// API
// =====================================================

const productApi =`${API_BASE_URL}/product`;

const cartApi =`${API_BASE_URL}/cart`;

const reviewApi =`${API_BASE_URL}/review`;


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentProductId = null;

let quantity = 1;

let selectedReviewRating = 0;

// Edit mode
let editingReviewId = null;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Product Details Page Loaded"
        );


        // Navbar
        setupNavbar();


        // Navigation
        setupNavigation();


        // Product
        loadProduct();


        // Quantity
        setupQuantity();


        // Add To Cart
        setupAddToCart();


        // Buy Now
        setupBuyNow();


        // Related Products
        loadRelatedProducts();


        // Review
        setupReview();

    }
);


// =====================================================
// GET LOGGED IN CUSTOMER
// =====================================================

function getLoggedInCustomer() {

    return JSON.parse(
        localStorage.getItem(
            "loggedInCustomer"
        )
    );

}


// =====================================================
// NAVBAR
// =====================================================

function setupNavbar() {

    const customer =getLoggedInCustomer();


    const loginButton =document.querySelector(".login-btn");


    const signUpButton =document.querySelector(".signup-btn");


    const cartButton =document.querySelector(".cart");


    // =================================================
    // GUEST USER
    // =================================================

    if (!customer) {

        console.log(
            "Guest User"
        );


        if (loginButton) {

            loginButton.textContent =
                "Login";


            loginButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/login/login.html";

                };

        }


        if (signUpButton) {

            signUpButton.textContent =
                "Sign Up";


            signUpButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/register/register.html";

                };

        }

    }


    // =================================================
    // LOGGED IN USER
    // =================================================

    else {

        console.log(
            "Logged In Customer:",
            customer
        );


        if (loginButton) {

            loginButton.textContent =
                customer.firstName ||
                customer.email ||
                "Profile";


            loginButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/profile/profile.html";

                };

        }


        if (signUpButton) {

            signUpButton.textContent =
                "Logout";


            signUpButton.onclick =
                function () {

                    localStorage.removeItem(
                        "loggedInCustomer"
                    );


                    window.location.reload();

                };

        }

    }


    // =================================================
    // CART NAVBAR
    // =================================================

    if (cartButton) {

        cartButton.onclick =
            function () {

                const currentCustomer =
                    getLoggedInCustomer();


                if (!currentCustomer) {

                    window.location.href =
                        "/frontend/pages/login/login.html";

                    return;

                }


                window.location.href =
                    "/frontend/pages/cart/cart.html";

            };

    }

}


// =====================================================
// LOAD CURRENT PRODUCT
// =====================================================

function loadProduct() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    console.log(
        "Product ID:",
        productId
    );


    if (!productId) {

        console.error(
            "Product ID not found"
        );

        return;

    }


    currentProductId =
        productId;


    // =================================================
    // LOAD PRODUCT
    // =================================================

    fetch(
        productApi +
        "/get/" +
        productId
    )

        .then(
            response => {

                console.log(
                    "Product API Status:",
                    response.status
                );


                if (!response.ok) {

                    throw new Error(
                        "Product not found"
                    );

                }


                return response.json();

            }
        )

        .then(
            product => {

                console.log(
                    "Current Product:",
                    product
                );


                displayProduct(
                    product
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Product Error:",
                    error
                );

            }
        );


    // =================================================
    // LOAD REVIEWS
    // =================================================

    loadProductReviews();

}


// =====================================================
// DISPLAY PRODUCT
// =====================================================

function displayProduct(
    product
) {

    const productName =
        document.getElementById(
            "productName"
        );


    const productPrice =
        document.getElementById(
            "productPrice"
        );


    const productDescription =
        document.getElementById(
            "productDescription"
        );


    const mainImage =
        document.getElementById(
            "mainImage"
        );


    if (productName) {

        productName.textContent =
            product.productName;

    }


    if (productPrice) {

        productPrice.textContent =
            "₹" + product.price;

    }


    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "Premium handcrafted sofa designed for luxury living.";

    }


    if (mainImage) {

        mainImage.src =
            `${API_BASE_URL}/uploads/` +
            product.imageUrl;


        mainImage.alt =
            product.productName;

    }

}


// =====================================================
// QUANTITY
// =====================================================

function setupQuantity() {

    const quantityDisplay =
        document.getElementById(
            "quantity"
        );


    const increaseBtn =
        document.getElementById(
            "increaseBtn"
        );


    const decreaseBtn =
        document.getElementById(
            "decreaseBtn"
        );


    if (!quantityDisplay || !increaseBtn || !decreaseBtn) {

        return;

    }


    quantity = 1;


    quantityDisplay.textContent =
        quantity;


    // =================================================
    // INCREASE
    // =================================================

    increaseBtn.addEventListener(
        "click",
        function () {

            quantity++;


            quantityDisplay.textContent =
                quantity;

        }
    );


    // =================================================
    // DECREASE
    // =================================================

    decreaseBtn.addEventListener(
        "click",
        function () {

            if (quantity > 1) {

                quantity--;

            }


            quantityDisplay.textContent =
                quantity;

        }
    );

}


// =====================================================
// ADD TO CART
// =====================================================

function setupAddToCart() {

    const addToCartBtn =document.getElementById("addToCartBtn");


    if (!addToCartBtn) {

        return;

    }


    addToCartBtn.addEventListener(
        "click",
        function () {

            addCurrentProductToCart(
                quantity
            );

        }
    );

}


// =====================================================
// ADD CURRENT PRODUCT TO CART
// =====================================================

function addCurrentProductToCart(
    selectedQuantity
) {

    const customer =
        getLoggedInCustomer();


    if (!customer) {

        alert(
            "Please login to add products to cart."
        );


        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    if (!currentProductId) {

        alert(
            "Product ID not found."
        );


        return;

    }


    console.log(
        "Adding Product:",
        currentProductId
    );


    console.log(
        "Quantity:",
        selectedQuantity
    );


    fetch(
        cartApi +
        "/add?productId=" +
        currentProductId +
        "&quantity=" +
        selectedQuantity,
        {

            method: "POST",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token

            }

        }
    )

        .then(
            response => {

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

            }
        )

        .then(
            cartItem => {

                console.log(
                    "Cart Item:",
                    cartItem
                );


                alert(
                    "Product added to cart successfully!"
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Cart Error:",
                    error
                );


                alert(
                    "Unable to add product to cart."
                );

            }
        );

}


// =====================================================
// BUY NOW
// =====================================================

function setupBuyNow() {

    const buyNowBtn =
        document.getElementById(
            "buyNowBtn"
        );


    if (!buyNowBtn) {

        return;

    }


    buyNowBtn.addEventListener(
        "click",
        function () {

            const customer =
                getLoggedInCustomer();


            if (!customer) {

                alert(
                    "Please login to continue."
                );


                window.location.href =
                    "/frontend/pages/login/login.html";


                return;

            }


            if (!currentProductId) {

                alert(
                    "Product not found."
                );


                return;

            }


            fetch(
                cartApi +
                "/add?productId=" +
                currentProductId +
                "&quantity=" +
                quantity,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            customer.token

                    }

                }
            )

                .then(
                    response => {

                        if (!response.ok) {

                            throw new Error(
                                "Unable to add product"
                            );

                        }


                        return response.json();

                    }
                )

                .then(
                    () => {

                        window.location.href =
                            "/frontend/pages/cart/cart.html";

                    }
                )

                .catch(
                    error => {

                        console.error(
                            "Buy Now Error:",
                            error
                        );


                        alert(
                            "Unable to continue to checkout."
                        );

                    }
                );

        }
    );

}


// =====================================================
// LOAD RELATED PRODUCTS
// =====================================================

function loadRelatedProducts() {

    console.log(
        "Loading You May Also Like..."
    );


    fetch(
        productApi +
        "/getAll"
    )

        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load related products"
                    );

                }


                return response.json();

            }
        )

        .then(
            products => {

                console.log(
                    "All Products:",
                    products
                );


                const relatedProducts =
                    products.filter(
                        product =>
                            String(
                                product.productId
                            ) !==
                            String(
                                currentProductId
                            )
                    );


                const limitedProducts =
                    relatedProducts.slice(
                        0,
                        4
                    );


                displayRelatedProducts(
                    limitedProducts
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Related Product Error:",
                    error
                );

            }
        );

}


// =====================================================
// DISPLAY RELATED PRODUCTS
// =====================================================

function displayRelatedProducts(
    products
) {

    const sectionTitles =
        document.querySelectorAll(
            ".section-title h2"
        );


    let relatedGrid =
        null;


    sectionTitles.forEach(
        title => {

            if (
                title.textContent
                    .trim()
                    .toLowerCase()
                    .includes(
                        "you may also like"
                    )
            ) {

                const section =
                    title.closest(
                        ".products"
                    );


                if (section) {

                    relatedGrid =
                        section.querySelector(
                            ".product-grid"
                        );

                }

            }

        }
    );


    if (!relatedGrid) {

        console.error(
            "Related product grid not found"
        );


        return;

    }


    relatedGrid.innerHTML = "";


    if (
        products.length === 0
    ) {

        relatedGrid.innerHTML = `

            <p class="no-products">
                No related products available.
            </p>

        `;


        return;

    }


    products.forEach(
        product => {

            relatedGrid.innerHTML += `

                <div class="product-card">

                    <a
                        href="/frontend/pages/product-details/product-details.html?id=${product.productId}">

                        <img
                            src="${API_BASE_URL}/uploads/${product.imageUrl}"
                            alt="${product.productName}">

                    </a>


                    <h3>

                        <a
                            href="/frontend/pages/product-details/product-details.html?id=${product.productId}">

                            ${product.productName}

                        </a>

                    </h3>


                    <div class="rating">

                        ⭐⭐⭐⭐⭐

                    </div>


                    <div class="price">

                        <span class="new-price">

                            ₹${product.price}

                        </span>

                    </div>


                    <button
                        class="cart-btn"
                        onclick="addRelatedToCart(${product.productId})">

                        Add To Cart

                    </button>

                </div>

            `;

        }
    );

}


// =====================================================
// RELATED PRODUCT → CART
// =====================================================

function addRelatedToCart(
    productId
) {

    const customer =
        getLoggedInCustomer();


    if (!customer) {

        alert(
            "Please login to add products to cart."
        );


        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    console.log(
        "Related Product ID:",
        productId
    );


    fetch(
        cartApi +
        "/add?productId=" +
        productId +
        "&quantity=1",
        {

            method: "POST",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token

            }

        }
    )

        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to add product"
                    );

                }


                return response.json();

            }
        )

        .then(
            cartItem => {

                console.log(
                    "Related Cart Item:",
                    cartItem
                );


                alert(
                    "Product added to cart successfully!"
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Related Cart Error:",
                    error
                );


                alert(
                    "Unable to add product to cart."
                );

            }
        );

}


// =====================================================
// RELATED PRODUCT → WISHLIST
// =====================================================

function addRelatedToWishlist(
    productId
) {

    const customer =
        getLoggedInCustomer();


    if (!customer) {

        alert(
            "Please login to add products to wishlist."
        );


        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    console.log(
        "Wishlist Product ID:",
        productId
    );


    window.location.href =
        "/frontend/pages/wishlist/wishlist.html";

}


// =====================================================
// MAIN NAV LINKS
// =====================================================

function setupNavigation() {

    const homeLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    if (
        homeLinks.length >= 1
    ) {

        homeLinks[0].href =
            "/frontend/index.html";

    }


    if (
        homeLinks.length >= 2
    ) {

        homeLinks[1].href =
            "/frontend/pages/products/products.html";

    }

}


// =====================================================
// REVIEW SYSTEM
// =====================================================


// =====================================================
// SETUP REVIEW
// =====================================================

function setupReview() {

    const starInput =
        document.getElementById(
            "starInput"
        );


    const selectedRating =
        document.getElementById(
            "selectedRating"
        );


    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    // =================================================
    // STAR RATING
    // =================================================

    if (starInput) {

        const stars =
            starInput.querySelectorAll(
                "span"
            );


        stars.forEach(
            star => {

                star.addEventListener(
                    "click",
                    function () {

                        selectedReviewRating =
                            Number(
                                this.dataset.rating
                            );


                        if (
                            selectedRating
                        ) {

                            selectedRating.value =
                                selectedReviewRating;

                        }


                        updateReviewStars(
                            selectedReviewRating
                        );

                    }
                );

            }
        );

    }


    // =================================================
    // SUBMIT / UPDATE REVIEW
    // =================================================

    if (submitReviewBtn) {

        submitReviewBtn.addEventListener(
            "click",
            function () {

                submitReview();

            }
        );

    }

}


// =====================================================
// UPDATE STAR UI
// =====================================================

function updateReviewStars(
    rating
) {

    const stars =
        document.querySelectorAll(
            "#starInput span"
        );


    stars.forEach(
        star => {

            const starRating =
                Number(
                    star.dataset.rating
                );


            if (
                starRating <= rating
            ) {

                star.classList.add(
                    "active"
                );

            } else {

                star.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// SUBMIT REVIEW
// =====================================================

function submitReview() {

    const customer =
        getLoggedInCustomer();


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!customer) {

        alert(
            "Please login to submit a review."
        );


        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    // =================================================
    // PRODUCT CHECK
    // =================================================

    if (!currentProductId) {

        alert(
            "Product not found."
        );


        return;

    }


    // =================================================
    // RATING CHECK
    // =================================================

    if (
        selectedReviewRating === 0
    ) {

        alert(
            "Please select a rating."
        );


        return;

    }


    // =================================================
    // GET REVIEW TEXT
    // =================================================

    const reviewText =
        document.getElementById(
            "reviewText"
        );


    if (!reviewText) {

        return;

    }


    const review =
        reviewText.value.trim();


    // =================================================
    // COMMENT VALIDATION
    // =================================================

    if (
        review === ""
    ) {

        alert(
            "Please write your review."
        );


        reviewText.focus();


        return;

    }


    console.log(
        "Review Customer:",
        customer
    );


    console.log(
        "Product ID:",
        currentProductId
    );


    console.log(
        "Rating:",
        selectedReviewRating
    );


    console.log(
        "Review:",
        review
    );


    // =================================================
    // CHECK EDIT MODE
    // =================================================

    if (editingReviewId) {

        updateReview(
            editingReviewId,
            selectedReviewRating,
            review
        );


        return;

    }


    // =================================================
    // ADD NEW REVIEW
    // =================================================

    const formData =
        new URLSearchParams();


    formData.append(
        "productId",
        currentProductId
    );


    formData.append(
        "rating",
        selectedReviewRating
    );


    formData.append(
        "comment",
        review
    );


    // =================================================
    // SEND REVIEW TO BACKEND
    // =================================================

    fetch(
        reviewApi + "/add",
        {

            method: "POST",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token,

                "Content-Type":
                    "application/x-www-form-urlencoded"

            },

            body: formData

        }
    )

        .then(
            response => {

                console.log(
                    "Review API Status:",
                    response.status
                );


                if (!response.ok) {

                    return response.text()
                        .then(
                            message => {

                                throw new Error(
                                    message
                                );

                            }
                        );

                }


                return response.json();

            }
        )

        .then(
            data => {

                console.log(
                    "Review Saved Successfully:",
                    data
                );


                alert(
                    "Review submitted successfully!"
                );


                resetReviewForm();


                loadProductReviews();

            }
        )

        .catch(
            error => {

                console.error(
                    "Review Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to submit review."
                );

            }
        );

}


// =====================================================
// EDIT REVIEW
// =====================================================

function editReview(
    reviewId,
    rating,
    comment
) {

    console.log(
        "Editing Review:",
        reviewId
    );


    // =================================================
    // SET EDIT MODE
    // =================================================

    editingReviewId =
        reviewId;


    // =================================================
    // SET RATING
    // =================================================

    selectedReviewRating =
        Number(
            rating
        );


    const selectedRating =
        document.getElementById(
            "selectedRating"
        );


    if (selectedRating) {

        selectedRating.value =
            selectedReviewRating;

    }


    updateReviewStars(
        selectedReviewRating
    );


    // =================================================
    // SET COMMENT
    // =================================================

    const reviewText =
        document.getElementById(
            "reviewText"
        );


    if (reviewText) {

        reviewText.value =
            comment || "";

    }


    // =================================================
    // CHANGE BUTTON
    // =================================================

    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    if (submitReviewBtn) {

        submitReviewBtn.textContent =
            "Update Review";


        submitReviewBtn.classList.add(
            "update-mode"
        );

    }


    // =================================================
    // SCROLL TO REVIEW FORM
    // =================================================

    const reviewForm =
        document.querySelector(
            ".write-review"
        );


    if (reviewForm) {

        reviewForm.scrollIntoView(
            {
                behavior: "smooth",
                block: "center"
            }
        );

    }

}


// =====================================================
// UPDATE REVIEW
// =====================================================

function updateReview(
    reviewId,
    rating,
    comment
) {

    const customer =
        getLoggedInCustomer();


    if (!customer) {

        alert(
            "Please login first."
        );


        return;

    }


    console.log(
        "Updating Review:",
        reviewId
    );


    const formData =
        new URLSearchParams();


    formData.append(
        "rating",
        rating
    );


    formData.append(
        "comment",
        comment
    );


    fetch(
        reviewApi +
        "/update/" +
        reviewId,
        {

            method: "PUT",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token,

                "Content-Type":
                    "application/x-www-form-urlencoded"

            },

            body: formData

        }
    )

        .then(
            response => {

                console.log(
                    "Update Review Status:",
                    response.status
                );


                if (!response.ok) {

                    return response.text()
                        .then(
                            message => {

                                throw new Error(
                                    message
                                );

                            }
                        );

                }


                return response.json();

            }
        )

        .then(
            data => {

                console.log(
                    "Review Updated:",
                    data
                );


                alert(
                    "Review updated successfully!"
                );


                // =================================================
                // RESET FORM
                // =================================================

                resetReviewForm();


                // =================================================
                // LOAD UPDATED REVIEWS
                // =================================================

                loadProductReviews();

            }
        )

        .catch(
            error => {

                console.error(
                    "Update Review Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to update review."
                );

            }
        );

}


// =====================================================
// DELETE REVIEW
// =====================================================

function deleteReview(
    reviewId
) {

    const customer =
        getLoggedInCustomer();


    if (!customer) {

        alert(
            "Please login first."
        );


        return;

    }


    // =================================================
    // CONFIRM DELETE
    // =================================================

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this review?"
        );


    if (!confirmDelete) {

        return;

    }


    console.log(
        "Deleting Review:",
        reviewId
    );


    fetch(
        reviewApi +
        "/delete/" +
        reviewId,
        {

            method: "DELETE",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token

            }

        }
    )

        .then(
            response => {

                console.log(
                    "Delete Review Status:",
                    response.status
                );


                if (!response.ok) {

                    return response.text()
                        .then(
                            message => {

                                throw new Error(
                                    message
                                );

                            }
                        );

                }


                return response.text();

            }
        )

        .then(
            message => {

                console.log(
                    "Delete Response:",
                    message
                );


                alert(
                    "Review deleted successfully!"
                );


                // =================================================
                // LOAD UPDATED REVIEWS
                // =================================================

                loadProductReviews();

            }
        )

        .catch(
            error => {

                console.error(
                    "Delete Review Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to delete review."
                );

            }
        );

}


// =====================================================
// RESET REVIEW FORM
// =====================================================

function resetReviewForm() {

    // =================================================
    // RESET EDIT ID
    // =================================================

    editingReviewId =
        null;


    // =================================================
    // RESET RATING
    // =================================================

    selectedReviewRating =
        0;


    // =================================================
    // RESET COMMENT
    // =================================================

    const reviewText =
        document.getElementById(
            "reviewText"
        );


    if (reviewText) {

        reviewText.value =
            "";

    }


    // =================================================
    // RESET HIDDEN RATING
    // =================================================

    const selectedRating =
        document.getElementById(
            "selectedRating"
        );


    if (selectedRating) {

        selectedRating.value =
            0;

    }


    // =================================================
    // RESET STARS
    // =================================================

    updateReviewStars(
        0
    );


    // =================================================
    // RESET BUTTON
    // =================================================

    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    if (submitReviewBtn) {

        submitReviewBtn.textContent =
            "Submit Review";


        submitReviewBtn.classList.remove(
            "update-mode"
        );

    }

}


// =====================================================
// ESCAPE REVIEW TEXT
// =====================================================

function escapeReviewText(
    text
) {

    return String(
        text || ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\n/g,
            "\\n"
        )
        .replace(
            /\r/g,
            "\\r"
        );

}


// =====================================================
// LOAD PRODUCT REVIEWS
// =====================================================

function loadProductReviews() {

    if (!currentProductId) {

        return;

    }


    console.log(
        "Loading Reviews For Product:",
        currentProductId
    );


    fetch(
        reviewApi +
        "/product/" +
        currentProductId
    )

        .then(
            response => {

                console.log(
                    "Get Reviews Status:",
                    response.status
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to load reviews"
                    );

                }


                return response.json();

            }
        )

        .then(
            reviews => {

                console.log(
                    "Product Reviews:",
                    reviews
                );


                displayReviews(
                    reviews
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Review Load Error:",
                    error
                );

            }
        );

}


// =====================================================
// DISPLAY REVIEWS
// =====================================================

function displayReviews(
    reviews
) {

    const reviewGrid =
        document.getElementById(
            "reviewGrid"
        );


    if (!reviewGrid) {

        return;

    }


    reviewGrid.innerHTML =
        "";


    // =================================================
    // NO REVIEWS
    // =================================================

    if (
        !reviews ||
        reviews.length === 0
    ) {

        reviewGrid.innerHTML = `

            <p class="no-reviews">
                No reviews yet. Be the first to review this product.
            </p>

        `;


        updateReviewSummary(
            []
        );


        return;

    }


    // =================================================
    // LOGGED IN CUSTOMER
    // =================================================

    const loggedInCustomer =
        getLoggedInCustomer();


    // =================================================
    // LOOP REVIEWS
    // =================================================

    reviews.forEach(
        review => {

            const customer =
                review.customer;


            const customerName =
                customer?.firstName ||
                customer?.name ||
                customer?.email ||
                "Customer";


            const firstLetter =
                customerName
                    .charAt(0)
                    .toUpperCase();


            const rating =
                Number(
                    review.rating
                );


            const stars =
                "⭐".repeat(
                    rating
                ) +
                "☆".repeat(
                    5 - rating
                );


            // =================================================
            // DATE
            // =================================================

            let reviewDate =
                "Recently";


            if (
                review.createdAt
            ) {

                reviewDate =
                    new Date(
                        review.createdAt
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

            }


            // =================================================
            // CHECK MY REVIEW
            // =================================================

            let isMyReview =
                false;


            if (
                loggedInCustomer &&
                customer
            ) {

                isMyReview =
                    customer.email ===
                    loggedInCustomer.email;

            }


            // =================================================
            // REVIEW ACTIONS
            // =================================================

            let reviewActions =
                "";


            if (isMyReview) {

                reviewActions = `

                    <div class="review-actions">

                        <button
                            type="button"
                            class="edit-review-btn"
                            onclick="editReview(
                                ${review.reviewId},
                                ${review.rating},
                                '${escapeReviewText(
                                    review.comment
                                )}'
                            )">

                            Edit

                        </button>


                        <button
                            type="button"
                            class="delete-review-btn"
                            onclick="deleteReview(
                                ${review.reviewId}
                            )">

                            Delete

                        </button>

                    </div>

                `;

            }


            // =================================================
            // REVIEW CARD
            // =================================================

            reviewGrid.innerHTML += `

                <div class="review-card">

                    <div class="review-header">

                        <div class="review-user">

                            <div class="user-avatar">

                                ${firstLetter}

                            </div>


                            <div>

                                <h4>

                                    ${customerName}

                                </h4>


                                <span class="review-date">

                                    ${reviewDate}

                                </span>

                            </div>

                        </div>


                        <div class="review-stars">

                            ${stars}

                        </div>

                    </div>


                    <p>

                        ${review.comment}

                    </p>


                    ${reviewActions}

                </div>

            `;

        }
    );


    // =================================================
    // UPDATE SUMMARY
    // =================================================

    updateReviewSummary(
        reviews
    );

}


// =====================================================
// UPDATE REVIEW SUMMARY
// =====================================================

function updateReviewSummary(
    reviews
) {

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );


    const overallRating =
        document.querySelector(
            ".overall-rating h3"
        );


    const overallStars =
        document.querySelector(
            ".overall-stars"
        );


    // =================================================
    // NO REVIEWS
    // =================================================

    if (
        !reviews ||
        reviews.length === 0
    ) {

        if (reviewCount) {

            reviewCount.textContent =
                "0";

        }


        if (overallRating) {

            overallRating.textContent =
                "0.0";

        }


        if (overallStars) {

            overallStars.textContent =
                "☆☆☆☆☆";

        }


        updateRatingBars(
            []
        );


        return;

    }


    // =================================================
    // CALCULATE AVERAGE
    // =================================================

    let totalRating =
        0;


    reviews.forEach(
        review => {

            totalRating +=
                Number(
                    review.rating
                );

        }
    );


    const averageRating =
        totalRating /
        reviews.length;


    // =================================================
    // DISPLAY COUNT
    // =================================================

    if (reviewCount) {

        reviewCount.textContent =
            reviews.length;

    }


    // =================================================
    // DISPLAY AVERAGE
    // =================================================

    if (overallRating) {

        overallRating.textContent =
            averageRating.toFixed(
                1
            );

    }


    // =================================================
    // DISPLAY STARS
    // =================================================

    if (overallStars) {

        const rounded =
            Math.round(
                averageRating
            );


        overallStars.textContent =
            "⭐".repeat(
                rounded
            ) +
            "☆".repeat(
                5 - rounded
            );

    }


    // =================================================
    // RATING BARS
    // =================================================

    updateRatingBars(
        reviews
    );

}


// =====================================================
// UPDATE RATING BARS
// =====================================================

function updateRatingBars(
    reviews
) {

    const counts = {

        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0

    };


    // =================================================
    // COUNT RATINGS
    // =================================================

    reviews.forEach(
        review => {

            const rating =
                Number(
                    review.rating
                );


            if (
                counts[rating] !==
                undefined
            ) {

                counts[rating]++;

            }

        }
    );


    const total =
        reviews.length;


    // =================================================
    // RATING ROWS
    // =================================================

    const rows =
        document.querySelectorAll(
            ".rating-row"
        );


    rows.forEach(row => {

            const text = row.children[0] ?.textContent.trim();


            const rating =parseInt(text);


            const percentage = total === 0 ? 0: Math.round((counts[rating] /total) * 100);


            const fill =row.querySelector(".rating-fill");


            const percentageText =row.children[2];


            if (fill) {

                fill.style.width =percentage +"%";

            }


            if (
                percentageText
            ) {

                percentageText.textContent =percentage +"%";
            }

        }
    );

}