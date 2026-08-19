// ==========================
// Search Category
// ==========================

const searchInput = document.getElementById("search");

searchInput.addEventListener("keyup", function () {

    const filter = searchInput.value.toLowerCase();

    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        if (text.includes(filter)) {

            row.style.display = "";

        }

        else {

            row.style.display = "none";

        }

    });

});


// ==========================
// Add Category
// ==========================

const addCategoryBtn = document.getElementById("add-category");

addCategoryBtn.addEventListener("click", function () {

    window.location.href = "/pages/add-categories/add-categories.html";

});




// ==========================
// Table Animation
// ==========================

const rows = document.querySelectorAll("tbody tr");

rows.forEach((row, index) => {

    row.style.opacity = "0";

    row.style.transform = "translateY(20px)";

    setTimeout(() => {

        row.style.transition = ".4s";

        row.style.opacity = "1";

        row.style.transform = "translateY(0)";

    }, index * 150);

});



const apiUrl = `${API_BASE_URL}/category`

window.onload = function () {
    loadCategories();
};

function loadCategories() {
    fetch(apiUrl + "/getAll")
        .then(response => response.json())
        .then(data => {

            const tableBody = document.getElementById("categoryTableBody");

            data.forEach(category => {

                tableBody.innerHTML += `

                    <tr>
                        <td>${category.categoryId}</td>
                        <td>${category.categoryName}</td>
                        <td>${category.description}</td>
                        <td>

                            <span class="${category.status === 'Active'? 'status-active': 'status-inactive'}">${category.status}</span>

                        </td>

                        <td>

                            <button class="edit-btn" onclick="editCategory(${category.categoryId})">

                                <i class="fa-solid fa-pen"></i>

                            </button>

                            <button class="delete-btn" onclick="deleteCategory(${category.categoryId})">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>
                    </tr>`;
            });

        })
        .catch(error =>{
            console.log(error);
            alert("Unable to load categories.");
        })
        
}


function deleteCategory(categoryId) {

    if (confirm("Are you sure to delete this category?")) {

        fetch(apiUrl + "/delete/" + categoryId, {

            method: "DELETE",

            headers: adminAuthHeaders()

        })

            .then(response => response.text())

            .then(message => {

                alert(message);

                loadCategories();

            })
            .catch(error =>{
            console.log(error);
            alert("Unable to delete category!");
        })

    }

}


function editCategory(categoryId) {

    window.location.href =
        "/pages/edit-category/edit-category.html?id=" + categoryId;

}
