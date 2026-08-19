// =====================================================
// SHARED ADMIN SIDEBAR
//
// The sidebar markup used to be copy-pasted into all eight admin pages.
// Adding one menu item meant editing eight files and hoping none drifted
// out of step - which is exactly how they drifted before.
//
// Each admin page now carries only:
//     <aside class="sidebar" id="adminSidebar"></aside>
// and this file fills it in, marking the current page automatically.
// =====================================================

const ADMIN_MENU = [
    {
        href: "/pages/dashboard/dashboard.html",
        icon: "fa-house",
        label: "Dashboard"
    },
    {
        href: "/pages/admin-products/admin-products.html",
        icon: "fa-box",
        label: "Products"
    },
    {
        href: "/pages/admin-orders/admin-orders.html",
        icon: "fa-cart-shopping",
        label: "Orders"
    },
    {
        href: "/pages/admin-customers/admin-customers.html",
        icon: "fa-users",
        label: "Customers"
    },
    {
        href: "/pages/admin-categories/admin-categories.html",
        icon: "fa-layer-group",
        label: "Categories"
    },
    {
        href: "/pages/admin-coupons/admin-coupons.html",
        icon: "fa-tag",
        label: "Coupons"
    },
    {
        href: "/pages/admin-reports/admin-reports.html",
        icon: "fa-chart-line",
        label: "Reports"
    },
    {
        href: "/pages/admin-settings/admin-settings.html",
        icon: "fa-gear",
        label: "Settings"
    }
];


// Pages that belong to a menu section but have their own URL, so the
// right item still highlights while you are adding or editing something.
const ADMIN_SECTION_ALIASES = {
    "/pages/add-products/": "/pages/admin-products/admin-products.html",
    "/pages/edit-product/": "/pages/admin-products/admin-products.html",
    "/pages/add-categories/": "/pages/admin-categories/admin-categories.html",
    "/pages/edit-category/": "/pages/admin-categories/admin-categories.html",
    "/pages/add-customers/": "/pages/admin-customers/admin-customers.html",
    "/pages/edit-customers/": "/pages/admin-customers/admin-customers.html",
    "/pages/admin-customer-details/": "/pages/admin-customers/admin-customers.html",
    "/pages/admin-orders-details/": "/pages/admin-orders/admin-orders.html"
};


function currentAdminSection() {

    const path = window.location.pathname;

    for (const prefix in ADMIN_SECTION_ALIASES) {

        if (path.indexOf(prefix) === 0) {

            return ADMIN_SECTION_ALIASES[prefix];

        }
    }

    return path;
}


function renderAdminSidebar() {

    const host =
        document.getElementById("adminSidebar");

    if (!host) {

        return;

    }

    const active = currentAdminSection();

    let items = "";

    ADMIN_MENU.forEach(function (item) {

        const isActive = item.href === active;

        items += `
                <li${isActive ? ' class="active"' : ""}>
                    <a href="${item.href}">
                        <i class="fa-solid ${item.icon}"></i>
                        ${item.label}
                    </a>
                </li>
        `;

    });

    host.innerHTML = `
            <div class="sidebar-logo">

                <div class="logo-icon">L</div>

                <h2>LuxeCraft</h2>

            </div>

            <ul class="sidebar-menu">
${items}
                <li>
                    <a href="/pages/login/login.html" id="adminLogout">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        Logout
                    </a>
                </li>

            </ul>
    `;

    // Logging out should actually clear the session, not just navigate
    const logout =
        document.getElementById("adminLogout");

    if (logout) {

        logout.addEventListener("click", function () {

            localStorage.removeItem("loggedInAdmin");

        });

    }

}


// This script is loaded at the end of <body>, so the placeholder already
// exists and the sidebar can be drawn straight away - no empty flash.
if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", renderAdminSidebar);

} else {

    renderAdminSidebar();

}
