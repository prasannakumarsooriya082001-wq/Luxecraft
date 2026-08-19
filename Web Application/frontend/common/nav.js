document.addEventListener("DOMContentLoaded", function () {

    console.log("Navbar JS Loaded");


    // =====================================================
    // GET LOGGED IN CUSTOMER
    // =====================================================

    let loggedInCustomer =
        JSON.parse(
            localStorage.getItem("loggedInCustomer")
        );


    // =====================================================
    // NAVBAR ELEMENTS
    // =====================================================

    const loginButton =
        document.getElementById("loginButton");

    const signupButton =
        document.getElementById("signupButton");

    const profileButton =
        document.getElementById("profileButton");

    const profileName =
        document.getElementById("profileName");

    const logoutButton =
        document.getElementById("logoutButton");

    const cartButton =
        document.getElementById("cartButton");

    const cartBadge =
        document.getElementById("cartBadge");


    // =====================================================
    // INITIALIZE NAVBAR
    // =====================================================

    setupNavbar();


    // =====================================================
    // CART BADGE
    // =====================================================

    if (
        loggedInCustomer &&
        loggedInCustomer.token
    ) {

        loadCartCount();

    }
    else {

        updateCartBadge(0);

    }


    // =====================================================
    // CART BUTTON
    // =====================================================

    if (cartButton) {

        cartButton.addEventListener(
            "click",
            function () {

                const customer =
                    JSON.parse(
                        localStorage.getItem(
                            "loggedInCustomer"
                        )
                    );


                // User not logged in

                if (
                    !customer ||
                    !customer.token
                ) {

                    window.location.href =
                        "/frontend/pages/login/login.html";

                    return;

                }


                // User logged in

                window.location.href =
                    "/frontend/pages/cart/cart.html";

            }
        );

    }


    // =====================================================
    // LOGIN BUTTON
    // =====================================================

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/frontend/pages/login/login.html";

            }
        );

    }


    // =====================================================
    // SIGN UP BUTTON
    // =====================================================

    if (signupButton) {

        signupButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/frontend/pages/register/register.html";

            }
        );

    }


    // =====================================================
    // PROFILE BUTTON
    // =====================================================

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/frontend/pages/profile/profile.html";

            }
        );

    }


    // =====================================================
    // LOGOUT BUTTON
    // =====================================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {

                    return;

                }


                // Remove login data

                localStorage.removeItem(
                    "loggedInCustomer"
                );


                // Remove temporary order/payment data

                localStorage.removeItem(
                    "lastOrderId"
                );

                localStorage.removeItem(
                    "lastPaymentId"
                );

                localStorage.removeItem(
                    "lastRazorpayOrderId"
                );


                // Reset cart badge

                updateCartBadge(0);


                // Go Home

                window.location.href =
                    "/frontend/pages/home/index.html";

            }
        );

    }

});


// =========================================================
// SETUP NAVBAR
// =========================================================

function setupNavbar() {

    const loggedInCustomer =
        JSON.parse(
            localStorage.getItem(
                "loggedInCustomer"
            )
        );


    // =====================================================
    // GET ELEMENTS
    // =====================================================

    const loginButton =
        document.getElementById("loginButton");

    const signupButton =
        document.getElementById("signupButton");

    const profileButton =
        document.getElementById("profileButton");

    const profileName =
        document.getElementById("profileName");

    const logoutButton =
        document.getElementById("logoutButton");


    // =====================================================
    // GUEST USER
    // =====================================================

    if (
        !loggedInCustomer ||
        !loggedInCustomer.token
    ) {

        console.log("Guest User");


        // Show Login

        if (loginButton) {

            loginButton.style.display =
                "inline-block";

        }


        // Show Sign Up

        if (signupButton) {

            signupButton.style.display =
                "inline-block";

        }


        // Hide Profile

        if (profileButton) {

            profileButton.style.display =
                "none";

        }


        // Hide Logout

        if (logoutButton) {

            logoutButton.style.display =
                "none";

        }


        return;

    }


    // =====================================================
    // LOGGED IN USER
    // =====================================================

    console.log(
        "Logged In Customer:",
        loggedInCustomer
    );


    // =====================================================
    // GET CUSTOMER NAME
    // =====================================================

    const firstName =
        loggedInCustomer.firstName || "";

    const lastName =
        loggedInCustomer.lastName || "";

    const email =
        loggedInCustomer.email || "";


    let displayName = "";


    // First name available

    if (firstName) {

        displayName =
            firstName;

    }


    // Otherwise email username

    else if (email) {

        displayName =
            email.split("@")[0];

    }


    // Otherwise Profile

    else {

        displayName =
            "Profile";

    }


    console.log(
        "Navbar Display Name:",
        displayName
    );


    // =====================================================
    // HIDE LOGIN
    // =====================================================

    if (loginButton) {

        loginButton.style.display =
            "none";

    }


    // =====================================================
    // HIDE SIGN UP
    // =====================================================

    if (signupButton) {

        signupButton.style.display =
            "none";

    }


    // =====================================================
    // SHOW PROFILE
    // =====================================================

    if (profileButton) {

        profileButton.style.display =
            "inline-flex";

    }


    // =====================================================
    // SET PROFILE NAME
    // =====================================================

    if (profileName) {

        profileName.textContent =
            displayName;

    }


    // =====================================================
    // SHOW LOGOUT
    // =====================================================

    if (logoutButton) {

        logoutButton.style.display =
            "inline-flex";

    }

}


// =========================================================
// LOAD CART COUNT
// =========================================================

function loadCartCount() {

    const customer =
        JSON.parse(
            localStorage.getItem(
                "loggedInCustomer"
            )
        );


    // No customer

    if (
        !customer ||
        !customer.token
    ) {

        updateCartBadge(0);

        return;

    }


    console.log(
        "Loading Cart Count..."
    );


    // =====================================================
    // CART API
    // =====================================================

    fetch(
        `${API_BASE_URL}/cart`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    customer.token,

                "Content-Type":
                    "application/json"

            }

        }
    )


        // =================================================
        // RESPONSE
        // =================================================

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


        // =================================================
        // CART DATA
        // =================================================

        .then(cartItems => {

            console.log(
                "Navbar Cart Items:",
                cartItems
            );


            updateCartBadge(
                cartItems
            );

        })


        // =================================================
        // ERROR
        // =================================================

        .catch(error => {

            console.error(
                "Cart Count Error:",
                error
            );


            updateCartBadge(0);

        });

}


// =========================================================
// UPDATE CART BADGE
// =========================================================

function updateCartBadge(cartItems) {

    const cartBadge =
        document.getElementById(
            "cartBadge"
        );


    if (!cartBadge) {

        return;

    }


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (
        !cartItems ||
        !Array.isArray(cartItems) ||
        cartItems.length === 0
    ) {

        cartBadge.textContent =
            "0";

        return;

    }


    // =====================================================
    // CALCULATE TOTAL QUANTITY
    // =====================================================

    let totalQuantity = 0;


    cartItems.forEach(item => {

        totalQuantity +=
            Number(
                item.quantity || 0
            );

    });


    // =====================================================
    // UPDATE BADGE
    // =====================================================

    cartBadge.textContent =
        totalQuantity;

}