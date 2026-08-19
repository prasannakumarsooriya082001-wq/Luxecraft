// Single source of truth for the backend API base URL. Every API call
// and every product image URL on every page is built from this one value.
//
// Points at the deployed Railway backend. To develop against a backend
// running on this machine, swap the two lines below.
//
// Loaded as a plain script before every other page script, so
// API_BASE_URL is available globally to nav.js and each page's own JS.
const API_BASE_URL = "https://luxecraft-production.up.railway.app";
// const API_BASE_URL = "http://localhost:8080";


// =====================================================
// AUTH HEADERS
//
// Admin write endpoints (product/category create, update, delete and
// all stock changes) now require a ROLE_ADMIN token. Pages used to send
// nothing at all, so these helpers live here and are shared by every page.
// =====================================================

function adminAuthHeaders(extraHeaders) {

    const admin =
        JSON.parse(localStorage.getItem("loggedInAdmin"));

    const headers = extraHeaders ? Object.assign({}, extraHeaders) : {};

    if (admin && admin.token) {

        headers["Authorization"] = "Bearer " + admin.token;

    }

    return headers;
}


function customerAuthHeaders(extraHeaders) {

    const customer =
        JSON.parse(localStorage.getItem("loggedInCustomer"));

    const headers = extraHeaders ? Object.assign({}, extraHeaders) : {};

    if (customer && customer.token) {

        headers["Authorization"] = "Bearer " + customer.token;

    }

    return headers;
}


// =====================================================
// LOGIN-GATED LINKS
//
// Any link marked data-requires-login (e.g. "My Orders") tells the visitor
// what is happening instead of silently bouncing them to the login page,
// and sends them back where they were headed once they sign in.
// =====================================================

document.addEventListener("click", function (event) {

    const link =
        event.target.closest("a[data-requires-login]");

    if (!link) {
        return;
    }

    const customer =
        JSON.parse(localStorage.getItem("loggedInCustomer"));

    if (customer && customer.token) {
        return;
    }

    event.preventDefault();

    localStorage.setItem(
        "redirectAfterLogin",
        link.getAttribute("href")
    );

    alert("Please log in to view your orders.");

    window.location.href = "/frontend/pages/login/login.html";

});


// =====================================================
// GLOBAL AUTH ERROR HANDLING
//
// The backend now answers with 401 (not logged in / token expired)
// and 403 (logged in but not allowed) instead of silently returning
// data. Rather than editing every fetch call on every page, we wrap
// fetch once here so all pages behave consistently.
// =====================================================

// Endpoints where a 401 is a normal answer ("wrong password") and must
// be shown by the page itself, not turned into a redirect.
const AUTH_EXEMPT_PATHS = [
    "/customer/login",
    "/customer/register",
    "/customer/forgot-password",
    "/customer/verify-otp",
    "/customer/reset-password",
    "/admin/login"
];


function isAuthExempt(url) {

    return AUTH_EXEMPT_PATHS.some(function (path) {
        return String(url).includes(path);
    });
}


function handleSessionExpired() {

    // The stored token is no longer usable - drop it so the app does
    // not keep showing a half logged-in navbar.
    localStorage.removeItem("loggedInCustomer");
    localStorage.removeItem("loggedInAdmin");

    const onLoginPage =
        window.location.pathname.indexOf("/login") !== -1;

    if (onLoginPage) {
        return;
    }

    alert("Your session has expired. Please log in again.");

    window.location.href = "/frontend/pages/login/login.html";
}


(function wrapFetch() {

    const originalFetch = window.fetch.bind(window);

    window.fetch = function (resource, options) {

        return originalFetch(resource, options).then(function (response) {

            const url =
                typeof resource === "string"
                    ? resource
                    : (resource && resource.url) || "";

            // Only act on our own API, and never on the login endpoints
            if (url.indexOf(API_BASE_URL) === 0 && !isAuthExempt(url)) {

                if (response.status === 401) {

                    handleSessionExpired();

                } else if (response.status === 403) {

                    console.warn(
                        "Forbidden - this account lacks permission for:",
                        url
                    );
                }
            }

            // Always hand the response back untouched so existing
            // page code keeps working exactly as before.
            return response;
        });
    };

})();
