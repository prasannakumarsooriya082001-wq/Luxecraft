console.log("Admin Settings JS Loaded");


// =====================================================
// GET LOGGED IN ADMIN
// =====================================================

const loggedInAdmin =
    JSON.parse(
        localStorage.getItem("loggedInAdmin")
    );


// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

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

const profileForm =
    document.getElementById("profileForm");

const passwordForm =
    document.getElementById("passwordForm");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const updatePasswordBtn =
    document.getElementById("updatePasswordBtn");

const saveSettingsBtn =
    document.getElementById("saveSettingsBtn");


// =====================================================
// LOAD ADMIN PROFILE
// =====================================================

function loadAdminProfile() {

    fetch(
        `${API_BASE_URL}/admin/profile`,
        {

            method: "GET",

            headers: {

                "Authorization":
                    "Bearer " +
                    loggedInAdmin.token,

                "X-Admin-Email":
                    loggedInAdmin.email

            }

        }
    )

        .then(response => {

            console.log(
                "Admin Profile Status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load admin profile"
                );

            }


            return response.json();

        })

        .then(admin => {

            console.log(
                "Admin Profile:",
                admin
            );


            // =============================================
            // NAME
            // =============================================

            const nameElement =
                document.getElementById("name");


            if (nameElement) {

                nameElement.value =
                    admin.name || "";

            }


            // =============================================
            // EMAIL
            // =============================================

            const emailElement =
                document.getElementById("email");


            if (emailElement) {

                emailElement.value =
                    admin.email || "";

            }


            // =============================================
            // PHONE
            // =============================================

            const phoneElement =
                document.getElementById("phone");


            if (phoneElement) {

                phoneElement.value =
                    admin.phone || "";

            }

        })

        .catch(error => {

            console.error(
                "Admin Profile Error:",
                error
            );

        });

}


