console.log("Checkout JS Loaded");


// =====================================================
// LOGGED IN CUSTOMER
// =====================================================

const loggedInCustomer =
    JSON.parse(localStorage.getItem("loggedInCustomer"));


// =====================================================
// LOGIN CHECK
// =====================================================

if (!loggedInCustomer || !loggedInCustomer.token) {

    alert("Please login to continue.");

    window.location.href =
        "/pages/login/login.html";
}


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let checkoutCart = [];

let checkoutSubtotal = 0;

let checkoutTax = 0;

let checkoutTotal = 0;


// =====================================================
// COUPON
//
// Holds the server's answer after a successful apply. Only the code is
// ever sent when placing the order - the backend recalculates the
// discount from the real cart, so this is display state only.
// =====================================================

let appliedCoupon = null;


document.addEventListener("DOMContentLoaded", function () {

    const applyBtn =
        document.getElementById("applyCouponBtn");

    if (applyBtn) {

        applyBtn.addEventListener("click", applyCoupon);

    }

});


function setCouponMessage(text, isError) {

    const messageEl =
        document.getElementById("couponMessage");

    if (!messageEl) {
        return;
    }

    messageEl.textContent = text || "";

    messageEl.className =
        "coupon-message" + (isError ? " error" : " success");

}


function applyCoupon() {

    const input =
        document.getElementById("couponInput");

    const code = input ? input.value.trim() : "";


    if (!code) {

        setCouponMessage("Enter a coupon code.", true);

        return;

    }


    // Already applied? Treat the button as "remove".
    if (appliedCoupon && appliedCoupon.code === code.toUpperCase()) {

        appliedCoupon = null;

        input.value = "";

        setCouponMessage("Coupon removed.", false);
            displayCheckoutCart(checkoutCart);

        return;

    }


    const applyBtn =
        document.getElementById("applyCouponBtn");

    if (applyBtn) {
        applyBtn.disabled = true;
    }


    fetch(
        `${API_BASE_URL}/coupon/apply?code=` + encodeURIComponent(code),
        {
            method: "POST",
            headers: customerAuthHeaders()
        }
    )

        .then(response => {

            return response.json().then(body => {

                if (!response.ok) {

                    throw new Error(
                        body.message || "That coupon could not be applied."
                    );

                }

                return body;

            });

        })

        .then(result => {

            appliedCoupon = result;

            setCouponMessage(result.message, false);

            const label =
                document.getElementById("discountLabel");

            if (label) {
                label.textContent = "Discount (" + result.code + ")";
            }
            displayCheckoutCart(checkoutCart);

        })

        .catch(error => {

            appliedCoupon = null;

            setCouponMessage(error.message, true);
            displayCheckoutCart(checkoutCart);

        })

        .finally(() => {

            if (applyBtn) {
                applyBtn.disabled = false;
            }

        });

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener("load", function () {

    console.log("Checkout Page Loaded");

    loadCustomerDetails();

    loadCheckoutCart();

});


// =====================================================
// LOAD CUSTOMER DETAILS
// =====================================================

function loadCustomerDetails() {

    if (!loggedInCustomer) {
        return;
    }

    console.log(
        "Logged in Customer:",
        loggedInCustomer
    );


    // First Name
    if (loggedInCustomer.firstName) {

        document.getElementById("firstName").value =
            loggedInCustomer.firstName;

    }


    // Last Name
    if (loggedInCustomer.lastName) {

        document.getElementById("lastName").value =
            loggedInCustomer.lastName;

    }


    // Email
    if (loggedInCustomer.email) {

        document.getElementById("email").value =
            loggedInCustomer.email;

    }


    // Phone
    if (loggedInCustomer.phone) {

        document.getElementById("phone").value =
            loggedInCustomer.phone;

    }

}


// =====================================================
// LOAD CART FROM DATABASE
// =====================================================

async function loadCheckoutCart() {

    try {

        console.log(
            "Loading checkout cart..."
        );


        const response = await fetch(
            `${API_BASE_URL}/cart`,
            {

                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " +
                        loggedInCustomer.token

                }

            }
        );


        console.log(
            "Checkout Cart API Status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to load cart"
            );

        }


        const cart =
            await response.json();


        console.log(
            "Checkout Cart:",
            cart
        );


        checkoutCart = cart;


        displayCheckoutCart(cart);

    }
    catch (error) {

        console.error(
            "Checkout Cart Error:",
            error
        );


        alert(
            error.message ||
            "Unable to load cart."
        );

    }

}


// =====================================================
// DISPLAY CHECKOUT CART
// =====================================================

