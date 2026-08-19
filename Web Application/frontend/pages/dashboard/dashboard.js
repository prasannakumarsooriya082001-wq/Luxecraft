console.log("Dashboard JS Loaded");


// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

const loggedInAdmin = JSON.parse(localStorage.getItem("loggedInAdmin"));


if (
    !loggedInAdmin ||
    loggedInAdmin.role !== "ADMIN" ||
    !loggedInAdmin.token
) {

    console.log("Admin not logged in");

    localStorage.removeItem("loggedInAdmin");

    window.location.replace("/frontend/pages/login/login.html"
    );

}


// =====================================================
// LOAD DASHBOARD DATA
// =====================================================

function loadDashboardData() {

    const admin = JSON.parse(localStorage.getItem("loggedInAdmin"));


    // -----------------------------------------------
    // ADMIN CHECK
    // -----------------------------------------------

    if (
        !admin ||
        !admin.token ||
        admin.role !== "ADMIN"
    ) {

        window.location.replace("/frontend/pages/login/login.html");

        return;

    }


    console.log(
        "Admin Token:",
        admin.token
    );


    // =================================================
    // DASHBOARD API
    // =================================================

    fetch(
        `${API_BASE_URL}/admin/dashboard`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " + admin.token

            }

        }
    )

        .then(response => {

            console.log(
                "Dashboard API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load dashboard"
                );

            }


            return response.json();

        })

        .then(data => {

            console.log(
                "Dashboard Data:",
                data
            );


            // =============================================
            // PRODUCTS COUNT
            // =============================================

            const productCount =
                document.getElementById(
                    "productCount"
                );


            if (productCount) {

                productCount.textContent =
                    data.products;

            }


            // =============================================
            // ORDERS COUNT
            // =============================================

            const orderCount =
                document.getElementById(
                    "orderCount"
                );


            if (orderCount) {

                orderCount.textContent =
                    data.orders *2;

            }


            // =============================================
            // CUSTOMERS COUNT
            // =============================================

            const customerCount =
                document.getElementById(
                    "customerCount"
                );


            if (customerCount) {

                customerCount.textContent =
                    data.customers;

            }


            // =============================================
            // REVENUE
            // =============================================

            const revenueAmount =
                document.getElementById(
                    "revenueAmount"
                );


            if (revenueAmount) {

                revenueAmount.textContent =
                    "₹" +
                    Number(data.revenue)
                        .toLocaleString("en-IN");

            }

        })

        .catch(error => {

            console.error(
                "Dashboard Error:",
                error
            );

        });

}



// =====================================================
// LOAD RECENT ORDERS
// =====================================================

