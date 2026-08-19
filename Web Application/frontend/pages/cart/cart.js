console.log("Cart JS Loaded");


// =====================================================
// LOGGED IN CUSTOMER
// =====================================================

let loggedInCustomer =
    JSON.parse(
        localStorage.getItem("loggedInCustomer")
    );


// =====================================================
// CART API
// =====================================================

const cartApi =
    `${API_BASE_URL}/cart`;


// =====================================================
// NAVBAR ELEMENTS
// =====================================================

const loginButton =
    document.getElementById("login-btn");

const signUpButton =
    document.getElementById("signup-btn");

const cartButton =
    document.getElementById("cart-btn");

const cartBadge =
    document.getElementById("cartBadge");


// =====================================================
// CART ELEMENTS
// =====================================================

const cartItemsContainer =
    document.getElementById("cartItems");

const subtotalElement =
    document.getElementById("subtotal");

const shippingElement =
    document.getElementById("shipping");

const taxElement =
    document.getElementById("tax");

const totalElement =
    document.getElementById("total");

const checkoutButton =
    document.getElementById("checkoutBtn");


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Cart Page Loaded");


        // Navbar
        setupNavbar();


        // Cart
        loadCart();


        // Checkout
        setupCheckout();

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
        // LOGIN
        // -----------------------------

        if (loginButton) {

            loginButton.textContent =
                "Login";


            loginButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/login/login.html";

                };

        }


        // -----------------------------
        // SIGN UP
        // -----------------------------

        if (signUpButton) {

            signUpButton.textContent =
                "Sign Up";


            signUpButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/register/register.html";

                };

        }


        // -----------------------------
        // CART
        // -----------------------------

        if (cartButton) {

            cartButton.onclick =
                function () {

                    window.location.href =
                        "/frontend/pages/login/login.html";

                };

        }


        return;

    }


    // =================================================
    // LOGGED IN USER
    // =================================================

    console.log(
        "Logged In Customer:",
        loggedInCustomer
    );


    // =================================================
    // PROFILE
    // =================================================

    if (loginButton) {

        loginButton.textContent =
            loggedInCustomer.firstName ||
            loggedInCustomer.email ||
            "Profile";


        loginButton.onclick =
            function () {

                window.location.href =
                    "/frontend/pages/profile/profile.html";

            };

    }


    // =================================================
    // LOGOUT
    // =================================================

    if (signUpButton) {

        signUpButton.textContent =
            "Logout";


        signUpButton.onclick =
            function () {

                localStorage.removeItem(
                    "loggedInCustomer"
                );


                window.location.href =
                    "/frontend/pages/home/index.html";

            };

    }


    // =================================================
    // CART
    // =================================================

    if (cartButton) {

        cartButton.onclick =
            function () {

                window.location.href =
                    "/frontend/pages/cart/cart.html";

            };

    }

}


// =====================================================
// LOAD CART
// =====================================================

