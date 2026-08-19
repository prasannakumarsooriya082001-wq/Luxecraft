console.log("Orders JS Loaded");


window.onload = function () {

    console.log("Orders Page Loaded");

    loadOrders();

};


// ================= LOAD MY ORDERS =================

function loadOrders() {

    const loggedInCustomer =
        JSON.parse(
            localStorage.getItem("loggedInCustomer")
        );


    // LOGIN CHECK

    if (!loggedInCustomer) {

        window.location.href =
            "/pages/login/login.html";

        return;

    }


    console.log("Loading orders...");


    fetch(`${API_BASE_URL}/order`, {

        method: "GET",

        headers: {

            "Authorization":
                "Bearer " + loggedInCustomer.token

        }

    })

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
                "Orders received from DB:",
                orders
            );


            displayOrders(orders);

        })

        .catch(error => {

            console.error(
                "Orders Error:",
                error
            );

        });

}



// ================= DISPLAY ORDERS =================

function displayOrders(orders) {

    const ordersList =
        document.getElementById("ordersList");


    ordersList.innerHTML = "";


    if (!orders || orders.length === 0) {

        ordersList.innerHTML = `

            <div class="empty-orders">

                <h2>No Orders Yet</h2>

                <p>
                    You haven't placed any orders yet.
                </p>

            </div>

        `;

        return;

    }


    // Latest order first

    orders.sort(
        (a, b) =>
            b.orderId - a.orderId
    );


    orders.forEach(order => {

        ordersList.innerHTML += `

            <div class="order-card">

                <div class="order-header">

                    <div>

                        <span>Order ID</span>

                        <h3>
                            #LC${String(order.orderId)
                .padStart(6, "0")}
                        </h3>

                    </div>


                    <div>

                        <span>Status</span>

                        <h3 class="status">

                            ${order.status}

                        </h3>

                    </div>

                </div>


                <div class="order-details">

                    <div>

                        <span>Customer</span>

                        <p>
                            ${order.firstName}
                            ${order.lastName}
                        </p>

                    </div>


                    <div>

                        <span>Subtotal</span>

                        <p>
                            ₹${Number(order.subtotal)
                .toFixed(2)}
                        </p>

                    </div>


                    <div>

                        <span>Tax</span>

                        <p>
                            ₹${Number(order.tax)
                .toFixed(2)}
                        </p>

                    </div>


                    <div>

                        <span>Total</span>

                        <p>
                            ₹${Number(order.totalAmount)
                .toFixed(2)}
                        </p>

                    </div>

                </div>


                <button
                    onclick="viewOrderDetails(${order.orderId})">

                    View Details

                </button>

            </div>

        `;

    });

}



// ================= VIEW ORDER DETAILS =================

function viewOrderDetails(orderId) {

    console.log(
        "Selected Order ID:",
        orderId
    );


    localStorage.setItem(
        "selectedOrderId",
        orderId
    );


    window.location.href =
        "/pages/order-details/order-details.html";

}