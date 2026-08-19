document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "About Page JS Loaded"
        );


        // =====================================================
        // EXPLORE SOFAS
        // =====================================================

        const exploreBtn =
            document.getElementById(
                "exploreBtn"
            );


        if (exploreBtn) {

            exploreBtn.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "/frontend/pages/products/products.html";

                }
            );

        }


        // =====================================================
        // SHOP NOW
        // =====================================================

        const shopNowBtn =
            document.getElementById(
                "shopNowBtn"
            );


        if (shopNowBtn) {

            shopNowBtn.addEventListener(
                "click",
                function () {

                    window.location.href ="/frontend/pages/products/products.html";

                }
            );

        }

    }
);