console.log("Admin Orders JS Loaded");


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
// HTML ELEMENTS
// =====================================================

const searchInput =
    document.getElementById("search");

const category =
    document.getElementById("category");

const orderTableBody =
    document.getElementById("orderTableBody");


// =====================================================
// STORE ALL ORDERS
// =====================================================

let allOrders = [];


// =====================================================
// LOAD ALL ORDERS
// =====================================================

function loadOrders() {

    fetch(
        `${API_BASE_URL}/order/admin/all`,
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
                "Orders API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load orders"
                );

            }


            return response.json();

        })

        .then(orders => {

            console.log(
                "All Orders:",
                orders
            );


            allOrders = orders;


            displayOrders(
                allOrders
            );

        })

        .catch(error => {

            console.error(
                "Orders Loading Error:",
                error
            );


            orderTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="text-align:center;"
                    >

                        Failed to load orders

                    </td>

                </tr>

            `;

        });

}


// =====================================================
// DISPLAY ORDERS
// =====================================================

function displayOrders(orders) {

    orderTableBody.innerHTML = "";


    // =================================================
    // NO ORDERS
    // =================================================

    if (orders.length === 0) {

        orderTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    No orders found

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // CREATE ROWS
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
        // CUSTOMER NAME
        // =================================================

        const customerName =
            order.customerName ||
            "Unknown Customer";


        // =================================================
        // PRODUCT NAME
        // =================================================

        const productName =
            order.productName ||
            "Unknown Product";


        // =================================================
        // DATE
        // =================================================

        const formattedDate =
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
            order.status ||
            "UNKNOWN";


        const statusClass =
            getStatusClass(status);


        // =================================================
        // ROW
        // =================================================

        row.innerHTML = `

            <td>
                ${orderId}
            </td>

            <td>
                ${customerName}
            </td>

            <td>
                ${productName}
            </td>

            <td>
                ${formattedDate}
            </td>

            <td>
                ₹${amount}
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${status}
                </span>

            </td>

            <td>

                <a
                    href="/pages/admin-orders-details/admin-orders-details.html?id=${order.orderId}"
                    class="view-btn"
                    title="View Order Details"
                >

                    <i class="fa-solid fa-eye"></i>

                </a>

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
            "translateY(20px)";


        setTimeout(() => {

            row.style.transition =
                ".4s";

            row.style.opacity = "1";

            row.style.transform =
                "translateY(0)";

        }, index * 100);

    });

}


// =====================================================
// FORMAT DATE
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
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    const value =
        status.toLowerCase();


    if (value === "delivered") {

        return "delivered";

    }


    if (value === "IN PROGRESS") {

        return "IN PROGRESS";

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
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filteredOrders =
                allOrders.filter(order => {

                    const orderId =
                        String(
                            order.orderId || ""
                        ).toLowerCase();


                    const customerName =
                        (
                            order.customerName || ""
                        ).toLowerCase();


                    const productName =
                        (
                            order.productName || ""
                        ).toLowerCase();


                    const status =
                        (
                            order.status || ""
                        ).toLowerCase();


                    return (
                        orderId.includes(searchValue) ||
                        customerName.includes(searchValue) ||
                        productName.includes(searchValue) ||
                        status.includes(searchValue)
                    );

                });


            displayOrders(
                filteredOrders
            );

        }
    );

}


// =====================================================
// STATUS FILTER
// =====================================================

if (category) {

    category.addEventListener(
        "change",
        function () {

            const selectedStatus =
                category.value
                    .trim()
                    .toLowerCase();


            let filteredOrders =
                allOrders;


            if (
                selectedStatus !==
                "all orders"
            ) {

                filteredOrders =
                    allOrders.filter(order => {

                        const status =
                            (
                                order.status || ""
                            ).toLowerCase();


                        return (
                            status ===
                            selectedStatus
                        );

                    });

            }


            displayOrders(
                filteredOrders
            );

        }
    );

}


// =====================================================
// PAGE LOAD
// =====================================================

loadOrders();