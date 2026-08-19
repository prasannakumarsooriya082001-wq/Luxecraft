console.log("Admin Reports JS Loaded");


// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

const loggedInAdmin =
    JSON.parse(
        localStorage.getItem("loggedInAdmin")
    );


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
// HTML ELEMENTS
// =====================================================

const revenueElement =
    document.getElementById("revenue");

const ordersElement =
    document.getElementById("orders");

const customersElement =
    document.getElementById("customers");

const productsElement =
    document.getElementById("products");

const reportTableBody =
    document.getElementById("reportTableBody");


// =====================================================
// REVENUE CHART INSTANCE
// =====================================================

let revenueChartInstance = null;


// =====================================================
// LOAD REPORT SUMMARY
// =====================================================

function loadReportSummary() {

    fetch(
        `${API_BASE_URL}/reports/dashboard`,
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
                "Reports Dashboard Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load dashboard report"
                );

            }


            return response.json();

        })

        .then(data => {

            console.log(
                "Dashboard Report:",
                data
            );


            // =========================================
            // TOTAL REVENUE
            // =========================================

            if (revenueElement) {

                revenueElement.innerText =
                    "₹" +
                    Number(
                        data.totalRevenue || 0
                    ).toLocaleString(
                        "en-IN"
                    );

            }


            // =========================================
            // TOTAL ORDERS
            // =========================================

            if (ordersElement) {

                ordersElement.innerText =
                    Number(
                        data.totalOrders || 0
                    ).toLocaleString(
                        "en-IN"
                    );

            }


            // =========================================
            // TOTAL CUSTOMERS
            // =========================================

            if (customersElement) {

                customersElement.innerText =
                    Number(
                        data.totalCustomers || 0
                    ).toLocaleString(
                        "en-IN"
                    );

            }


            // =========================================
            // PRODUCTS SOLD
            // =========================================

            if (productsElement) {

                productsElement.innerText =
                    Number(
                        data.totalProductsSold || 0
                    ).toLocaleString(
                        "en-IN"
                    );

            }

        })

        .catch(error => {

            console.error(
                "Report Summary Error:",
                error
            );


            if (revenueElement) {

                revenueElement.innerText =
                    "₹0";

            }


            if (ordersElement) {

                ordersElement.innerText =
                    "0";

            }


            if (customersElement) {

                customersElement.innerText =
                    "0";

            }


            if (productsElement) {

                productsElement.innerText =
                    "0";

            }

        });

}


// =====================================================
// REVENUE TREND CHART
// BACKEND CONNECTED
// =====================================================

