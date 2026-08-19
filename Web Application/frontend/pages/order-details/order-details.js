console.log("Order Details JS Loaded");


// ================= PAGE LOAD =================

window.onload = function () {

    console.log("Order Details Page Loaded");

    loadOrderDetails();

};


// ================= LOAD ORDER DETAILS =================

function loadOrderDetails() {

    const loggedInCustomer =
        JSON.parse(
            localStorage.getItem("loggedInCustomer")
        );


    // ================= LOGIN CHECK =================

    if (!loggedInCustomer) {

        window.location.href =
            "/frontend/pages/login/login.html";

        return;

    }


    // ================= GET SELECTED ORDER ID =================

    const orderId =
        localStorage.getItem("selectedOrderId");


    if (!orderId) {

        console.error("Order ID not found");

        alert("Order not found");

        window.location.href =
            "/frontend/pages/orders/order.html";

        return;

    }


    console.log("Selected Order ID:", orderId);


    // ================= GET ORDER API =================

    fetch(
        `${API_BASE_URL}/order/` + orderId,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " + loggedInCustomer.token

            }

        }
    )

        .then(response => {

            console.log(
                "Order Details Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load order details"
                );

            }


            return response.json();

        })

        .then(order => {

            console.log(
                "Order Details:",
                order
            );


            displayOrderDetails(order);

            loadOrderItems(order.orderId);

        })

        .catch(error => {

            console.error(
                "Order Details Error:",
                error
            );

        });

}


// ================= DISPLAY ORDER DETAILS =================

function displayOrderDetails(order) {


    // ================= ORDER INFORMATION =================

    document.getElementById("orderId")
        .textContent =
        "#" + order.orderId;


    document.getElementById("orderStatus")
        .textContent =
        order.status;


    // ================= CANCEL BUTTON =================

    setupCancelButton(order);


    // ================= STATUS TIMELINE =================

    loadOrderTimeline(order);


    // ================= CUSTOMER DETAILS =================

    document.getElementById("customerName")
        .textContent =
        order.firstName + " " + order.lastName;


    document.getElementById("customerEmail")
        .textContent =
        order.email;


    document.getElementById("customerPhone")
        .textContent =
        order.phone;


    // ================= SHIPPING ADDRESS =================

    document.getElementById("shippingAddress")
        .textContent =

        order.streetAddress
        + ", "
        + order.city
        + ", "
        + order.state
        + " - "
        + order.zipCode
        + ", "
        + order.country;


    // ================= PAYMENT =================

    document.getElementById("paymentMethod")
        .textContent =
        order.paymentMethod;


    // ================= ORDER SUMMARY =================

    document.getElementById("subtotal")
        .textContent =
        "₹" + order.subtotal.toFixed(2);


    document.getElementById("tax")
        .textContent =
        "₹" + order.tax.toFixed(2);


    document.getElementById("totalAmount")
        .textContent =
        "₹" + order.totalAmount.toFixed(2);

}


function loadOrderItems(orderId) {

    const loggedInCustomer =
        JSON.parse(localStorage.getItem("loggedInCustomer"));

    fetch(
        `${API_BASE_URL}/order/`
        + orderId
        + "/items",
        {
            method: "GET",

            headers: {
                "Authorization":
                    "Bearer " + loggedInCustomer.token
            }
        }
    )
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load order items");
            }

            return response.json();

        })
        .then(items => {

            console.log("Order Items:", items);

            displayOrderItems(items);

        })
        .catch(error => {

            console.error("Order Items Error:", error);

        });
}


function displayOrderItems(items) {

    const container =
        document.getElementById("orderItems");

    container.innerHTML = "";

    if (items.length === 0) {

        container.innerHTML = `
        
            <p>No products found for this order.</p>

        `;

        return;
    }


    items.forEach(item => {

        container.innerHTML += `

            <div class="order-item">

                <img
                    src="${API_BASE_URL}/uploads/${item.imageUrl}"
                    alt="${item.productName}"
                >

                <div class="order-item-info">

                    <h3>
                        ${item.productName}
                    </h3>

                    <p>
                        Quantity: ${item.quantity}
                    </p>

                    <p>
                        Price: ₹${item.price.toFixed(2)}
                    </p>

                </div>

                <div class="order-item-total">

                    ₹${item.total.toFixed(2)}

                </div>

            </div>

        `;

    });

}

// ================= CANCEL ORDER =================

// Only PENDING / IN PROGRESS orders can be cancelled. The backend enforces
// this too - this just avoids showing a button that would always fail.
const CANCELLABLE_STATUSES = ["PENDING", "IN PROGRESS"];