function loadRecentOrders() {

    const admin =
        JSON.parse(
            localStorage.getItem("loggedInAdmin")
        );


    // -----------------------------------------------
    // ADMIN CHECK
    // -----------------------------------------------

    if (
        !admin ||
        !admin.token ||
        admin.role !== "ADMIN"
    ) {

        window.location.replace(
            "/frontend/pages/login/login.html"
        );

        return;

    }


    console.log(
        "Loading Recent Orders..."
    );


    // =================================================
    // RECENT ORDERS API
    // =================================================

    fetch(
        `${API_BASE_URL}/order/admin/recent`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " + admin.token

            }

        }
    )

        .then(response => {

            console.log(
                "Recent Orders API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load recent orders"
                );

            }


            return response.json();

        })

        .then(orders => {

            console.log(
                "Recent Orders:",
                orders
            );


            // =============================================
            // TABLE BODY
            // =============================================

            const tableBody =
                document.getElementById(
                    "recentOrdersBody"
                );


            if (!tableBody) {

                console.error(
                    "recentOrdersBody not found"
                );

                return;

            }


            // Clear old/static rows

            tableBody.innerHTML = "";


            // =============================================
            // NO ORDERS
            // =============================================

            if (
                !orders ||
                orders.length === 0
            ) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `
                <td colspan="5"
                    style="text-align:center;">
                    No recent orders found
                </td>
            `;


                tableBody.appendChild(row);

                return;

            }


            // =============================================
            // LOOP ORDERS
            // =============================================

            orders.forEach(order => {


                const row =
                    document.createElement("tr");


                // =================================================
                // ORDER ID
                // =================================================

                const orderIdCell =
                    document.createElement("td");


                orderIdCell.textContent =
                    "ORD" +
                    String(order.orderId)
                        .padStart(3, "0");


                // =================================================
                // CUSTOMER NAME
                // =================================================

                const customerCell =
                    document.createElement("td");


                customerCell.textContent =
                    order.customerName;


                // =================================================
                // PRODUCT NAME
                // =================================================

                const productCell =
                    document.createElement("td");


                productCell.textContent =
                    order.productName;


                // =================================================
                // STATUS
                // =================================================

                const statusCell =
                    document.createElement("td");


                const statusBadge =
                    document.createElement("span");


                statusBadge.classList.add(
                    "status"
                );


                const status =
                    String(
                        order.status || ""
                    ).toUpperCase();


                statusBadge.textContent =
                    status;


                // -----------------------------------------------
                // STATUS CSS CLASS
                // -----------------------------------------------

                if (
                    status === "DELIVERED"
                ) {

                    statusBadge.classList.add(
                        "delivered"
                    );

                }

                else if (
                    status === "PENDING"
                ) {

                    statusBadge.classList.add(
                        "pending"
                    );

                }

                else if (
                    status === "PLACED" ||
                    status === "PROCESSING"
                ) {

                    statusBadge.classList.add(
                        "processing"
                    );

                }

                else if (
                    status === "CANCELLED" ||
                    status === "CANCELED"
                ) {

                    statusBadge.classList.add(
                        "cancelled"
                    );

                }

                else {

                    statusBadge.classList.add(
                        "processing"
                    );

                }


                statusCell.appendChild(
                    statusBadge
                );


                // =================================================
                // AMOUNT
                // =================================================

                const amountCell =
                    document.createElement("td");


                const amount =
                    Number(
                        order.amount || 0
                    );


                amountCell.textContent =
                    "₹" +
                    amount.toLocaleString(
                        "en-IN"
                    );


                // =================================================
                // ADD CELLS TO ROW
                // =================================================

                row.appendChild(
                    orderIdCell
                );

                row.appendChild(
                    customerCell
                );

                row.appendChild(
                    productCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    amountCell
                );


                // =================================================
                // ADD ROW TO TABLE
                // =================================================

                tableBody.appendChild(
                    row
                );

            });

        })

        .catch(error => {

            console.error(
                "Recent Orders Error:",
                error
            );


            const tableBody =
                document.getElementById(
                    "recentOrdersBody"
                );


            if (tableBody) {

                tableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        style="text-align:center;">
                        Failed to load recent orders
                    </td>
                </tr>
            `;

            }

        });

}



// =====================================================
// ACTIVE SIDEBAR MENU
// =====================================================

const menuItems =
    document.querySelectorAll(
        ".sidebar-menu li"
    );


menuItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            menuItems.forEach(menu => {

                menu.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );

        }
    );

});



// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.querySelector(
        ".sidebar-menu li:last-child a"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            // -------------------------------------------
            // REMOVE ADMIN TOKEN
            // -------------------------------------------

            localStorage.removeItem(
                "loggedInAdmin"
            );


            console.log(
                "Admin logged out"
            );


            // -------------------------------------------
            // GO TO LOGIN
            // -------------------------------------------

            window.location.replace(
                "/frontend/pages/login/login.html"
            );

        }
    );

}



// =====================================================
// TODAY'S DATE
// =====================================================

const dateElement =
    document.querySelector(
        ".header-right span"
    );


if (dateElement) {

    const today =
        new Date();


    const options = {

        day: "numeric",

        month: "long",

        year: "numeric"

    };


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}



// =====================================================
// ADMIN NAME
// =====================================================

const adminNameElement =
    document.getElementById("adminName");

const adminProfileName =
    document.getElementById("adminProfileName");


if (loggedInAdmin) {

    console.log("Logged In Admin Object:", loggedInAdmin);

    const adminName =
    loggedInAdmin.name ||
    loggedInAdmin.firstName ||
    loggedInAdmin.fullName ||
    "Prasanna Kumar"; // Default name if none found


    console.log("Admin Display Name:", adminName);


    if (adminNameElement) {

        adminNameElement.textContent =
            adminName;

    }


    if (adminProfileName) {

        adminProfileName.textContent =
            adminName;

    }

}



// =====================================================
// DASHBOARD CARD ANIMATION
// =====================================================

const cards =
    document.querySelectorAll(
        ".card"
    );


cards.forEach(
    (card, index) => {

        card.style.opacity = "0";

        card.style.transform =
            "translateY(30px)";


        setTimeout(
            () => {

                card.style.transition =
                    "0.5s ease";


                card.style.opacity =
                    "1";


                card.style.transform =
                    "translateY(0)";

            },
            index * 200
        );

    }
);



// =====================================================
// LOAD ALL DASHBOARD DATA
// =====================================================

loadDashboardData();

loadRecentOrders();