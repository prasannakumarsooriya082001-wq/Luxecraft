console.log("Forgot Password JS Loaded");

const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const sendButton = document.querySelector(".sentBtn");

const API_URL = `${API_BASE_URL}/customer/forgot-password`;


form.addEventListener("submit", async function (e) {

    e.preventDefault();


    // =====================================================
    // GET EMAIL
    // =====================================================

    const email = emailInput.value.trim();


    // =====================================================
    // VALIDATE EMAIL
    // =====================================================

    if (email === "") {

        alert("Please enter your email.");

        return;
    }


    if (!emailInput.checkValidity()) {

        alert("Please enter a valid email address.");

        return;
    }


    // =====================================================
    // BUTTON LOADING
    // =====================================================

    sendButton.disabled = true;

    sendButton.textContent = "Sending...";


    try {

        const response = await fetch(
            `${API_BASE_URL}/customer/forgot-password?email=`
            + encodeURIComponent(email),
            {
                method: "POST"
            }
        );

        const message = await response.text();

        if (!response.ok) {
            throw new Error(message);
        }

        // Save email for OTP page
        sessionStorage.setItem("resetEmail", email);

        alert("OTP sent successfully to your email.");

        window.location.href =
            "/frontend/pages/verify-otp/verify-otp.html";

    } catch (error) {

        console.error("Forgot Password Error:", error);

        alert(error.message || "Failed to send OTP.");
    }
    finally {

        sendButton.disabled = false;

        sendButton.textContent = "Send OTP";

    }

});



