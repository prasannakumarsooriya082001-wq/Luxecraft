console.log("Add Customer JS Loaded");


// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

const loggedInAdmin =JSON.parse(localStorage.getItem("loggedInAdmin"));

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
// ELEMENTS
// =====================================================

const customerForm =
    document.getElementById("customerForm");

const cancelBtn =
    document.querySelector(".cancel-btn");


// =====================================================
// SAVE CUSTOMER
// =====================================================

if (customerForm) {

    customerForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            // =================================================
            // GET VALUES
            // =================================================

            const firstName =
                document.getElementById("firstName")
                    .value
                    .trim();


            const lastName =
                document.getElementById("lastName")
                    .value
                    .trim();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const phone =
                document.getElementById("phone")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    ? document.getElementById("password")
                        .value
                        .trim()
                    : "Customer@123";


            // =================================================
            // VALIDATION
            // =================================================

            if (
                firstName === "" ||
                lastName === "" ||
                email === "" ||
                phone === ""
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            // =================================================
            // CUSTOMER OBJECT
            // =================================================

            const customerData = {

                firstName: firstName,

                lastName: lastName,

                email: email,

                phone: phone,

                password: password

            };


            console.log(
                "Customer Data:",
                customerData
            );


            // =================================================
            // API CALL
            // =================================================

            fetch(
                `${API_BASE_URL}/customer/register`,
                {

                    method: "POST",

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
                        "Add Customer API Status:",
                        response.status
                    );


                    if (!response.ok) {

                        throw new Error(
                            "Failed to add customer"
                        );

                    }


                    return response.json();

                })

                .then(data => {

                    console.log(
                        "Customer Added:",
                        data
                    );


                    alert(
                        "Customer added successfully!"
                    );


                    window.location.href =
                        "/frontend/pages/admin-customers/admin-customers.html";

                })

                .catch(error => {

                    console.error(
                        "Add Customer Error:",
                        error
                    );


                    alert(
                        "Failed to add customer."
                    );

                });

        }
    );

}


// =====================================================
// CANCEL BUTTON
// =====================================================

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function () {

            const confirmCancel =
                confirm(
                    "Are you sure you want to discard changes?"
                );


            if (confirmCancel) {

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

    formCard.style.opacity =
        "0";

    formCard.style.transform =
        "translateY(30px)";


    setTimeout(() => {

        formCard.style.transition =
            ".5s ease";

        formCard.style.opacity =
            "1";

        formCard.style.transform =
            "translateY(0)";

    }, 200);

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function () {

        console.log(
            "Add Customer Page Loaded Successfully"
        );

    }
);