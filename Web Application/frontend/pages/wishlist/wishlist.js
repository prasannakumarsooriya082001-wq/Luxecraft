console.log("Wishlist JS Loaded");


// =====================================================
// API
// =====================================================

const wishlistApi =
    `${API_BASE_URL}/wishlist`;

const cartApi =
    `${API_BASE_URL}/cart`;


// =====================================================
// GET LOGGED IN CUSTOMER
// =====================================================

function getLoggedInCustomer() {

    return JSON.parse(
        localStorage.getItem("loggedInCustomer")
    );

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Wishlist Page Loaded");

        setupNavbar();

        loadWishlist();

    }
);


// =====================================================
// NAVBAR
// =====================================================

function setupNavbar() {

    const customer =
        getLoggedInCustomer();


    const loginButton =
        document.querySelector(".login-btn");


    const signUpButton =
        document.querySelector(".signup-btn");


    const cartButton =
        document.querySelector(".cart");


    // =================================================
    // GUEST USER
    // =================================================

    if (!customer) {

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


                    window.location.href =
                        "/frontend/index.html";

                };

        }

    }


    // =================================================
    // CART BUTTON
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
// LOAD WISHLIST
// =====================================================

function loadWishlist() {

    const customer =
        getLoggedInCustomer();


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!customer) {

        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    // =================================================
    // TOKEN CHECK
    // =================================================

    if (!customer.token) {

        alert(
            "Session expired. Please login again."
        );


        localStorage.removeItem(
            "loggedInCustomer"
        );


        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    console.log(
        "Loading wishlist from backend..."
    );


    // =================================================
    // GET WISHLIST
    // =================================================

    fetch(
        wishlistApi +
        "/my-wishlist",
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token

            }

        }

    )

        .then(response => {

            console.log(
                "Wishlist API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load wishlist"
                );

            }


            return response.json();

        })

        .then(wishlist => {

            console.log(
                "Backend Wishlist:",
                wishlist
            );


            displayWishlist(
                wishlist
            );

        })

        .catch(error => {

            console.error(
                "Wishlist Error:",
                error
            );


            const container =
                document.getElementById(
                    "wishlistContainer"
                );


            if (container) {

                container.innerHTML = `

                    <div class="empty-wishlist">

                        <div class="empty-icon">
                            ❤️
                        </div>

                        <h2>
                            Unable to load wishlist
                        </h2>

                        <p>
                            Please try again later.
                        </p>

                    </div>

                `;

            }

        });

}


// =====================================================
// DISPLAY WISHLIST
// =====================================================

function displayWishlist(wishlist) {

    const wishlistContainer =
        document.getElementById(
            "wishlistContainer"
        );


    if (!wishlistContainer) {

        console.error(
            "Wishlist container not found"
        );

        return;

    }


    wishlistContainer.innerHTML = "";


    // =================================================
    // EMPTY WISHLIST
    // =================================================

    if (
        !wishlist ||
        wishlist.length === 0
    ) {

        wishlistContainer.innerHTML = `

            <div class="empty-wishlist">

                <div class="empty-icon">

                    <i class="fa-regular fa-heart"></i>

                </div>


                <h2>
                    Your Wishlist is Empty
                </h2>


                <p>
                    You haven't saved any products yet.
                    Explore our premium collection and
                    add your favorite sofas.
                </p>


                <a
                    href="/frontend/pages/products/products.html"
                    class="shop-btn"
                >
                    Explore Products
                </a>

            </div>

        `;

        return;

    }


    // =================================================
    // DISPLAY WISHLIST ITEMS
    // =================================================

    wishlist.forEach(
        wishlistItem => {

            wishlistContainer.innerHTML +=
                createWishlistCard(
                    wishlistItem
                );

        }
    );

}


// =====================================================
// CREATE WISHLIST CARD
// =====================================================

