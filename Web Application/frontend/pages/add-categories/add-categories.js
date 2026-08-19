


// ==========================
// Focus Effect
// ==========================

const inputs = document.querySelectorAll(

    "input, textarea, select"

);

inputs.forEach(input => {

    input.addEventListener("focus", function () {

        this.style.boxShadow =

        "0 0 8px rgba(166,87,46,.3)";

    });

    input.addEventListener("blur", function () {

        this.style.boxShadow = "none";

    });

});


// ==========================
// Form Animation
// ==========================

const card = document.querySelector(".card");

card.style.opacity = "0";

card.style.transform = "translateY(30px)";

setTimeout(() => {

    card.style.transition = ".5s";

    card.style.opacity = "1";

    card.style.transform = "translateY(0)";

}, 200);



const apiUrl = `${API_BASE_URL}/category`;

const categoryForm = document.getElementById("categoryForm");

categoryForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const category = {

        categoryName: document.getElementById("categoryName").value,

        description: document.getElementById("description").value,

        status: document.getElementById("status").value

    };

    fetch(apiUrl + "/add", {

        method: "POST",

        headers: adminAuthHeaders({"Content-Type": "application/json"}),

        body: JSON.stringify(category)

    })

    .then(response => response.json())

    .then(data => {

        alert("Category Added Successfully!");

        categoryForm.reset();

        window.location.href ="/pages/admin-categories/admin-categories.html";

    })

    .catch(error => {

        console.error(error);

        alert("Something went wrong!");

    });

});


// ==========================
// Cancel Button
// ==========================

const cancelBtn = document.querySelector(".cancel-btn");

cancelBtn.addEventListener("click", function () {

    const categoryName = document.getElementById("categoryName").value;
    const description = document.getElementById("description").value;

    if (categoryName === "" && description === "") {

        window.location.href ="/pages/admin-categories/admin-categories.html";

        return;

    }

    const confirmCancel = confirm("Discard the changes?");

    if (confirmCancel) {

        window.location.href ="/pages/admin-categories/admin-categories.html";

    }

});




const saveBtn = document.querySelector(".save-btn");

saveBtn.disabled = true;
saveBtn.innerText = "Saving...";

saveBtn.disabled = false;
saveBtn.innerText = "Save Category";
