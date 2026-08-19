


// ==========================
// Input Focus Effect
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
// Card Animation
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

const params = new URLSearchParams(window.location.search);

const categoryId = params.get("id");



window.onload = function(){

    loadCategory();

};

function loadCategory(){

    fetch(apiUrl + "/get/" + categoryId)

    .then(response => response.json())

    .then(category =>{

        document.getElementById("categoryName").value =
        category.categoryName;

        document.getElementById("description").value =
        category.description;

        document.getElementById("status").value =
        category.status;

    })
    .catch(error =>{
            console.log(error);
            alert("Unable to load categories.");
        })

}



const updateForm =
document.getElementById("updateCategoryForm");

updateForm.addEventListener("submit",function(e){

    e.preventDefault();

    const category={

        categoryName:document.getElementById("categoryName").value,

        description:document.getElementById("description").value,

        status:document.getElementById("status").value

    };

    fetch(apiUrl + "/update/" + categoryId,{

        method:"PUT",

        headers: adminAuthHeaders({"Content-Type":"application/json"}),

        body:JSON.stringify(category)

    })

    .then(response=>response.json())

    .then(data=>{

        alert("Category Updated Successfully");

        window.location.href="/frontend/pages/admin-categories/admin-categories.html";

    })
    .catch(error =>{
            console.log(error);
            alert("Unable to update category!");
        })

});