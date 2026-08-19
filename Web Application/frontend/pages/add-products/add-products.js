console.log("JS Loaded Successfully");


// ==========================
// Image Preview
// ==========================

const productImage = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");

productImage.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        previewImage.src = URL.createObjectURL(file);
    }

});


// ==========================
// Load Categories
// ==========================

const categorySelect = document.getElementById("category");

const categoryApi = `${API_BASE_URL}/category`;

window.onload = function () {

    console.log("Window Loaded");

    loadCategories();

};


function loadCategories() {

    console.log("loadCategories Called");

    fetch(categoryApi + "/getAll")

        .then(response => {

            console.log("Status :", response.status);

            return response.json();

        })

        .then(data => {

            console.log("Categories :", data);

            categorySelect.innerHTML =
                '<option value="">Select Category</option>';

            data.forEach(category => {

                categorySelect.innerHTML += `
                    <option value="${category.categoryId}">
                        ${category.categoryName}
                    </option>
                `;

            });

            console.log("Categories Loaded Successfully");

        })

        .catch(error => {

            console.error("Category Error :", error);

        });

}


// ==========================
// Save Product
// ==========================
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", function () {

    console.log("🔥 SAVE BUTTON CLICKED");

    const formData = new FormData();

    formData.append(
        "productName",
        document.getElementById("productName").value
    );

    formData.append(
        "description",
        document.getElementById("description").value
    );

    formData.append(
        "price",
        document.getElementById("price").value
    );

    formData.append(
        "stockQuantity",
        document.getElementById("stockQuantity").value
    );

    formData.append(
        "status",
        document.getElementById("status").value
    );

    formData.append(
        "categoryId",
        document.getElementById("category").value
    );

    formData.append(
        "image",
        document.getElementById("productImage").files[0]
    );

    console.log("🔥 BEFORE FETCH");

    fetch(`${API_BASE_URL}/product/add`, {

        method: "POST",

        // Authorization only - the browser must set the multipart
        // Content-Type itself so the boundary is correct.
        headers: adminAuthHeaders(),

        body: formData

    })

        .then(response => {

            console.log("Response Status :", response.status);

            return response.text();

        })

        .then(message => {

            console.log("SERVER MESSAGE :", message);

            alert(message);

        })

        .catch(error => {

            console.error("ERROR :", error);

        });

});



