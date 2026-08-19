console.log("Reset Password JS Loaded");


// =====================================================
// ELEMENTS
// =====================================================

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const toggleNew =
    document.getElementById("toggleNewPassword");

const toggleConfirm =
    document.getElementById("toggleConfirmPassword");

const form =
    document.getElementById("resetForm");

const message =
    document.getElementById("matchMessage");

const updateButton =
    document.querySelector(".update-btn");


// =====================================================
// GET RESET EMAIL
// =====================================================

const email =
    sessionStorage.getItem("resetEmail");


// =====================================================
// CHECK OTP VERIFICATION
// =====================================================

const otpVerified =
    sessionStorage.getItem("otpVerified");


if (!email || otpVerified !== "true") {

    alert(
        "Invalid password reset session. Please try again."
    );

    window.location.href =
        "/pages/forgot-password/forgot-password.html";

}


// =====================================================
// SHOW / HIDE PASSWORD
// =====================================================

function togglePassword(input, icon) {

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

    }

}


toggleNew.addEventListener(
    "click",
    function () {

        togglePassword(
            newPassword,
            toggleNew
        );

    }
);


toggleConfirm.addEventListener(
    "click",
    function () {

        togglePassword(
            confirmPassword,
            toggleConfirm
        );

    }
);


// =====================================================
// PASSWORD MATCH
// =====================================================

function checkPassword() {

    if (confirmPassword.value === "") {

        message.textContent = "";

        return;

    }


    if (
        newPassword.value ===
        confirmPassword.value
    ) {

        message.textContent =
            "✔ Passwords Match";

        message.style.color =
            "green";

    } else {

        message.textContent =
            "✖ Passwords Do Not Match";

        message.style.color =
            "red";

    }

}


newPassword.addEventListener(
    "input",
    checkPassword
);

confirmPassword.addEventListener(
    "input",
    checkPassword
);


// =====================================================
// RESET PASSWORD
// =====================================================

form.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const password =
            newPassword.value.trim();

        const confirm =
            confirmPassword.value.trim();


        // =================================================
        // VALIDATION
        // =================================================

        if (password === "") {

            alert(
                "Please enter a new password."
            );

            return;

        }


        if (password.length < 8) {

            alert(
                "Password must contain at least 8 characters."
            );

            return;

        }


        if (password !== confirm) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        // =================================================
        // BUTTON LOADING
        // =================================================

        updateButton.disabled = true;

        updateButton.textContent =
            "Updating...";


        try {

            // =================================================
            // RESET PASSWORD API
            // =================================================

            const response = await fetch(
                `${API_BASE_URL}/customer/reset-password?email=`
                + encodeURIComponent(email)
                + "&newPassword="
                + encodeURIComponent(password),
                {
                    method: "POST"
                }
            );


            const result =
                await response.text();


            console.log(
                "Reset Password Status:",
                response.status
            );

            console.log(
                "Reset Password Response:",
                result
            );


            // =================================================
            // API ERROR
            // =================================================

            if (!response.ok) {

                throw new Error(result);

            }


            // =================================================
            // SUCCESS
            // =================================================

            alert(
                "Password updated successfully."
            );


            // Remove reset session

            sessionStorage.removeItem(
                "resetEmail"
            );

            sessionStorage.removeItem(
                "otpVerified"
            );


            // Go to Login

            window.location.href =
                "/pages/login/login.html";


        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );


            alert(
                error.message ||
                "Unable to reset password."
            );


        } finally {

            updateButton.disabled = false;

            updateButton.textContent =
                "Update Password";

        }

    }
);