function displayCheckoutCart(cart) {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );


    checkoutItems.innerHTML = "";


    // =================================================
    // EMPTY CART
    // =================================================

    if (!cart || cart.length === 0) {

        checkoutItems.innerHTML = `

            <p class="empty-cart">
                Your cart is empty.
            </p>

        `;


        document.getElementById(
            "checkoutSubtotal"
        ).textContent = "₹0.00";


        document.getElementById(
            "checkoutShipping"
        ).textContent = "Free";


        document.getElementById(
            "checkoutTax"
        ).textContent = "₹0.00";


        document.getElementById(
            "checkoutDiscount"
        ).textContent = "₹0.00";


        document.getElementById(
            "checkoutTotal"
        ).textContent = "₹0.00";


        checkoutSubtotal = 0;

        checkoutTax = 0;

        checkoutTotal = 0;


        return;

    }


    // =================================================
    // CALCULATE SUBTOTAL
    // =================================================

    checkoutSubtotal = 0;


    cart.forEach(item => {

        const price =
            Number(item.price);

        const quantity =
            Number(item.quantity);


        const itemTotal =
            price * quantity;


        checkoutSubtotal += itemTotal;


        const div =
            document.createElement("div");


        div.classList.add(
            "summary-item"
        );


        div.innerHTML = `

            <img
                src="${API_BASE_URL}/uploads/${item.imageUrl}"
                alt="${item.productName}"
            >

            <div class="summary-product">

                <h4>
                    ${item.productName}
                </h4>

                <p>
                    Qty: ${quantity}
                </p>

            </div>

            <span>
                ₹${itemTotal.toFixed(2)}
            </span>

        `;


        checkoutItems.appendChild(div);

    });


    // =================================================
    // SHIPPING
    // =================================================

    const shipping = 0;


    // =================================================
    // DISCOUNT
    // =================================================

    const discount = appliedCoupon
        ? appliedCoupon.discountAmount
        : 0;


    // =================================================
    // TAX
    // =================================================

    // The backend takes the discount off first and then charges tax on
    // what is left. Mirror that exactly, otherwise the total shown here
    // would not match the amount actually charged.

    const discountedSubtotal = checkoutSubtotal - discount;

    checkoutTax =
        discountedSubtotal * 0.05;


    // =================================================
    // FINAL TOTAL
    // =================================================

    checkoutTotal =
        discountedSubtotal +
        shipping +
        checkoutTax;


    // =================================================
    // DISPLAY PRICES
    // =================================================

    document.getElementById(
        "checkoutSubtotal"
    ).textContent =
        "₹" +
        checkoutSubtotal.toFixed(2);


    document.getElementById(
        "checkoutShipping"
    ).textContent =
        "Free";


    document.getElementById(
        "checkoutTax"
    ).textContent =
        "₹" +
        checkoutTax.toFixed(2);


    document.getElementById(
        "checkoutDiscount"
    ).textContent =
        "₹" +
        discount.toFixed(2);


    document.getElementById(
        "checkoutTotal"
    ).textContent =
        "₹" +
        checkoutTotal.toFixed(2);


    console.log(
        "Subtotal:",
        checkoutSubtotal
    );


    console.log(
        "Tax:",
        checkoutTax
    );


    console.log(
        "Final Total:",
        checkoutTotal
    );

}


// =====================================================
// PLACE ORDER BUTTON
// =====================================================

const placeOrderButton =
    document.querySelector(
        ".place-order"
    );


placeOrderButton.addEventListener(
    "click",
    async function () {

        // =============================================
        // LOGIN CHECK
        // =============================================

        if (
            !loggedInCustomer ||
            !loggedInCustomer.token
        ) {

            alert(
                "Please login to continue."
            );


            window.location.href =
                "/pages/login/login.html";


            return;

        }


        // =============================================
        // FORM VALIDATION
        // =============================================

        const checkoutForm =
            document.getElementById(
                "checkoutForm"
            );


        if (
            !checkoutForm.checkValidity()
        ) {

            checkoutForm.reportValidity();

            return;

        }


        // =============================================
        // CART CHECK
        // =============================================

        if (
            !checkoutCart ||
            checkoutCart.length === 0
        ) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        // =============================================
        // GET CUSTOMER DETAILS
        // =============================================

        const firstName =
            document.getElementById(
                "firstName"
            ).value.trim();


        const lastName =
            document.getElementById(
                "lastName"
            ).value.trim();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const streetAddress =
            document.getElementById(
                "streetAddress"
            ).value.trim();


        const city =
            document.getElementById(
                "city"
            ).value.trim();


        const state =
            document.getElementById(
                "state"
            ).value.trim();


        const zipCode =
            document.getElementById(
                "zipCode"
            ).value.trim();


        const country =
            document.getElementById(
                "country"
            ).value.trim();


        // =============================================
        // GET PAYMENT METHOD
        // =============================================

        const paymentInput =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        if (!paymentInput) {

            alert(
                "Please select a payment method."
            );

            return;

        }


        const paymentMethod =
            paymentInput.value;


        console.log(
            "Selected Payment Method:",
            paymentMethod
        );


        // =============================================
        // CUSTOMER DATA
        // =============================================

        const customerData = {

            firstName:
                firstName,

            lastName:
                lastName,

            email:
                email,

            phone:
                phone,

            streetAddress:
                streetAddress,

            city:
                city,

            state:
                state,

            zipCode:
                zipCode,

            country:
                country,

            paymentMethod:
                paymentMethod,

                couponCode:
                    appliedCoupon ? appliedCoupon.code : null

        };


        console.log(
            "Customer Data:",
            customerData
        );


        // =============================================
        // COD
        // =============================================

        if (
            paymentMethod === "COD"
        ) {

            await placeCashOnDeliveryOrder(
                customerData
            );

            return;

        }


        // =============================================
        // CARD / UPI
        // =============================================

        if (
            paymentMethod === "CARD" ||
            paymentMethod === "Net Banking"
        ) {

            await startRazorpayPayment(
                customerData
            );

            return;

        }


    }
);


