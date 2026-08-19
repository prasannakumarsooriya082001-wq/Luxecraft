console.log("Admin Customers JS Loaded");


// ==========================
// ADMIN LOGIN CHECK
// ==========================

const loggedInAdmin = JSON.parse(localStorage.getItem("loggedInAdmin"));


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


// ==========================
// ELEMENTS
// ==========================

const tableBody =document.getElementById("customerTableBody");

const searchInput = document.getElementById("search");

const statusFilter = document.getElementById("statusFilter");


// ==========================
// CUSTOMER DATA
// ==========================

let customers = [];


// ==========================
// LOAD CUSTOMERS
// ==========================

function loadCustomers() {

    fetch(
        `${API_BASE_URL}/customer/admin/all`,
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
                "Customer API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load customers"
                );

            }


            return response.json();

        })

        .then(data => {

            console.log(
                "Customers:",
                data
            );


            customers = data;

            displayCustomers(customers);

        })

        .catch(error => {

            console.error(
                "Customer Loading Error:",
                error
            );

        });

}


// ==========================
// DISPLAY CUSTOMERS
// ==========================

function displayCustomers(data) {

    tableBody.innerHTML = "";


    if (data.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center;">

                    No customers found

                </td>

            </tr>

        `;

        return;

    }


    data.forEach(customer => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${customer.firstName}
                ${customer.lastName}
            </td>

            <td>
                ${customer.email}
            </td>

            <td>
                ${customer.phone}
            </td>

            <td>
                ${customer.orderCount}
            </td>

            <td>

                <span class="active-status">

                    Active

                </span>

            </td>

            <td>

                <a
                    href="/pages/admin-customer-details/admin-customer-details.html?id=${customer.customerId}"
                    class="view-btn">

                    <i class="fa-solid fa-eye"></i>

                </a>

                <a
                    href="/pages/edit-customers/edit-customers.html?id=${customer.customerId}"
                    class="edit-btn">

                    <i class="fa-solid fa-pen"></i>

                </a>

                <button
                    class="delete-btn"
                    data-id="${customer.customerId}">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    addDeleteEvents();

}


// ==========================
// SEARCH
// ==========================

if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function () {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                customers.filter(customer => {

                    const fullName =
                        customer.firstName +
                        " " +
                        customer.lastName;


                    return (

                        fullName
                            .toLowerCase()
                            .includes(searchValue)

                        ||

                        customer.email
                            .toLowerCase()
                            .includes(searchValue)

                        ||

                        customer.phone
                            .toLowerCase()
                            .includes(searchValue)

                    );

                });


            displayCustomers(filtered);

        }
    );

}


// ==========================
// STATUS FILTER
// ==========================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        function () {

            const value =
                statusFilter.value;


            if (value === "all") {

                displayCustomers(customers);

                return;

            }


            // Current CustomerModel
            // does not have status field.

            if (value === "active") {

                displayCustomers(customers);

            }

            else {

                displayCustomers([]);

            }

        }
    );

}


// ==========================
// DELETE EVENTS
// ==========================

function addDeleteEvents() {

    const deleteButtons =
        document.querySelectorAll(
            ".delete-btn"
        );


    deleteButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const customerId =
                    this.dataset.id;


                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this customer?"
                    );


                if (!confirmDelete) {

                    return;

                }


                deleteCustomer(customerId);

            }
        );

    });

}


// ==========================
// DELETE CUSTOMER
// ==========================

function deleteCustomer(customerId) {

    fetch(
        `${API_BASE_URL}/customer/admin/`
        + customerId,
        {

            method: "DELETE",

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
                    "Failed to delete customer"
                );

            }


            alert(
                "Customer deleted successfully"
            );


            loadCustomers();

        })

        .catch(error => {

            console.error(
                "Delete Customer Error:",
                error
            );


            alert(
                "Failed to delete customer"
            );

        });

}


// ==========================
// LOAD PAGE
// ==========================

loadCustomers();


// ==========================
// PAGE LOADED
// ==========================

window.addEventListener(
    "load",
    function () {

        console.log(
            "Customers Page Loaded Successfully"
        );

    }
);