function loadRevenueChart() {

    const revenueCanvas =
        document.getElementById(
            "revenueChart"
        );


    // =========================================
    // CANVAS CHECK
    // =========================================

    if (!revenueCanvas) {

        console.error(
            "Revenue canvas not found"
        );

        return;

    }


    // =========================================
    // CHART.JS CHECK
    // =========================================

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js is not loaded"
        );

        return;

    }


    // =========================================
    // BACKEND API
    // =========================================

    fetch(
        `${API_BASE_URL}/reports/revenue`,
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
                "Revenue API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load revenue data"
                );

            }


            return response.json();

        })

        .then(data => {

            console.log(
                "Monthly Revenue:",
                data
            );


            // =========================================
            // CHECK DATA
            // =========================================

            if (
                !Array.isArray(data)
            ) {

                console.error(
                    "Revenue data is not an array",
                    data
                );

                return;

            }


            // =========================================
            // PREPARE LABELS
            // =========================================

            const labels =
                data.map(
                    item =>
                        item.month || ""
                );


            // =========================================
            // PREPARE REVENUE
            // =========================================

            const revenues =
                data.map(
                    item =>
                        Number(
                            item.revenue || 0
                        )
                );


            // =========================================
            // DESTROY OLD CHART
            // =========================================

            if (
                revenueChartInstance
            ) {

                revenueChartInstance.destroy();

                revenueChartInstance =
                    null;

            }


            // =========================================
            // CREATE REVENUE CHART
            // =========================================

            revenueChartInstance =
                new Chart(
                    revenueCanvas,
                    {

                        type: "line",


                        data: {

                            labels: labels,


                            datasets: [

                                {

                                    label:
                                        "Revenue",


                                    data:
                                        revenues,


                                    borderColor:
                                        "#A6572E",


                                    backgroundColor:
                                        "rgba(166, 87, 46, 0.15)",


                                    borderWidth:
                                        3,


                                    fill:
                                        true,


                                    tension:
                                        0.4,


                                    pointRadius:
                                        5,


                                    pointHoverRadius:
                                        8,


                                    pointBackgroundColor:
                                        "#A6572E",


                                    pointBorderColor:
                                        "#FFFFFF",


                                    pointBorderWidth:
                                        2

                                }

                            ]

                        },


                        options: {

                            responsive:
                                true,


                            maintainAspectRatio:
                                false,


                            animation: {

                                duration:
                                    800

                            },


                            plugins: {

                                legend: {

                                    display:
                                        true,

                                    position:
                                        "top"

                                },


                                tooltip: {

                                    callbacks: {

                                        label:
                                            function (
                                                context
                                            ) {

                                                return (
                                                    " Revenue: ₹" +
                                                    Number(
                                                        context.raw || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                );

                                            }

                                    }

                                }

                            },


                            scales: {

                                x: {

                                    grid: {

                                        display:
                                            false

                                    }

                                },


                                y: {

                                    beginAtZero:
                                        true,


                                    ticks: {

                                        callback:
                                            function (
                                                value
                                            ) {

                                                return (
                                                    "₹" +
                                                    Number(
                                                        value
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                );

                                            }

                                    }

                                }

                            }

                        }

                    }
                );

        })

        .catch(error => {

            console.error(
                "Revenue Chart Error:",
                error
            );

        });

}


// =====================================================
// LOAD REPORT TABLE
// =====================================================

function loadReportTable() {

    if (!reportTableBody) {

        console.error(
            "Report table body not found"
        );

        return;

    }


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
                "Orders for Report:",
                orders
            );


            displayReportTable(
                orders
            );

        })

        .catch(error => {

            console.error(
                "Report Table Error:",
                error
            );


            reportTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;"
                    >

                        Failed to load report data

                    </td>

                </tr>

            `;

        });

}


// =====================================================
// DISPLAY REPORT TABLE
// =====================================================

function displayReportTable(
    orders
) {

    if (!reportTableBody) {

        return;

    }


    reportTableBody.innerHTML =
        "";


    // =========================================
    // NO ORDERS
    // =========================================

    if (
        !orders ||
        orders.length === 0
    ) {

        reportTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;"
                >

                    No orders found

                </td>

            </tr>

        `;

        return;

    }


    // =========================================
    // CREATE TABLE ROWS
    // =========================================

    orders.forEach(
        (order, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            // =====================================
            // ORDER ID
            // =====================================

            const orderId =
                "ORD" +
                String(
                    order.orderId || 0
                ).padStart(
                    3,
                    "0"
                );


            // =====================================
            // DATE
            // =====================================

            const date =
                formatOrderDate(
                    order.orderDate
                );


            // =====================================
            // AMOUNT
            // =====================================

            const amount =
                Number(
                    order.totalAmount || 0
                ).toLocaleString(
                    "en-IN"
                );


            // =====================================
            // STATUS
            // =====================================

            const status =
                order.status ||
                "UNKNOWN";


            const statusClass =
                getStatusClass(
                    status
                );


            // =====================================
            // CUSTOMER
            // =====================================

            const customerName =
                order.customerName ||
                "Unknown Customer";


            // =====================================
            // PRODUCT
            // =====================================

            const productName =
                order.productName ||
                "Unknown Product";


            // =====================================
            // ROW HTML
            // =====================================

            row.innerHTML = `

                <td>
                    ${date}
                </td>

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
                    ₹${amount}
                </td>

                <td>

                    <span
                        class="status ${statusClass}"
                    >

                        ${status}

                    </span>

                </td>

            `;


            reportTableBody.appendChild(
                row
            );


            // =====================================
            // ROW ANIMATION
            // =====================================

            row.style.opacity =
                "0";

            row.style.transform =
                "translateX(-20px)";


            setTimeout(
                () => {

                    row.style.transition =
                        "0.4s";

                    row.style.opacity =
                        "1";

                    row.style.transform =
                        "translateX(0)";

                },

                index * 80

            );

        }
    );

}


