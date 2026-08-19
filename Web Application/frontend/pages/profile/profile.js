// ================= GET LOGGED IN CUSTOMER =================

const loggedInCustomer = JSON.parse(localStorage.getItem("loggedInCustomer"));


// ================= LOGIN CHECK =================

if (!loggedInCustomer) {

    window.location.href = "/frontend/pages/login/login.html";

}


// ================= GET PROFILE =================

else {

    fetch(`${API_BASE_URL}/customer/profile`, {

        method: "GET",

        headers: {

            "Authorization":"Bearer " + loggedInCustomer.token
        }

    })

    .then(response => {

        if (!response.ok) {

            throw new Error("Unauthorized");

        }

        return response.text();

    })

    .then(profile => {

        console.log("Profile:", profile);

        // Temporary display
        document.getElementById("email").textContent =loggedInCustomer.email;

        document.getElementById("role").textContent =loggedInCustomer.role;

        document.getElementById("firstName").textContent =loggedInCustomer.firstName;

        document.getElementById("lastName").textContent =loggedInCustomer.lastName;

        document.getElementById("phone").textContent =loggedInCustomer.phone || "Not available";

    })

    .catch(error => {

        console.error("Profile Error:", error);

        localStorage.removeItem("loggedInCustomer");

        window.location.href ="/frontend/pages/login/login.html";

    });

}


// ================= BACK TO HOME =================

document.getElementById("backButton").addEventListener("click", function () {

        window.location.href = "/frontend/pages/home/index.html";

    });


// ================= LOGOUT =================

document.getElementById("logoutButton").addEventListener("click", function () {

        localStorage.removeItem("loggedInCustomer");

        window.location.href ="/frontend/pages/home/index.html";

    });