const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";
        togglePassword.classList.replace("fa-eye","fa-eye-slash");

    }
    else{

        password.type = "password";
        togglePassword.classList.replace("fa-eye-slash","fa-eye");

    }

});

const confirmPassword = document.getElementById("confirmPassword");
const toggleConfirm = document.getElementById("toggleConfirmPassword");

toggleConfirm.addEventListener("click", () => {

    if(confirmPassword.type === "password"){

        confirmPassword.type = "text";
        toggleConfirm.classList.replace("fa-eye","fa-eye-slash");

    }
    else{

        confirmPassword.type = "password";
        toggleConfirm.classList.replace("fa-eye-slash","fa-eye");

    }

});

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const firstName =
        document.getElementById("firstName").value;

    const lastName =
        document.getElementById("lastName").value;

    const email =
        document.getElementById("email").value;

    const phone =
        document.getElementById("phone").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (password !== confirmPassword) {

        alert("Passwords do not match!");

        return;
    }


    const customer = {

        firstName: firstName,

        lastName: lastName,

        email: email,

        phone: phone,

        password: password

    };


    fetch(`${API_BASE_URL}/customer/register`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(customer)

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("Registration failed");

        }

        return response.json();

    })

    .then(data => {

        console.log("Registered Customer:", data);

        alert("Registration Successful!");

        window.location.href ="/pages/login/login.html";

    })

    .catch(error => {

        console.error("Registration Error:", error);

        alert("Registration failed!");

    });

});