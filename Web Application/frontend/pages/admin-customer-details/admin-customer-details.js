console.log("Admin Customer Details JS Loaded");


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
        "/frontend/pages/login/login.html"
    );

}


// =====================================================
// GET CUSTOMER ID FROM URL
// =====================================================

const urlParams =new URLSearchParams(window.location.search);

const customerId =urlParams.get("id");

console.log("Customer ID:", customerId);


// =====================================================
// CHECK CUSTOMER ID
// =====================================================

if (!customerId) {

    alert("Customer ID not found");

    window.location.replace(
        "/frontend/pages/admin-customers/admin-customers.html"
    );

}


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const customerName =
    document.getElementById("customerName");

const customerRole =
    document.getElementById("customerRole");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

const customerAddress =
    document.getElementById("customerAddress");

const customerStatus =
    document.getElementById("customerStatus");

const orderTableBody =
    document.getElementById("orderTableBody");

const totalOrders =
    document.getElementById("totalOrders");

const totalPurchase =
    document.getElementById("totalPurchase");

const lastOrder =
    document.getElementById("lastOrder");


// =====================================================
// LOAD CUSTOMER DETAILS
// =====================================================

function loadCustomerDetails() {

    fetch(
        `${API_BASE_URL}/customer/admin/` + customerId,
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
                "Customer Details API Status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to load customer details"
                );

            }

            return response.json();

        })

        .then(customer => {

            console.log(
                "Customer Details:",
                customer
            );


            // =================================================
            // CUSTOMER NAME
            // =================================================

            const firstName =
                customer.firstName || "";

            const lastName =
                customer.lastName || "";

            customerName.textContent =
                `${firstName} ${lastName}`.trim()
                || "Customer Name";


            // =================================================
            // CUSTOMER ROLE
            // =================================================

            customerRole.textContent =
                customer.role || "CUSTOMER";


            // =================================================
            // EMAIL
            // =================================================

            customerEmail.textContent =
                customer.email || "-";


            // =================================================
            // PHONE
            // =================================================

            customerPhone.textContent =
                customer.phone || "-";


            // =================================================
            // STATUS
            // =================================================

            customerStatus.textContent =
                "Active";

            customerStatus.className =
                "status active";


            // =================================================
            // LOAD CUSTOMER ORDERS
            // =================================================

            loadCustomerOrders(
                customer.customerId
            );

        })

        .catch(error => {

            console.error(
                "Customer Details Error:",
                error
            );

            customerName.textContent =
                "Unable to load customer";

            customerRole.textContent =
                "-";

            customerEmail.textContent =
                "-";

            customerPhone.textContent =
                "-";

            customerAddress.textContent =
                "Unable to load address";

        });

}


// =====================================================
// LOAD CUSTOMER ORDERS
// =====================================================