// =====================================================
// SAVE PROFILE
// =====================================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // =========================================
            // GET VALUES
            // =========================================

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            // =========================================
            // EMPTY VALIDATION
            // =========================================

            if (
                name === "" ||
                email === "" ||
                phone === ""
            ) {

                alert(
                    "Please fill all profile details."
                );

                return;

            }


            // =========================================
            // EMAIL VALIDATION
            // =========================================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            // =========================================
            // PHONE VALIDATION
            // =========================================

            const phonePattern =
                /^[0-9+\-\s]{10,15}$/;


            if (
                !phonePattern.test(phone)
            ) {

                alert(
                    "Please enter a valid phone number."
                );

                return;

            }


            // =========================================
            // BACKEND UPDATE
            // =========================================

            fetch(
                `${API_BASE_URL}/admin/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            loggedInAdmin.token,

                        "X-Admin-Email":
                            loggedInAdmin.email

                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            email:
                                email,

                            phone:
                                phone

                        })

                }
            )

                .then(response => {

                    console.log(
                        "Update Profile Status:",
                        response.status
                    );


                    if (!response.ok) {

                        throw new Error(
                            "Failed to update profile"
                        );

                    }


                    return response.json();

                })

                .then(updatedAdmin => {

                    console.log(
                        "Updated Admin:",
                        updatedAdmin
                    );


                    // =====================================
                    // UPDATE LOCAL STORAGE
                    // =====================================

                    loggedInAdmin.email =
                        updatedAdmin.email ||
                        email;


                    localStorage.setItem(
                        "loggedInAdmin",
                        JSON.stringify(
                            loggedInAdmin
                        )
                    );


                    alert(
                        "✅ Profile Updated Successfully!"
                    );

                })

                .catch(error => {

                    console.error(
                        "Profile Update Error:",
                        error
                    );


                    alert(
                        "❌ Failed to update profile."
                    );

                });

        }
    );

}


// =====================================================
// SHOW / HIDE PASSWORD
// =====================================================

const togglePassword =
    document.querySelectorAll(
        ".toggle-password"
    );


togglePassword.forEach(
    icon => {

        icon.addEventListener(
            "click",
            function () {

                const input =
                    this.previousElementSibling;


                if (!input) {

                    return;

                }


                // =====================================
                // SHOW PASSWORD
                // =====================================

                if (
                    input.type === "password"
                ) {

                    input.type =
                        "text";


                    this.classList.remove(
                        "fa-eye"
                    );


                    this.classList.add(
                        "fa-eye-slash"
                    );

                }

                // =====================================
                // HIDE PASSWORD
                // =====================================

                else {

                    input.type =
                        "password";


                    this.classList.remove(
                        "fa-eye-slash"
                    );


                    this.classList.add(
                        "fa-eye"
                    );

                }

            }
        );

    }
);


// =====================================================
// UPDATE PASSWORD
// =====================================================

if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // =========================================
            // GET PASSWORD VALUES
            // =========================================

            const currentPassword =
                document
                    .getElementById(
                        "currentPassword"
                    )
                    .value
                    .trim();


            const newPassword =
                document
                    .getElementById(
                        "newPassword"
                    )
                    .value
                    .trim();


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    .value
                    .trim();


            // =========================================
            // EMPTY VALIDATION
            // =========================================

            if (
                currentPassword === "" ||
                newPassword === "" ||
                confirmPassword === ""
            ) {

                alert(
                    "Please fill all password fields."
                );

                return;

            }


            // =========================================
            // PASSWORD LENGTH
            // =========================================

            if (
                newPassword.length < 6
            ) {

                alert(
                    "New Password must contain at least 6 characters."
                );

                return;

            }


            // =========================================
            // PASSWORD MATCH
            // =========================================

            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "New Password and Confirm Password do not match."
                );

                return;

            }


            // =========================================
            // SAME PASSWORD CHECK
            // =========================================

            if (
                currentPassword ===
                newPassword
            ) {

                alert(
                    "New Password must be different from current password."
                );

                return;

            }


            // =========================================
            // BACKEND PASSWORD UPDATE
            // =========================================

            fetch(
                `${API_BASE_URL}/admin/change-password`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            loggedInAdmin.token,

                        "X-Admin-Email":
                            loggedInAdmin.email

                    },

                    body:
                        JSON.stringify({

                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword

                        })

                }
            )

                .then(response => {

                    console.log(
                        "Password Update Status:",
                        response.status
                    );


                    if (!response.ok) {

                        throw new Error(
                            "Password update failed"
                        );

                    }


                    return response.text();

                })

                .then(message => {

                    console.log(
                        "Password Response:",
                        message
                    );


                    alert(
                        "✅ Password Updated Successfully!"
                    );


                    passwordForm.reset();


                    // =====================================
                    // RESET EYE ICONS
                    // =====================================

                    document
                        .querySelectorAll(
                            ".toggle-password"
                        )
                        .forEach(
                            icon => {

                                icon.classList.remove(
                                    "fa-eye-slash"
                                );

                                icon.classList.add(
                                    "fa-eye"
                                );

                            }
                        );

                })

                .catch(error => {

                    console.error(
                        "Password Update Error:",
                        error
                    );


                    alert(
                        "❌ Failed to update password."
                    );

                });

        }
    );

}


// =====================================================
// SAVE ALL SETTINGS
// =====================================================

if (saveSettingsBtn) {

    saveSettingsBtn.addEventListener(
        "click",
        function () {

            // =========================================
            // PROFILE VALIDATION
            // =========================================

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            if (
                name === "" ||
                email === "" ||
                phone === ""
            ) {

                alert(
                    "Please complete your profile details."
                );

                return;

            }


            alert(
                "✅ All Settings Saved Successfully!"
            );

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logoutLink =
    document.querySelector(
        'a[href="/pages/login/login.html"]'
    );


if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "loggedInAdmin"
            );

        }
    );

}


// =====================================================
// CARDS ANIMATION
// =====================================================

const cards =
    document.querySelectorAll(
        ".card"
    );


cards.forEach(
    (card, index) => {

        card.style.opacity =
            "0";


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

            index * 150

        );

    }
);


// =====================================================
// PAGE LOAD
// =====================================================

loadAdminProfile();