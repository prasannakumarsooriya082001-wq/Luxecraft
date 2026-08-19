console.log("Order Success JS Loaded");


window.onload = function () {

    const orderId =
        localStorage.getItem("lastOrderId");


    if (orderId) {

        document.getElementById("orderId")
            .textContent = "#" + orderId;

    }

};