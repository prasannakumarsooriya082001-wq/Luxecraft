console.log("Login JS Loaded");


// ================= PASSWORD TOGGLE =================

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.classList.remove("fa-eye");

        togglePassword.classList.add("fa-eye-slash");

    } else {

        passwordInput.type = "password";

        togglePassword.classList.remove("fa-eye-slash");

        togglePassword.classList.add("fa-eye");

    }

});


// ================= LOGIN TABS =================

const userTab =
    document.getElementById("userTab");

const adminTab =
    document.getElementById("adminTab");

const loginTitle =
    document.getElementById("loginTitle");

const loginDescription =
    document.getElementById("loginDescription");

const registerLink =
    document.getElementById("registerLink");

const forgotPasswordLink =
    document.getElementById("forgotPasswordLink");


// ================= LOGIN TYPE =================

// Default login type is USER

let loginType = "USER";


// ================= USER TAB =================

userTab.addEventListener("click", () => {

    loginType = "USER";

    // Active tab

    userTab.classList.add("active");

    adminTab.classList.remove("active");


    // Change title

    loginTitle.textContent =
        "Welcome Back";


    // Change description

    loginDescription.textContent =
        "Login to continue shopping.";


    // Show User options

    registerLink.style.display =
        "block";

    forgotPasswordLink.style.display =
        "inline";

});


// ================= ADMIN TAB =================

adminTab.addEventListener("click", () => {

    loginType = "ADMIN";

    // Active tab

    adminTab.classList.add("active");

    userTab.classList.remove("active");


    // Change title

    loginTitle.textContent =
        "Administrator Login";


    // Change description

    loginDescription.textContent =
        "Login to manage products, orders and customers.";


    // Hide User options

    registerLink.style.display =
        "none";

    forgotPasswordLink.style.display =
        "none";

});


// ================= LOGIN FORM =================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // ================= GET INPUT =================

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // ================= VALIDATION =================

    if (email === "" || password === "") {

        alert("Please enter email and password.");

        return;

    }


    // ================= LOGIN DATA =================

    const loginData = {

        email: email,

        password: password

    };


    // ================= SELECT API =================

    let loginUrl;


    if (loginType === "ADMIN") {

        loginUrl =
            `${API_BASE_URL}/admin/login`;

    } else {

        loginUrl =
            `${API_BASE_URL}/customer/login`;

    }


    console.log("Login Type :", loginType);

    console.log("Login URL :", loginUrl);


    // ================= LOGIN API =================

    fetch(loginUrl, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body:
            JSON.stringify(loginData)

    })

        .then(response => {

            console.log(
                "Login Status :",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Invalid email or password"
                );

            }


            return response.json();

        })

        .then(loginResponse => {

            console.log(
                "Login Success :",
                loginResponse
            );


            // ================= ADMIN LOGIN =================

            if (loginType === "ADMIN") {



                const adminData = {

                    token: loginResponse.token,

                    name:
                        loginResponse.name ||
                        loginResponse.firstName ,
                        // loginResponse.email.split("@")[0],

                    email:
                        loginResponse.email,

                    role:
                        loginResponse.role

                };


                localStorage.setItem(
                    "loggedInAdmin",
                    JSON.stringify(adminData)
                );


                console.log(
                    "Saved Admin :",
                    localStorage.getItem(
                        "loggedInAdmin"
                    )
                );
                // localStorage.setItem(
                //     "loggedInAdmin",
                //     JSON.stringify(loginResponse)
                // );


                // console.log(
                //     "Saved Admin :",
                //     localStorage.getItem(
                //         "loggedInAdmin"
                //     )
                // );


                // Admin Dashboard

                window.location.replace(
                    "/frontend/pages/dashboard/dashboard.html"
                );


            }


            // ================= USER LOGIN =================

            else {

                localStorage.setItem(
                    "loggedInCustomer",
                    JSON.stringify(loginResponse)
                );


                console.log(
                    "Saved Customer :",
                    localStorage.getItem(
                        "loggedInCustomer"
                    )
                );


                // If a login-gated link sent them here, carry on to where
                // they were actually going. Otherwise land on the home page.

                const pendingRedirect =
                    localStorage.getItem("redirectAfterLogin");

                localStorage.removeItem("redirectAfterLogin");

                window.location.replace(
                    // Only ever an in-app path, never an absolute URL from
                    // somewhere else - that would be an open redirect.
                    pendingRedirect && pendingRedirect.startsWith("/frontend/")
                        ? pendingRedirect
                        : "/frontend/index.html"
                );

            }

        })

        .catch(error => {

            console.error(
                "Login Error :",
                error
            );


            alert(
                "Invalid email or password"
            );

        });

});