function setupCancelButton(order) {

    const button =
        document.getElementById("cancelOrderBtn");

    const message =
        document.getElementById("orderActionMessage");

    if (!button) {
        return;
    }

    const status =
        (order.status || "").trim().toUpperCase();


    if (!CANCELLABLE_STATUSES.includes(status)) {

        button.style.display = "none";

        if (message) {

            message.textContent =
                status === "CANCELLED"
                    ? "This order was cancelled."
                    : "";
        }

        return;
    }


    button.style.display = "inline-block";

    button.onclick = function () {
        cancelOrder(order.orderId, button, message);
    };
}


function cancelOrder(orderId, button, message) {

    const confirmed =
        confirm("Cancel this order? This cannot be undone.");

    if (!confirmed) {
        return;
    }


    const loggedInCustomer =
        JSON.parse(
            localStorage.getItem("loggedInCustomer")
        );


    button.disabled = true;
    button.textContent = "Cancelling...";

    if (message) {
        message.textContent = "";
    }


    fetch(
        `${API_BASE_URL}/order/${orderId}/cancel`,
        {
            method: "PUT",

            headers: {
                "Authorization":
                    "Bearer " + loggedInCustomer.token
            }
        }
    )
        .then(function (response) {

            return response.json().then(function (body) {

                if (!response.ok) {

                    // Backend sends { status, error, message }
                    throw new Error(
                        body.message ||
                        "Could not cancel this order."
                    );
                }

                return body;
            });
        })
        .then(function (updatedOrder) {

            document.getElementById("orderStatus")
                .textContent = updatedOrder.status;

            button.style.display = "none";

            if (message) {
                message.textContent =
                    "This order was cancelled.";
            }
        })
        .catch(function (error) {

            console.error("Cancel Order Error:", error);

            button.disabled = false;
            button.textContent = "Cancel order";

            if (message) {
                message.textContent = error.message;
                message.classList.add("error");
            }
        });
}


// =====================================================
// STATUS TIMELINE
// =====================================================

// The happy path every order walks. CANCELLED is deliberately not here -
// it is an exit from the flow, not a step along it, so it gets its own
// rendering below.
const ORDER_STEPS = ["PENDING", "IN PROGRESS", "DELIVERED"];

const STEP_LABELS = {
    "PENDING": "Order placed",
    "IN PROGRESS": "In progress",
    "DELIVERED": "Delivered"
};


function loadOrderTimeline(order) {

    fetch(`${API_BASE_URL}/order/${order.orderId}/timeline`, {
        headers: customerAuthHeaders()
    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load timeline");
            }

            return response.json();

        })

        .then(history => {

            displayTimeline(order, history);

        })

        .catch(error => {

            console.error("Timeline Error:", error);

            // Orders placed before history existed have no rows. Still show
            // the steps, just without timestamps, rather than an error.
            displayTimeline(order, []);

        });

}


function formatStamp(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function displayTimeline(order, history) {

    const container =
        document.getElementById("orderTimeline");

    if (!container) {
        return;
    }


    // Latest entry per status, so a status set twice shows the newest time
    const stampFor = {};

    (history || []).forEach(entry => {
        stampFor[entry.status] = entry.changedAt;
    });


    const currentStatus =
        (order.status || "").toUpperCase();


    // ---- cancelled orders leave the normal flow ----

    if (currentStatus === "CANCELLED") {

        const cancelledAt = formatStamp(stampFor["CANCELLED"]);

        container.innerHTML = `
            <div class="timeline cancelled">

                <div class="timeline-step done">
                    <span class="dot"></span>
                    <span class="step-label">Order placed</span>
                    <span class="step-time">${formatStamp(stampFor["PENDING"])}</span>
                </div>

                <div class="timeline-step cancelled-step">
                    <span class="dot"></span>
                    <span class="step-label">Cancelled</span>
                    <span class="step-time">${cancelledAt}</span>
                </div>

            </div>
        `;

        return;

    }


    // ---- normal progression ----

    let reached = ORDER_STEPS.indexOf(currentStatus);

    // An unrecognised status should not blank the whole timeline
    if (reached === -1) {
        reached = 0;
    }


    let html = `<div class="timeline">`;

    ORDER_STEPS.forEach((step, index) => {

        let state = "upcoming";

        if (index < reached) {
            state = "done";
        } else if (index === reached) {
            state = "current";
        }

        html += `
            <div class="timeline-step ${state}">
                <span class="dot"></span>
                <span class="step-label">${STEP_LABELS[step]}</span>
                <span class="step-time">${formatStamp(stampFor[step])}</span>
            </div>
        `;

    });

    html += `</div>`;

    container.innerHTML = html;

}