function loadCart() {

    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!loggedInCustomer) {

        console.log(
            "User not logged in"
        );


        showLoginMessage();


        return;

    }


    // =================================================
    // TOKEN CHECK
    // =================================================

    if (!loggedInCustomer.token) {

        console.log(
            "JWT token not found"
        );


        localStorage.removeItem(
            "loggedInCustomer"
        );


        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    console.log(
        "Loading cart for:",
        loggedInCustomer.email
    );


    // =================================================
    // GET CURRENT USER CART
    // =================================================

    fetch(
        cartApi,
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
                "Cart API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load cart"
                );

            }


            return response.json();

        })


        .then(cartItems => {

            console.log(
                "Current User Cart:",
                cartItems
            );


            displayCart(cartItems);


            updateCartBadge(cartItems);

        })


        .catch(error => {

            console.error(
                "Cart Error:",
                error
            );


            cartItemsContainer.innerHTML = `

                <div class="empty-cart">

                    <h2>
                        Unable to load cart
                    </h2>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;

        });

}


// =====================================================
// DISPLAY CART
// =====================================================

function displayCart(cartItems) {

    if (!cartItemsContainer) {

        console.error(
            "cartItems element not found"
        );


        return;

    }


    // Clear old content

    cartItemsContainer.innerHTML = "";


    // =================================================
    // EMPTY CART
    // =================================================

    if (
        !cartItems ||
        cartItems.length === 0
    ) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <h2>
                    Your Cart is Empty
                </h2>

                <p>
                    You haven't added any products yet.
                </p>

                <button
                    onclick="goToProducts()">

                    Continue Shopping

                </button>

            </div>

        `;


        updateSummary(0);


        return;

    }


    // =================================================
    // CART ITEMS
    // =================================================

    let subtotal = 0;


    cartItems.forEach(item => {


        const itemTotal =
            Number(item.price) *
            Number(item.quantity);


        subtotal += itemTotal;


        cartItemsContainer.innerHTML += `

            <div
                class="cart-item"
                id="cart-item-${item.cartId}">


                <!-- ================= IMAGE ================= -->

                <div class="cart-image">

                    <img
                        src="${API_BASE_URL}/uploads/${item.imageUrl}"
                        alt="${item.productName}">

                </div>


                <!-- ================= PRODUCT INFO ================= -->

                <div class="cart-info">

                    <h3>
                        ${item.productName}
                    </h3>


                    <p class="cart-price">

                        ₹${item.price}

                    </p>

                </div>


                <!-- ================= QUANTITY ================= -->

                <div class="quantity-box">

                    <button
                        onclick="
                            decreaseQuantity(
                                ${item.cartId},
                                ${item.quantity}
                            )
                        ">

                        -

                    </button>


                    <span>

                        ${item.quantity}

                    </span>


                    <button
                        onclick="
                            increaseQuantity(
                                ${item.cartId},
                                ${item.quantity}
                            )
                        ">

                        +

                    </button>

                </div>


                <!-- ================= ITEM TOTAL ================= -->

                <div class="item-total">

                    ₹${itemTotal}

                </div>


                <!-- ================= REMOVE ================= -->

                <button
                    class="remove-btn"
                    onclick="
                        removeCartItem(
                            ${item.cartId}
                        )
                    ">

                    <i class="fa-solid fa-trash"></i>

                </button>


            </div>

        `;

    });


    // =================================================
    // UPDATE SUMMARY
    // =================================================

    updateSummary(subtotal);

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary(subtotal) {

    // Shipping

    const shipping = 0;


    // Tax

    const tax =
        subtotal * 0.05;


    // Final total

    const total =
        subtotal +
        shipping +
        tax;


    // =================================================
    // HTML UPDATE
    // =================================================

    if (subtotalElement) {

        subtotalElement.textContent =
            "₹" + subtotal.toFixed(2);

    }


    if (shippingElement) {

        shippingElement.textContent =
            "Free";

    }


    if (taxElement) {

        taxElement.textContent =
            "₹" + tax.toFixed(2);

    }


    if (totalElement) {

        totalElement.textContent =
            "₹" + total.toFixed(2);

    }

}


// =====================================================
// UPDATE CART BADGE
// =====================================================

function updateCartBadge(cartItems) {

    if (!cartBadge) {

        return;

    }


    let totalQuantity = 0;


    cartItems.forEach(item => {

        totalQuantity +=
            Number(item.quantity);

    });


    cartBadge.textContent =
        totalQuantity;

}


// =====================================================
// INCREASE QUANTITY
// =====================================================

function increaseQuantity(
    cartId,
    currentQuantity
) {

    const newQuantity =
        Number(currentQuantity) + 1;


    updateQuantity(
        cartId,
        newQuantity
    );

}


// =====================================================
// DECREASE QUANTITY
// =====================================================

function decreaseQuantity(
    cartId,
    currentQuantity
) {

    const quantity =
        Number(currentQuantity);


    if (quantity <= 1) {

        return;

    }


    const newQuantity =
        quantity - 1;


    updateQuantity(
        cartId,
        newQuantity
    );

}


// =====================================================
// UPDATE QUANTITY API
// =====================================================

function updateQuantity(
    cartId,
    quantity
) {

    if (
        !loggedInCustomer ||
        !loggedInCustomer.token
    ) {

        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    console.log(
        "Updating Cart:",
        cartId,
        quantity
    );


    fetch(
        cartApi +
        "/update/" +
        cartId +
        "?quantity=" +
        quantity,
        {

            method: "PUT",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInCustomer.token

            }

        }
    )


        .then(response => {

            console.log(
                "Update Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Quantity update failed"
                );

            }


            return response.json();

        })


        .then(updatedCart => {

            console.log(
                "Updated Cart Item:",
                updatedCart
            );


            // Reload cart

            loadCart();

        })


        .catch(error => {

            console.error(
                "Quantity Update Error:",
                error
            );


            alert(
                "Unable to update quantity"
            );

        });

}