function loadCustomerOrders(customerId) {

    fetch(
        `${API_BASE_URL}/order/admin/customer/`
        + customerId,
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
                "Customer Orders API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load customer orders"
                );

            }


            return response.json();

        })

        .then(orders => {

            console.log(
                "Customer Orders:",
                orders
            );


            // =================================================
            // DISPLAY ORDERS
            // =================================================

            displayCustomerOrders(orders);


            // =================================================
            // UPDATE SUMMARY
            // =================================================

            updateCustomerSummary(orders);


            // =================================================
            // UPDATE ADDRESS
            // =================================================

            updateCustomerAddress(orders);

        })

        .catch(error => {

            console.error(
                "Orders Loading Error:",
                error
            );


            orderTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        style="text-align:center;"
                    >

                        Failed to load orders

                    </td>

                </tr>

            `;


            totalOrders.textContent =
                "0";


            totalPurchase.textContent =
                "₹0";


            lastOrder.textContent =
                "-";


            customerAddress.textContent =
                "Address not available";

        });

}


// =====================================================
// UPDATE CUSTOMER ADDRESS
// =====================================================

function updateCustomerAddress(orders) {

    if (!orders || orders.length === 0) {

        customerAddress.textContent =
            "Address not available";

        return;

    }


    // =================================================
    // FIND LATEST ORDER
    // =================================================

    const latestOrder =
        getLatestOrder(orders);


    if (!latestOrder) {

        customerAddress.textContent =
            "Address not available";

        return;

    }


    // =================================================
    // GET ADDRESS FROM ORDER
    // =================================================

    const street =
        latestOrder.streetAddress || "";

    const city =
        latestOrder.city || "";

    const state =
        latestOrder.state || "";

    const zipCode =
        latestOrder.zipCode || "";

    const country =
        latestOrder.country || "";


    // =================================================
    // CREATE ADDRESS
    // =================================================

    const addressParts = [

        street,
        city,
        state,
        zipCode,
        country

    ].filter(value => value);


    if (addressParts.length === 0) {

        customerAddress.textContent =
            "Address not available";

        return;

    }


    customerAddress.innerHTML =
        addressParts.join("<br>");

}


// =====================================================
// DISPLAY CUSTOMER ORDERS
// =====================================================

function displayCustomerOrders(orders) {

    orderTableBody.innerHTML = "";


    // =================================================
    // NO ORDERS
    // =================================================

    if (!orders || orders.length === 0) {

        orderTableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;"
                >

                    No orders found for this customer

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // SORT ORDERS - LATEST FIRST
    // =================================================

    orders.sort(
        (a, b) => {

            return new Date(b.orderDate) -
                   new Date(a.orderDate);

        }
    );


    // =================================================
    // CREATE ORDER ROWS
    // =================================================

    orders.forEach(order => {

        const row =
            document.createElement("tr");


        // =================================================
        // ORDER ID
        // =================================================

        const orderId =
            "ORD" +
            String(order.orderId)
                .padStart(3, "0");


        // =================================================
        // ORDER DATE
        // =================================================

        const orderDate =
            formatOrderDate(
                order.orderDate
            );


        // =================================================
        // AMOUNT
        // =================================================

        const amount =
            Number(
                order.totalAmount || 0
            ).toLocaleString("en-IN");


        // =================================================
        // STATUS
        // =================================================

        const status =
            order.status || "UNKNOWN";


        const statusClass =
            getStatusClass(status);


        // =================================================
        // TABLE ROW
        // =================================================

        row.innerHTML = `

            <td>
                ${orderId}
            </td>

            <td>
                ${orderDate}
            </td>

            <td>
                ₹${amount}
            </td>

            <td>

                <span class="${statusClass}">
                    ${status}
                </span>

            </td>

        `;


        orderTableBody.appendChild(row);

    });


    // =================================================
    // ROW ANIMATION
    // =================================================

    const rows =
        orderTableBody.querySelectorAll("tr");


    rows.forEach((row, index) => {

        row.style.opacity = "0";

        row.style.transform =
            "translateX(-20px)";


        setTimeout(() => {

            row.style.transition =
                ".4s";

            row.style.opacity =
                "1";

            row.style.transform =
                "translateX(0)";

        }, index * 100);

    });

}


// =====================================================
// FORMAT ORDER DATE
// =====================================================

function formatOrderDate(orderDate) {

    if (!orderDate) {

        return "-";

    }


    const date =
        new Date(orderDate);


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
// GET LATEST ORDER
// =====================================================

function getLatestOrder(orders) {

    if (!orders || orders.length === 0) {

        return null;

    }


    return orders.reduce(
        (latest, current) => {

            if (!latest) {

                return current;

            }


            const latestDate =
                new Date(
                    latest.orderDate
                ).getTime();


            const currentDate =
                new Date(
                    current.orderDate
                ).getTime();


            return currentDate > latestDate
                ? current
                : latest;

        },
        null
    );

}


// =====================================================
// STATUS CSS CLASS
// =====================================================

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "delivered") {

        return "delivered";

    }


    if (value === "processing") {

        return "processing";

    }


    if (
        value === "pending" ||
        value === "placed"
    ) {

        return "pending";

    }


    if (value === "cancelled") {

        return "cancelled";

    }


    return "pending";

}


// =====================================================
// UPDATE CUSTOMER SUMMARY
// =====================================================

function updateCustomerSummary(orders) {

    // =================================================
    // TOTAL ORDERS
    // =================================================

    totalOrders.textContent =
        orders.length;


    // =================================================
    // TOTAL PURCHASE
    // =================================================

    let purchaseAmount =
        0;


    orders.forEach(order => {

        purchaseAmount +=
            Number(
                order.totalAmount || 0
            );

    });


    totalPurchase.textContent =
        "₹" +
        purchaseAmount
            .toLocaleString("en-IN");


    // =================================================
    // LAST ORDER
    // =================================================

    const latestOrder =
        getLatestOrder(orders);


    if (!latestOrder) {

        lastOrder.textContent =
            "-";

        return;

    }


    lastOrder.textContent =
        formatOrderDate(
            latestOrder.orderDate
        );

}


// =====================================================
// EMAIL COPY
// =====================================================

if (customerEmail) {

    customerEmail.style.cursor =
        "pointer";

    customerEmail.title =
        "Click to copy email";


    customerEmail.addEventListener(
        "click",
        function () {

            const email =
                customerEmail.textContent.trim();


            if (
                !email ||
                email === "-"
            ) {

                return;

            }


            navigator.clipboard
                .writeText(email)

                .then(() => {

                    alert(
                        "Email copied successfully!"
                    );

                })

                .catch(error => {

                    console.error(
                        "Copy Error:",
                        error
                    );

                });

        }
    );

}


// =====================================================
// CARD ANIMATION
// =====================================================

const cards =
    document.querySelectorAll(".card");


cards.forEach(
    (card, index) => {

        card.style.opacity =
            "0";

        card.style.transform =
            "translateY(25px)";


        setTimeout(() => {

            card.style.transition =
                "0.5s ease";

            card.style.opacity =
                "1";

            card.style.transform =
                "translateY(0)";

        }, index * 150);

    }
);


// =====================================================
// PAGE LOAD
// =====================================================

loadCustomerDetails();