// =====================================================
// COD ORDER
// =====================================================

async function placeCashOnDeliveryOrder(
    customerData
) {

    try {

        placeOrderButton.disabled =
            true;


        placeOrderButton.textContent =
            "Placing Order...";


        console.log(
            "COD Order Data:",
            customerData
        );


        const response =
            await fetch(
                `${API_BASE_URL}/order/place`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            loggedInCustomer.token,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            customerData
                        )

                }
            );


        const responseText =
            await response.text();


        console.log(
            "COD Order Status:",
            response.status
        );


        console.log(
            "COD Order Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Order placement failed"
            );

        }


        const order =
            JSON.parse(responseText);


        console.log(
            "COD Order Created:",
            order
        );


        // Save Order ID
        localStorage.setItem(
            "lastOrderId",
            order.orderId
        );


        alert(
            "Order placed successfully!"
        );


        window.location.href =
            "/pages/order-success/order-success.html";

    }
    catch (error) {

        console.error(
            "COD Order Error:",
            error
        );


        alert(
            error.message ||
            "Unable to place order."
        );

    }
    finally {

        placeOrderButton.disabled =
            false;


        placeOrderButton.textContent =
            "Place Order";

    }

}


// =====================================================
// START RAZORPAY PAYMENT
// =====================================================

async function startRazorpayPayment(
    customerData
) {

    try {

        placeOrderButton.disabled =
            true;


        placeOrderButton.textContent =
            "Creating Payment...";


        console.log(
            "Creating Razorpay Order..."
        );


        console.log(
            "Checkout Total:",
            checkoutTotal
        );


        // =================================================
        // CREATE RAZORPAY ORDER
        // =================================================

        /*
         * IMPORTANT:
         *
         * Backend expects:
         *
         * @RequestParam double amount
         *
         * Therefore amount is sent in URL.
         *
         * DO NOT multiply by 100 here.
         *
         * Backend will convert INR -> paise.
         */

        const response =
            await fetch(
                `${API_BASE_URL}/payment/create-order?amount=`
                + encodeURIComponent(
                    checkoutTotal
                ),
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            loggedInCustomer.token

                    }

                }
            );


        // =================================================
        // READ RESPONSE AS TEXT
        // =================================================

        const responseText =
            await response.text();


        console.log(
            "Create Payment Status:",
            response.status
        );


        console.log(
            "Create Payment Response:",
            responseText
        );


        // =================================================
        // CHECK RESPONSE
        // =================================================

        if (!response.ok) {

            throw new Error(
                responseText ||
                "Unable to create Razorpay order"
            );

        }


        // =================================================
        // PARSE RAZORPAY ORDER
        // =================================================

        const razorpayOrder =
            JSON.parse(
                responseText
            );


        console.log(
            "Razorpay Order:",
            razorpayOrder
        );


        // =================================================
        // CHECK RAZORPAY ORDER ID
        // =================================================

        if (
            !razorpayOrder.id
        ) {

            throw new Error(
                "Razorpay order ID not received."
            );

        }


        // =================================================
        // RAZORPAY OPTIONS
        // =================================================

        const options = {

            key:
                "rzp_test_TLzAICW6rHbdX4",


            amount:
                razorpayOrder.amount,


            currency:
                razorpayOrder.currency,


            name:
                "LuxeCraft",


            description:
                "LuxeCraft Sofa Purchase",


            order_id:
                razorpayOrder.id,


            // =============================================
            // PREFILL
            // =============================================

            prefill: {

                name:
                    customerData.firstName +
                    " " +
                    customerData.lastName,

                email:
                    customerData.email,

                contact:
                    customerData.phone

            },


            // =============================================
            // THEME
            // =============================================

            theme: {

                color:
                    "#C4965A"

            },


            // =============================================
            // PAYMENT SUCCESS
            // =============================================

            handler:
                async function (
                    paymentResponse
                ) {

                    console.log(
                        "Razorpay Payment Response:",
                        paymentResponse
                    );


                    await verifyRazorpayPayment(
                        paymentResponse,
                        customerData
                    );

                },


            // =============================================
            // PAYMENT FAILED
            // =============================================

            modal: {

                ondismiss:
                    function () {

                        console.log(
                            "Razorpay payment window closed."
                        );


                        placeOrderButton.disabled =
                            false;


                        placeOrderButton.textContent =
                            "Place Order";

                    }

            }

        };


        // =================================================
        // OPEN RAZORPAY
        // =================================================

        const razorpay =
            new Razorpay(
                options
            );


        razorpay.open();


    }
    catch (error) {

        console.error(
            "Razorpay Error:",
            error
        );


        alert(
            error.message ||
            "Unable to start payment."
        );


        placeOrderButton.disabled =
            false;


        placeOrderButton.textContent =
            "Place Order";

    }

}


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

