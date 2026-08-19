console.log("Edit Customer JS Loaded");


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

const urlParams =
    new URLSearchParams(window.location.search);

const customerId =
    urlParams.get("id");

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
// ELEMENTS
// =====================================================

const customerForm =
    document.getElementById("customerForm");

const customerName =
    document.getElementById("customerName");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const status =
    document.getElementById("status");

const address =
    document.getElementById("address");

const cancelBtn =
    document.querySelector(".cancel-btn");


// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer() {

    fetch(
        `${API_BASE_URL}/customer/admin/`
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
            "Customer API Status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load customer"
            );

        }

        return response.json();

    })

    .then(customer => {

        console.log(
            "Customer:",
            customer
        );


        // =================================================
        // NAME
        // =================================================

        customerName.value =
            (
                customer.firstName +
                " " +
                customer.lastName
            ).trim();


        // =================================================
        // EMAIL
        // =================================================

        email.value =
            customer.email || "";


        // =================================================
        // PHONE
        // =================================================

        phone.value =
            customer.phone || "";


        // =================================================
        // STATUS
        // =================================================

        status.value =
            customer.status || "ACTIVE";


        // =================================================
        // ADDRESS
        // =================================================

        address.value =
            customer.address || "";

    })

    .catch(error => {

        console.error(
            "Customer Loading Error:",
            error
        );

        alert(
            "Failed to load customer"
        );

    });

}


// =====================================================
// UPDATE CUSTOMER
// =====================================================

customerForm.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();


        // =================================================
        // GET NAME
        // =================================================

        const fullName =
            customerName.value.trim();


        if (!fullName) {

            alert(
                "Please enter customer name"
            );

            return;

        }


        // =================================================
        // SPLIT FIRST NAME / LAST NAME
        // =================================================

        const nameParts =
            fullName.split(" ");


        const firstName =
            nameParts.shift();


        const lastName =
            nameParts.join(" ");


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !email.value.trim() ||
            !phone.value.trim()
        ) {

            alert(
                "Please fill all required fields"
            );

            return;

        }


        // =================================================
        // CUSTOMER OBJECT
        // =================================================

        const customerData = {

            firstName: firstName,

            lastName: lastName,

            email:
                email.value.trim(),

            phone:
                phone.value.trim(),

            role: "CUSTOMER"

        };


        console.log(
            "Updating Customer:",
            customerData
        );


        // =================================================
        // UPDATE API
        // =================================================

        fetch(
            `${API_BASE_URL}/customer/admin/`
            + customerId,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        loggedInAdmin.token

                },

                body:
                    JSON.stringify(
                        customerData
                    )

            }
        )

        .then(response => {

            console.log(
                "Update API Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to update customer"
                );

            }


            return response.json();

        })

        .then(updatedCustomer => {

            console.log(
                "Updated Customer:",
                updatedCustomer
            );


            alert(
                "Customer updated successfully!"
            );


            window.location.href =
                "/frontend/pages/admin-customers/admin-customers.html";

        })

        .catch(error => {

            console.error(
                "Update Customer Error:",
                error
            );


            alert(
                "Failed to update customer"
            );

        });

    }
);


// =====================================================
// CANCEL
// =====================================================

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            if (
                confirm(
                    "Discard changes?"
                )
            ) {

                window.location.href =
                    "/frontend/pages/admin-customers/admin-customers.html";

            }

        }
    );

}


// =====================================================
// INPUT ANIMATION
// =====================================================

const inputs =
    document.querySelectorAll(
        "input, textarea, select"
    );


inputs.forEach(input => {

    input.addEventListener(
        "focus",
        function () {

            this.style.transition =
                ".3s";

            this.style.transform =
                "scale(1.02)";

        }
    );


    input.addEventListener(
        "blur",
        function () {

            this.style.transform =
                "scale(1)";

        }
    );

});


// =====================================================
// FORM ANIMATION
// =====================================================

const formCard =
    document.querySelector(".form-card");


if (formCard) {

    formCard.style.opacity = "0";

    formCard.style.transform =
        "translateY(30px)";


    setTimeout(() => {

        formCard.style.transition =
            ".5s";

        formCard.style.opacity = "1";

        formCard.style.transform =
            "translateY(0)";

    }, 200);

}


// =====================================================
// LOAD PAGE
// =====================================================

loadCustomer();