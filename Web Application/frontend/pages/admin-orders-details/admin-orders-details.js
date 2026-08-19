console.log("Admin Order Details JS Loaded");

// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

const loggedInAdmin =
    JSON.parse(localStorage.getItem("loggedInAdmin"));

if (
    !loggedInAdmin ||
    loggedInAdmin.role !== "ADMIN" ||
    !loggedInAdmin.token
) {
    localStorage.removeItem("loggedInAdmin");

    window.location.replace(
        "/pages/login/login.html"
    );
}


// =====================================================
// GET ORDER ID FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("id");

console.log("Order ID:", orderId);


if (!orderId) {

    alert("Order ID not found");

    window.location.href =
        "/pages/admin-orders/admin-orders.html";

}


// =====================================================
// HTML ELEMENTS
// =====================================================

const orderIdElement =
    document.getElementById("orderId");

const orderDateElement =
    document.getElementById("orderDate");

const deliveryDateElement =
    document.getElementById("deliveryDate");

const statusBadge =
    document.getElementById("statusBadge");

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

const customerAddress =
    document.getElementById("customerAddress");

const paymentMethod =
    document.getElementById("paymentMethod");

const totalAmount =
    document.getElementById("totalAmount");

const productName =
    document.getElementById("productName");

const productQuantity =
    document.getElementById("productQuantity");

const productPrice =
    document.getElementById("productPrice");

const productImage =
    document.getElementById("productImage");

const orderStatus =
    document.getElementById("orderStatus");

const updateBtn =
    document.getElementById("updateBtn");


// =====================================================
// LOAD ORDER DETAILS
// =====================================================

function loadOrderDetails() {

    fetch(
        `${API_BASE_URL}/order/admin/${orderId}`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    "Bearer " +
                    loggedInAdmin.token
            }
        }
    )

        .then(response => {

            console.log(
                "Order Details API Status:",
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

            displayOrder(order);

            loadOrderItem();

            loadStatusHistory();

        })

        .catch(error => {

            console.error(
                "Order Details Error:",
                error
            );

            alert(
                "Failed to load order details"
            );

        });

}


// =====================================================
// DISPLAY ORDER
// =====================================================

function displayOrder(order) {

    // Order ID

    orderIdElement.innerText =
        "ORD" +
        String(order.orderId)
            .padStart(3, "0");


    // Order Date

    orderDateElement.innerText =
        formatDate(order.orderDate);


    // Delivery Date

    deliveryDateElement.innerText =
        formatDate(order.deliveryDate);


    // Customer

    customerName.innerText =
        `${order.firstName} ${order.lastName}`;


    customerEmail.innerText =
        order.email;


    customerPhone.innerText =
        order.phone;


    // Address

    customerAddress.innerHTML = `

        ${order.streetAddress}<br>
        ${order.city}<br>
        ${order.state} - ${order.zipCode}<br>
        ${order.country}

    `;


    // Payment

    paymentMethod.innerText =
        order.paymentMethod;


    // Amount

    totalAmount.innerText =
        Number(
            order.totalAmount || 0
        ).toLocaleString("en-IN");


    // Status

    updateStatusUI(
        order.status
    );


    // Select current status

    orderStatus.value =
        order.status;

}


// =====================================================
// LOAD ORDER ITEM
// =====================================================

function loadOrderItem() {

    fetch(
        `${API_BASE_URL}/order/admin/${orderId}/items`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    "Bearer " +
                    loggedInAdmin.token
            }
        }
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to load order item"
                );

            }

            return response.json();

        })

        .then(items => {

            console.log(
                "Order Items:",
                items
            );


            if (
                !items ||
                items.length === 0
            ) {

                productName.innerText =
                    "No Product";

                return;

            }


            // First product

            const item =
                items[0];


            productName.innerText =
                item.productName ||
                "Unknown Product";


            productQuantity.innerText =
                item.quantity;


            productPrice.innerText =
                Number(
                    item.price || 0
                ).toLocaleString("en-IN");


            if (item.imageUrl) {

                productImage.src =
                    item.imageUrl;

            }

        })

        .catch(error => {

            console.error(
                "Order Item Error:",
                error
            );

            productName.innerText =
                "Failed to load product";

        });

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// STATUS UI
// =====================================================