function createWishlistCard(
    wishlistItem
) {

    console.log(
        "Wishlist Item:",
        wishlistItem
    );


    // =================================================
    // GET PRODUCT
    // =================================================

    const product =
        wishlistItem.product;


    if (!product) {

        console.error(
            "Product missing in wishlist item:",
            wishlistItem
        );


        return "";

    }


    // =================================================
    // IMAGE
    // =================================================

    const imageUrl =
        product.imageUrl
            ? `${API_BASE_URL}/uploads/` +
              product.imageUrl.trim()
            : "/frontend/assets/images/sofa1.jpg";


    // =================================================
    // DESCRIPTION
    // =================================================

    const description =
        product.description
            ? product.description
            : "Premium luxury sofa crafted for comfort and elegant living.";


    // =================================================
    // PRICE
    // =================================================

    const price =
        Number(product.price)
            .toLocaleString("en-IN");


    // =================================================
    // CARD
    // =================================================

    return `

        <div
            class="wishlist-card"
            id="wishlist-${wishlistItem.wishlistId}"
        >


            <!-- ================= IMAGE ================= -->

            <img
                src="${imageUrl}"
                alt="${product.productName}"
                onerror="
                    this.onerror=null;
                    this.src='/frontend/assets/images/sofa1.jpg';
                "
            >


            <!-- ================= DETAILS ================= -->

            <div class="wishlist-details">


                <h3>
                    ${product.productName}
                </h3>


                <p>
                    ${description}
                </p>


                <h4>
                    ₹${price}
                </h4>


                <div class="wishlist-buttons">


                    <!-- ================= VIEW ================= -->

                    <button
                        class="view-btn"
                        onclick="
                            viewProduct(
                                ${product.productId}
                            )
                        "
                    >
                        View Details
                    </button>


                    <!-- ================= CART ================= -->

                    <button
                        class="cart-btn"
                        onclick="
                            addWishlistToCart(
                                ${product.productId}
                            )
                        "
                    >
                        Add To Cart
                    </button>


                    <!-- ================= REMOVE ================= -->

                    <button
                        class="remove-btn"
                        onclick="
                            removeFromWishlist(
                                ${product.productId}
                            )
                        "
                    >
                        Remove
                    </button>


                </div>

            </div>

        </div>

    `;

}


// =====================================================
// VIEW PRODUCT
// =====================================================

function viewProduct(
    productId
) {

    window.location.href =
        "/frontend/pages/product-details/product-details.html?id=" +
        productId;

}


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

function removeFromWishlist(
    productId
) {

    const customer =
        getLoggedInCustomer();


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!customer) {

        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    // =================================================
    // TOKEN CHECK
    // =================================================

    if (!customer.token) {

        alert(
            "Session expired. Please login again."
        );

        return;

    }


    console.log(
        "Removing Product ID:",
        productId
    );


    // =================================================
    // DELETE WISHLIST API
    // =================================================

    fetch(
        wishlistApi +
        "/remove/" +
        productId,
        {

            method: "DELETE",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token

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
                "Remove Response:",
                message
            );


            alert(
                "Product removed from wishlist ❤️"
            );


            // Reload wishlist

            loadWishlist();

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


// =====================================================
// ADD WISHLIST PRODUCT TO CART
// =====================================================

function addWishlistToCart(
    productId
) {

    const customer =
        getLoggedInCustomer();


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!customer) {

        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    // =================================================
    // TOKEN CHECK
    // =================================================

    if (!customer.token) {

        alert(
            "Session expired. Please login again."
        );

        localStorage.removeItem(
            "loggedInCustomer"
        );


        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    console.log(
        "Adding wishlist product to cart:",
        productId
    );


    // =================================================
    // CART API
    // =================================================

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

        .then(response => {

            console.log(
                "Cart API Status:",
                response.status
            );


            if (!response.ok) {

                return response.text()
                    .then(message => {

                        throw new Error(
                            message ||
                            "Failed to add product to cart"
                        );

                    });

            }


            return response.json();

        })

        .then(cartItem => {

            console.log(
                "Cart Item:",
                cartItem
            );


            alert(
                "Product added to cart successfully! 🛒"
            );

        })

        .catch(error => {

            console.error(
                "Cart Error:",
                error
            );


            alert(
                error.message ||
                "Unable to add product to cart."
            );

        });

}