async function verifyRazorpayPayment(
    paymentResponse,
    customerData
) {

    try {

        console.log(
            "Verifying Razorpay Payment..."
        );


        placeOrderButton.disabled =
            true;


        placeOrderButton.textContent =
            "Verifying Payment...";


        // =================================================
        // VERIFY PAYMENT
        // =================================================

        const response =
            await fetch(
                `${API_BASE_URL}/payment/verify`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            loggedInCustomer.token,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            razorpayOrderId:
                                paymentResponse
                                    .razorpay_order_id,

                            razorpayPaymentId:
                                paymentResponse
                                    .razorpay_payment_id,

                            razorpaySignature:
                                paymentResponse
                                    .razorpay_signature

                        })

                }
            );


        const responseText =
            await response.text();


        console.log(
            "Payment Verification Status:",
            response.status
        );


        console.log(
            "Payment Verification Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Payment verification failed"
            );

        }


        let verificationResult;


        try {

            verificationResult =
                JSON.parse(
                    responseText
                );

        }
        catch {

            verificationResult =
                responseText;

        }


        console.log(
            "Payment Verification:",
            verificationResult
        );


        // =================================================
        // PAYMENT VERIFIED
        // =================================================

        console.log(
            "Payment verified successfully."
        );


        // =================================================
        // CREATE PAID ORDER
        // =================================================

        await createPaidOrder(
            customerData,
            paymentResponse
        );

    }
    catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );


        alert(
            error.message ||
            "Payment verification failed."
        );


        placeOrderButton.disabled =
            false;


        placeOrderButton.textContent =
            "Place Order";

    }

}


// =====================================================
// CREATE PAID ORDER
// =====================================================

async function createPaidOrder(
    customerData,
    paymentResponse
) {

    try {

        placeOrderButton.disabled =
            true;


        placeOrderButton.textContent =
            "Creating Order...";


        // =================================================
        // ORDER DATA
        // =================================================

        const orderData = {

            ...customerData,


            paymentMethod:
                customerData.paymentMethod,

                couponCode:
                    appliedCoupon ? appliedCoupon.code : null,


            paymentStatus:
                "PAID",


            razorpayOrderId:
                paymentResponse
                    .razorpay_order_id,


            razorpayPaymentId:
                paymentResponse
                    .razorpay_payment_id

        };


        console.log(
            "Paid Order Data:",
            orderData
        );


        // =================================================
        // CREATE ORDER
        // =================================================

        const response =
            await fetch(
                `${API_BASE_URL}/order/place`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            loggedInCustomer.token,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            orderData
                        )

                }
            );


        const responseText =
            await response.text();


        console.log(
            "Paid Order Status:",
            response.status
        );


        console.log(
            "Paid Order Response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Order creation failed"
            );

        }


        const order =
            JSON.parse(
                responseText
            );


        console.log(
            "Paid Order Created:",
            order
        );


        // =================================================
        // SAVE ORDER ID
        // =================================================

        localStorage.setItem(
            "lastOrderId",
            order.orderId
        );


        // =================================================
        // SAVE PAYMENT ID
        // =================================================

        localStorage.setItem(
            "lastPaymentId",
            paymentResponse
                .razorpay_payment_id
        );


        // =================================================
        // SAVE RAZORPAY ORDER ID
        // =================================================

        localStorage.setItem(
            "lastRazorpayOrderId",
            paymentResponse
                .razorpay_order_id
        );


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "Payment successful! Order placed successfully."
        );


        window.location.href =
            "/pages/order-success/order-success.html";

    }
    catch (error) {

        console.error(
            "Create Paid Order Error:",
            error
        );


        alert(
            error.message ||
            "Payment successful, but order creation failed. Please contact support."
        );


        placeOrderButton.disabled =
            false;


        placeOrderButton.textContent =
            "Place Order";

    }

}