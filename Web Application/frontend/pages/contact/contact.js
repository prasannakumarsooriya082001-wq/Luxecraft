document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Contact Page JS Loaded");


        // =====================================================
        // CONTACT FORM ELEMENTS
        // =====================================================

        const contactForm =
            document.getElementById("contactForm");

        const sendButton =
            document.querySelector(".send-btn");

        const successMessage =
            document.getElementById("successMessage");

        const directionButton =
            document.getElementById("directionBtn");

        const shopSofasButton =
            document.getElementById("shopSofasBtn");


        // =====================================================
        // CHECK CONTACT FORM
        // =====================================================

        if (!contactForm) {

            console.error(
                "Contact form not found."
            );

            return;

        }


        // =====================================================
        // CREATE ERROR MESSAGE
        // =====================================================

        let errorMessage =
            document.getElementById("errorMessage");


        if (!errorMessage) {

            errorMessage =
                document.createElement("p");

            errorMessage.id =
                "errorMessage";

            errorMessage.className =
                "success-message";

            errorMessage.style.color =
                "#C62828";

            contactForm.appendChild(
                errorMessage
            );

        }


        // =====================================================
        // HIDE MESSAGES INITIALLY
        // =====================================================

        successMessage.style.display =
            "none";

        errorMessage.style.display =
            "none";


        // =====================================================
        // CONTACT FORM SUBMIT
        // =====================================================

        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                console.log(
                    "Contact form submitted"
                );


                // =================================================
                // GET FORM VALUES
                // =================================================

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


                const subject =
                    document
                        .getElementById("subject")
                        .value
                        .trim();


                const message =
                    document
                        .getElementById("message")
                        .value
                        .trim();


                // =================================================
                // HIDE PREVIOUS MESSAGES
                // =================================================

                successMessage.style.display =
                    "none";

                errorMessage.style.display =
                    "none";


                // =================================================
                // EMPTY FIELD VALIDATION
                // =================================================

                if (
                    !name ||
                    !email ||
                    !phone ||
                    !subject ||
                    !message
                ) {

                    showError(
                        "Please fill all fields."
                    );

                    return;

                }


                // =================================================
                // NAME VALIDATION
                // =================================================

                const namePattern =
                    /^[A-Za-z ]{2,50}$/;


                if (
                    !namePattern.test(name)
                ) {

                    showError(
                        "Please enter a valid name."
                    );

                    return;

                }


                // =================================================
                // EMAIL VALIDATION
                // =================================================

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(email)
                ) {

                    showError(
                        "Please enter a valid email address."
                    );

                    return;

                }


                // =================================================
                // PHONE VALIDATION
                // =================================================

                const phonePattern =
                    /^[6-9]\d{9}$/;


                if (
                    !phonePattern.test(phone)
                ) {

                    showError(
                        "Please enter a valid 10-digit Indian phone number."
                    );

                    return;

                }


                // =================================================
                // SUBJECT VALIDATION
                // =================================================

                if (subject.length < 3) {

                    showError(
                        "Subject must contain at least 3 characters."
                    );

                    return;

                }


                // =================================================
                // MESSAGE VALIDATION
                // =================================================

                if (message.length < 10) {

                    showError(
                        "Message must contain at least 10 characters."
                    );

                    return;

                }


                // =================================================
                // CONTACT DATA
                // =================================================

                const contactData = {

                    name: name,

                    email: email,

                    phone: phone,

                    subject: subject,

                    message: message

                };


                console.log(
                    "Contact Data:",
                    contactData
                );


                // =================================================
                // DISABLE BUTTON
                // =================================================

                sendButton.disabled =
                    true;


                sendButton.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Sending...

                `;


                // =================================================
                // SEND TO SPRING BOOT
                // =================================================

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/contact/send`,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        contactData
                                    )

                            }
                        );


                    // =================================================
                    // GET BACKEND RESPONSE
                    // =================================================

                    const result =
                        await response.text();


                    console.log(
                        "Response Status:",
                        response.status
                    );


                    console.log(
                        "Backend Response:",
                        result
                    );


                    // =================================================
                    // SUCCESS
                    // =================================================

                    if (response.ok) {

                        successMessage.textContent =
                            "Your message has been sent successfully. We will get back to you soon.";

                        successMessage.style.display =
                            "block";


                        errorMessage.style.display =
                            "none";


                        // Clear form

                        contactForm.reset();


                        console.log(
                            "Email sent successfully."
                        );


                        // Hide success message

                        setTimeout(
                            function () {

                                successMessage.style.display =
                                    "none";

                            },
                            5000
                        );

                    }


                    // =================================================
                    // BACKEND ERROR
                    // =================================================

                    else {

                        showError(
                            result ||
                            "Unable to send your message. Please try again."
                        );


                        console.error(
                            "Backend Error:",
                            result
                        );

                    }

                }


                // =================================================
                // NETWORK ERROR
                // =================================================

                catch (error) {

                    console.error(
                        "Contact API Error:",
                        error
                    );


                    showError(
                        "Unable to connect to the server. Please make sure Spring Boot is running."
                    );

                }


                // =================================================
                // RESET BUTTON
                // =================================================

                finally {

                    sendButton.disabled =
                        false;


                    sendButton.innerHTML = `

                        <i class="fa-solid fa-paper-plane"></i>

                        Send Message

                    `;

                }

            }
        );


        // =====================================================
        // SHOW ERROR FUNCTION
        // =====================================================

        function showError(message) {

            errorMessage.textContent =
                message;

            errorMessage.style.display =
                "block";


            successMessage.style.display =
                "none";

        }


        // =====================================================
        // GET DIRECTIONS
        // =====================================================

        if (directionButton) {

            directionButton.addEventListener(
                "click",
                function () {

                    const location =
                        encodeURIComponent(
                            "LuxeCraft Furniture, Madurai, Tamil Nadu"
                        );


                    window.open(
                        "https://www.google.com/maps/search/?api=1&query=" +
                        location,
                        "_blank"
                    );

                }
            );

        }


        // =====================================================
        // SHOP SOFAS
        // =====================================================

        if (shopSofasButton) {

            shopSofasButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "/frontend/pages/products/products.html";

                }
            );

        }


        // =====================================================
        // FAQ SUPPORT
        // =====================================================
        // Your FAQ is currently commented in HTML.
        // This code will automatically work if you uncomment it.
        // =====================================================

        const faqQuestions =
            document.querySelectorAll(
                ".faq-question"
            );


        faqQuestions.forEach(
            function (question) {

                question.addEventListener(
                    "click",
                    function () {

                        const faqItem =
                            question.parentElement;


                        faqItem.classList.toggle(
                            "active"
                        );

                    }
                );

            }
        );


        console.log(
            "Contact Page Initialized Successfully"
        );

    }
);