function updateStatusUI(status) {

    const value =
        (status || "")
            .toUpperCase();


    statusBadge.innerText =
        value;


    statusBadge.className =
        "status status-badge";


    if (value === "PENDING") {

        statusBadge.classList.add(
            "pending"
        );

    }

    else if (
        value === "IN PROGRESS" ||
        value === "PROCESSING"
    ) {

        statusBadge.classList.add(
            "processing"
        );

    }

    else if (value === "DELIVERED") {

        statusBadge.classList.add(
            "delivered"
        );

    }

    else if (value === "CANCELLED") {

        statusBadge.classList.add(
            "cancelled"
        );

    }

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

updateBtn.addEventListener(
    "click",
    function () {

        const newStatus =
            orderStatus.value;


        if (
            !confirm(
                `Change order status to ${newStatus}?`
            )
        ) {

            return;

        }


        fetch(
            `${API_BASE_URL}/order/admin/${orderId}/status`,
            {

                method: "PUT",

                headers: {

                    "Authorization":
                        "Bearer " +
                        loggedInAdmin.token,

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        newStatus
                    )

            }
        )

            .then(response => {

                console.log(
                    "Status Update API:",
                    response.status
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to update status"
                    );

                }


                return response.json();

            })

            .then(updatedOrder => {

                console.log(
                    "Updated Order:",
                    updatedOrder
                );


                updateStatusUI(
                    updatedOrder.status
                );


                // The change just added a timeline row - show it
                loadStatusHistory();


                alert(
                    "✅ Order Status Updated Successfully!"
                );

            })

            .catch(error => {

                console.error(
                    "Status Update Error:",
                    error
                );

                alert(
                    "❌ Failed to update order status"
                );

            });

    }
);


// =====================================================
// PAGE LOAD
// =====================================================

loadOrderDetails();

// =====================================================
// STATUS HISTORY
// =====================================================

function loadStatusHistory() {

    const container =
        document.getElementById("statusHistory");

    if (!container) {
        return;
    }


    fetch(`${API_BASE_URL}/order/admin/${orderId}/timeline`, {
        headers: adminAuthHeaders()
    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load status history");
            }

            return response.json();

        })

        .then(history => {

            displayStatusHistory(history);

        })

        .catch(error => {

            console.error("Status History Error:", error);

            container.innerHTML =
                `<p class="history-empty">Could not load status history.</p>`;

        });

}


function displayStatusHistory(history) {

    const container =
        document.getElementById("statusHistory");


    if (!history || history.length === 0) {

        // Orders placed before history tracking existed have no rows
        container.innerHTML =
            `<p class="history-empty">No history recorded for this order.</p>`;

        return;

    }


    // Newest first - an admin checking "what just happened" reads the top
    const rows = history.slice().reverse();

    let html = `<ul class="history-list">`;

    rows.forEach(entry => {

        const when = entry.changedAt
            ? new Date(entry.changedAt).toLocaleString()
            : "";

        html += `
            <li class="history-row">

                <span class="history-status ${statusClass(entry.status)}">
                    ${entry.status}
                </span>

                <div class="history-meta">
                    <span class="history-when">${when}</span>
                    <span class="history-who">by ${entry.changedBy || "SYSTEM"}</span>
                    ${entry.note ? `<span class="history-note">${entry.note}</span>` : ""}
                </div>

            </li>
        `;

    });

    html += `</ul>`;

    container.innerHTML = html;

}


function statusClass(status) {

    switch ((status || "").toUpperCase()) {

        case "DELIVERED":
            return "ok";

        case "CANCELLED":
            return "bad";

        case "IN PROGRESS":
            return "busy";

        default:
            return "pending";
    }

}