// =====================================================
// REMOVE CART ITEM
// =====================================================

function removeCartItem(cartId) {

    if (
        !loggedInCustomer ||
        !loggedInCustomer.token
    ) {

        window.location.href =
            "/frontend/pages/login/login.html";


        return;

    }


    const confirmRemove =
        confirm(
            "Are you sure you want to remove this product?"
        );


    if (!confirmRemove) {

        return;

    }


    console.log(
        "Removing Cart ID:",
        cartId
    );


    fetch(
        cartApi +
        "/remove/" +
        cartId,
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
                "Remove Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Remove cart failed"
                );

            }


            return response.text();

        })


        .then(message => {

            console.log(
                "Remove Response:",
                message
            );


            // Reload cart

            loadCart();

        })


        .catch(error => {

            console.error(
                "Remove Cart Error:",
                error
            );


            alert(
                "Unable to remove product"
            );

        });

}


// =====================================================
// CHECKOUT
// =====================================================

function setupCheckout() {

    if (!checkoutButton) {

        return;

    }


    checkoutButton.onclick =
        function () {

            // -----------------------------
            // Login Check
            // -----------------------------

            if (!loggedInCustomer) {

                window.location.href =
                    "/frontend/pages/login/login.html";


                return;

            }


            // -----------------------------
            // Check Cart
            // -----------------------------

            const totalText =
                totalElement
                    ? totalElement.textContent
                    : "₹0";


            const totalValue =
                parseFloat(
                    totalText.replace(
                        "₹",
                        ""
                    )
                );


            if (
                isNaN(totalValue) ||
                totalValue <= 0
            ) {

                alert(
                    "Your cart is empty."
                );


                return;

            }


            // -----------------------------
            // Checkout
            // -----------------------------

            window.location.href =
                "/frontend/pages/checkout/checkout.html";

        };

}


// =====================================================
// CONTINUE SHOPPING
// =====================================================

function goToProducts() {

    window.location.href =
        "/frontend/pages/products/products.html";

}


// =====================================================
// LOGIN MESSAGE
// =====================================================

function showLoginMessage() {

    if (!cartItemsContainer) {

        return;

    }


    cartItemsContainer.innerHTML = `

        <div class="empty-cart">

            <i class="fa-solid fa-user"></i>

            <h2>
                Please Login
            </h2>

            <p>
                Login to view your shopping cart.
            </p>

            <button
                onclick="
                    window.location.href =
                    '/frontend/pages/login/login.html'
                ">

                Login

            </button>

        </div>

    `;


    updateSummary(0);


    if (cartBadge) {

        cartBadge.textContent =
            "0";

    }

}


// console.log("Cart JS Loaded");


// window.onload = function () {

//     loadCart();

// };


// function loadCart() {

//     const loggedInCustomer =
//         JSON.parse(localStorage.getItem("loggedInCustomer"));

//     if (!loggedInCustomer) {

//         window.location.href =
//             "/frontend/pages/login/login.html";

//         return;
//     }


//     fetch(`${API_BASE_URL}/cart`, {

//         method: "GET",

//         headers: {

//             "Authorization":"Bearer " + loggedInCustomer.token
//         }

//     })

//         .then(response => {

//             if (!response.ok) {

//                 throw new Error("Failed to load cart");

//             }

//             return response.json();

//         })

//         .then(cart => {

//             console.log("Cart:", cart);

//             displayCart(cart);

//         })

//         .catch(error => {

//             console.error("Cart Error:", error);

//         });

// }




// function displayCart(cart) {

//     const cartItems = document.getElementById("cartItems");

//     cartItems.innerHTML = "";

//     if (cart.length === 0) {

//         cartItems.innerHTML = `
//             <div class="empty-cart">
//                 <h2>Your Cart is Empty</h2>
//                 <p>Add some products to your cart.</p>
//             </div>
//         `;

//         updateSummary(cart);

//         return;
//     }

//     cart.forEach(item => {

//         cartItems.innerHTML += `

//         <div class="cart-item">

//             <img src="${API_BASE_URL}/uploads/${item.imageUrl}">

//             <div class="item-details">

//                 <h3>${item.productName}</h3>

//                 <span class="price">
//                     ₹${item.price}
//                 </span>

//             </div>

//             <div class="quantity">

//                 <button onclick="decreaseQuantity(${item.cartId}, ${item.quantity})">
//                     -
//                 </button>

//                 <span>${item.quantity}</span>

