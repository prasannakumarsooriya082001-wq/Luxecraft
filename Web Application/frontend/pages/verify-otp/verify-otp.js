console.log("Verify OTP JS Loaded");

const inputs =
    document.querySelectorAll(".otp-inputs input");

const otpForm =
    document.getElementById("otpForm");


// =====================================================
// OTP INPUT
// =====================================================

inputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        // Allow numbers only
        input.value =
            input.value.replace(/[^0-9]/g, "");

        // Move to next box
        if (
            input.value &&
            index < inputs.length - 1
        ) {
            inputs[index + 1].focus();
        }

    });


    input.addEventListener("keydown", function (e) {

        // Backspace
        if (
            e.key === "Backspace" &&
            input.value === "" &&
            index > 0
        ) {
            inputs[index - 1].focus();
        }

    });

});


// =====================================================
// VERIFY OTP
// =====================================================

otpForm.addEventListener("submit", async function (e) {

    e.preventDefault();


    // Get email
    const email =
        sessionStorage.getItem("resetEmail");


    if (!email) {

        alert(
            "Email information not found. Please try again."
        );

        window.location.href =
            "/pages/forgot-password/forgot-password.html";

        return;
    }


    // Get OTP
    let otp = "";

    inputs.forEach(input => {

        otp += input.value;

    });


    // Check 6 digit OTP
    if (otp.length !== 6) {

        alert("Please enter the 6-digit OTP.");

        return;
    }


    console.log("Email:", email);
    console.log("OTP:", otp);


    try {

        const response = await fetch(
            `${API_BASE_URL}/customer/verify-otp?email=`
            + encodeURIComponent(email)
            + "&otp="
            + encodeURIComponent(otp),
            {
                method: "POST"
            }
        );


        const message =
            await response.text();


        console.log(
            "Verify OTP Status:",
            response.status
        );

        console.log(
            "Verify OTP Response:",
            message
        );


        if (!response.ok) {

            throw new Error(message);

        }


        // OTP verified
        sessionStorage.setItem(
            "otpVerified",
            "true"
        );


        alert(
            "OTP verified successfully."
        );


        // Go to reset password
        window.location.href =
            "/pages/reset-password/reset-password.html";


    } catch (error) {

        console.error(
            "OTP Verification Error:",
            error
        );


        alert(
            error.message ||
            "Invalid OTP. Please try again."
        );

    }

});