// =====================================================
// FORMAT ORDER DATE
// =====================================================

function formatOrderDate(
    orderDate
) {

    if (!orderDate) {

        return "-";

    }


    const date =
        new Date(
            orderDate
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
    status
) {

    const value =
        String(
            status || ""
        )
            .toLowerCase()
            .trim();


    if (
        value ===
        "delivered"
    ) {

        return "delivered";

    }


    if (
        value ===
        "in progress"
    ) {

        return "processing";

    }


    if (
        value ===
        "processing"
    ) {

        return "processing";

    }


    if (
        value ===
        "pending"
    ) {

        return "pending";

    }


    if (
        value ===
        "cancelled"
    ) {

        return "cancelled";

    }


    return "pending";

}


// =====================================================
// DATE FILTER
// =====================================================

const filterBtn =
    document.getElementById(
        "filterBtn"
    );


if (filterBtn) {

    filterBtn.addEventListener(
        "click",
        function () {

            const fromDateElement =
                document.getElementById(
                    "fromDate"
                );

            const toDateElement =
                document.getElementById(
                    "toDate"
                );


            const fromDate =
                fromDateElement
                    ? fromDateElement.value
                    : "";


            const toDate =
                toDateElement
                    ? toDateElement.value
                    : "";


            if (
                !fromDate ||
                !toDate
            ) {

                alert(
                    "Please select both dates"
                );

                return;

            }


            if (
                fromDate >
                toDate
            ) {

                alert(
                    "From date cannot be greater than To date"
                );

                return;

            }


            alert(
                "Date filter backend connection will be added next."
            );

        }
    );

}


// =====================================================
// PRINT REPORT
// =====================================================

const printBtn =
    document.getElementById(
        "printBtn"
    );


if (printBtn) {

    printBtn.addEventListener(
        "click",
        function () {

            window.print();

        }
    );

}


// =====================================================
// EXPORT REPORT
// =====================================================

const exportBtn =
    document.getElementById(
        "exportBtn"
    );


if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        function () {

            exportReport();

        }
    );

}


// =====================================================
// EXPORT REPORT AS CSV
// =====================================================

function exportReport() {

    const table =
        document.querySelector(
            "table"
        );


    if (!table) {

        alert(
            "Report table not found"
        );

        return;

    }


    const rows =
        table.querySelectorAll(
            "tr"
        );


    if (
        !rows ||
        rows.length === 0
    ) {

        alert(
            "No report data available"
        );

        return;

    }


    let csv =
        "";


    rows.forEach(
        row => {

            const columns =
                row.querySelectorAll(
                    "th, td"
                );


            const rowData =
                [];


            columns.forEach(
                column => {

                    let value =
                        column.innerText
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();


                    value =
                        value.replace(
                            /"/g,
                            '""'
                        );


                    value =
                        `"${value}"`;


                    rowData.push(
                        value
                    );

                }
            );


            csv +=
                rowData.join(",") +
                "\n";

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "LuxeCraft-Report.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =====================================================
// STATISTICS CARDS ANIMATION
// =====================================================

const cards =
    document.querySelectorAll(
        ".statistics .card"
    );


cards.forEach(
    (card, index) => {

        card.style.opacity =
            "0";


        card.style.transform =
            "translateY(25px)";


        setTimeout(
            () => {

                card.style.transition =
                    "0.5s";


                card.style.opacity =
                    "1";


                card.style.transform =
                    "translateY(0)";

            },

            index * 150

        );

    }
);


// =====================================================
// REVENUE CHART CARD ANIMATION
// =====================================================

const revenueChartCard =
    document.querySelector(
        ".charts-container .chart-card"
    );


if (revenueChartCard) {

    revenueChartCard.style.opacity =
        "0";


    revenueChartCard.style.transform =
        "translateY(30px)";


    setTimeout(
        () => {

            revenueChartCard.style.transition =
                "0.6s";


            revenueChartCard.style.opacity =
                "1";


            revenueChartCard.style.transform =
                "translateY(0)";

        },

        500

    );

}


// =====================================================
// PAGE LOAD
// =====================================================

loadReportSummary();

loadRevenueChart();

loadReportTable();