//                 <button onclick="increaseQuantity(${item.cartId}, ${item.quantity})">
//                     +
//                 </button>

//             </div>

//             <div class="total-price">

//                 ₹${item.price * item.quantity}

//             </div>

//             <button
//                 class="remove-btn"
//                 onclick="removeItem(${item.cartId})">

//                 🗑

//             </button>

//         </div>

//         `;

//     });

//     updateSummary(cart);

// }



// function updateSummary(cart) {

//     let subtotal = 0;

//     cart.forEach(item => {
//         subtotal += item.price * item.quantity;

//     });

//     let tax = subtotal * 0.05;

//     let total = subtotal + tax;

//     document.getElementById("subtotal").textContent =
//         "₹" + subtotal.toFixed(2);

//     document.getElementById("tax").textContent =
//         "₹" + tax.toFixed(2);

//     document.getElementById("total").textContent =
//         "₹" + total.toFixed(2);

// }



// function increaseQuantity(cartId, currentQuantity) {

//     const loggedInCustomer =
//         JSON.parse(localStorage.getItem("loggedInCustomer"));

//     const newQuantity = currentQuantity + 1;

//     fetch(
//         `${API_BASE_URL}/cart/update/`
//         + cartId
//         + "?quantity="
//         + newQuantity,
//         {

//             method: "PUT",

//             headers: {

//                 "Authorization":
//                     "Bearer " + loggedInCustomer.token

//             }

//         }
//     )

//         .then(response => {

//             if (!response.ok) {

//                 throw new Error("Quantity update failed");

//             }

//             return response.json();

//         })

//         .then(() => {

//             loadCart();

//         })

//         .catch(error => {

//             console.error("Quantity Error:", error);

//         });

// }



// function decreaseQuantity(cartId, currentQuantity) {

//     if (currentQuantity <= 1) {

//         return;

//     }

//     const loggedInCustomer =
//         JSON.parse(localStorage.getItem("loggedInCustomer"));

//     const newQuantity = currentQuantity - 1;

//     fetch(
//         `${API_BASE_URL}/cart/update/`
//         + cartId
//         + "?quantity="
//         + newQuantity,
//         {

//             method: "PUT",

//             headers: {

//                 "Authorization":
//                     "Bearer " + loggedInCustomer.token

//             }

//         }
//     )

//         .then(response => {

//             if (!response.ok) {

//                 throw new Error("Quantity update failed");

//             }

//             return response.json();

//         })

//         .then(() => {

//             loadCart();

//         })

//         .catch(error => {

//             console.error("Quantity Error:", error);

//         });

// }



// function removeItem(cartId) {

//     const loggedInCustomer =
//         JSON.parse(localStorage.getItem("loggedInCustomer"));

//     fetch(
//         `${API_BASE_URL}/cart/remove/`
//         + cartId,
//         {

//             method: "DELETE",

//             headers: {

//                 "Authorization":
//                     "Bearer " + loggedInCustomer.token

//             }

//         }
//     )

//         .then(response => {

//             if (!response.ok) {

//                 throw new Error("Remove failed");

//             }

//             return response.text();

//         })

//         .then(message => {

//             console.log(message);

//             loadCart();

//         })

//         .catch(error => {

//             console.error("Remove Error:", error);

//         });

// }


// // ================= PROCEED TO CHECKOUT =================

// const checkoutBtn =
//     document.getElementById("checkoutBtn");


// checkoutBtn.addEventListener("click", function () {

//     const loggedInCustomer =
//         JSON.parse(localStorage.getItem("loggedInCustomer"));


//     // Login check

//     if (!loggedInCustomer) {

//         window.location.href =
//             "/frontend/pages/login/login.html";

//         return;

//     }


//     // Check whether cart has items

//     fetch(`${API_BASE_URL}/cart`, {

//         method: "GET",

//         headers: {

//             "Authorization":
//                 "Bearer " + loggedInCustomer.token

//         }

//     })

//     .then(response => {

//         if (!response.ok) {

//             throw new Error("Unable to check cart");

//         }

//         return response.json();

//     })

//     .then(cart => {

//         if (cart.length === 0) {

//             alert("Your cart is empty!");

//             return;

//         }


//         // Cart has products

//         window.location.href =
//             "/frontend/pages/checkout/checkout.html";

//     })

//     .catch(error => {

//         console.error(
//             "Checkout Error:",
//             error
//         );

//         alert(
//             "Unable to proceed to checkout"
//         );

//     });

// });