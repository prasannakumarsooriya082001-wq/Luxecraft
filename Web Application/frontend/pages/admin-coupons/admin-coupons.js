console.log("Admin Coupons JS Loaded");

const couponApi = `${API_BASE_URL}/coupon`;

let allCoupons = [];


// =====================================================
// ADMIN GUARD
// =====================================================

const loggedInAdmin =
    JSON.parse(localStorage.getItem("loggedInAdmin"));


if (!loggedInAdmin
    || loggedInAdmin.role !== "ADMIN"
    || !loggedInAdmin.token) {

    localStorage.removeItem("loggedInAdmin");

    window.location.href = "/frontend/pages/login/login.html";

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadCoupons();

    document.getElementById("openFormBtn")
        .addEventListener("click", function () {
            openForm();
        });

    document.getElementById("cancelFormBtn")
        .addEventListener("click", closeForm);

    document.getElementById("saveCouponBtn")
        .addEventListener("click", saveCoupon);

    document.getElementById("discountType")
        .addEventListener("change", toggleMaxDiscount);

});


// A flat discount has nothing to cap, so hide the field to avoid confusion
function toggleMaxDiscount() {

    const type =
        document.getElementById("discountType").value;

    document.getElementById("maxDiscountField").hidden =
        type !== "PERCENT";

}


// =====================================================
// LOAD
// =====================================================

function loadCoupons() {

    fetch(`${couponApi}/admin/all`, {
        headers: adminAuthHeaders()
    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load coupons");
            }

            return response.json();

        })

        .then(coupons => {

            allCoupons = coupons;

            displayCoupons(coupons);

        })

        .catch(error => {

            console.error("Coupon Error:", error);

            showEmptyState("Unable to load coupons.");

        });

}


function showEmptyState(text) {

    const empty = document.getElementById("emptyState");

    document.getElementById("couponTableBody").innerHTML = "";

    empty.textContent = text;
    empty.hidden = false;

}


// =====================================================
// DISPLAY
// =====================================================

function displayCoupons(coupons) {

    const tbody =
        document.getElementById("couponTableBody");

    const empty =
        document.getElementById("emptyState");


    tbody.innerHTML = "";


    if (!coupons || coupons.length === 0) {

        showEmptyState("No coupons yet. Create one to get started.");

        return;

    }


    empty.hidden = true;


    coupons.forEach(coupon => {

        const discount =
            coupon.discountType === "PERCENT"
                ? coupon.discountValue + "%"
                    + (coupon.maxDiscount
                        ? " (max ₹" + coupon.maxDiscount + ")"
                        : "")
                : "₹" + coupon.discountValue;


        const used =
            coupon.usageLimit
                ? coupon.usedCount + " / " + coupon.usageLimit
                : coupon.usedCount + " / ∞";


        const status = couponStatus(coupon);


        tbody.innerHTML += `

            <tr>

                <td class="code-cell">${coupon.code}</td>

                <td>${discount}</td>

                <td>${coupon.minOrderAmount ? "₹" + coupon.minOrderAmount : "-"}</td>

                <td class="validity">${formatValidity(coupon)}</td>

                <td>${used}</td>

                <td>
                    <span class="status-tag ${status.cls}">${status.label}</span>
                </td>

                <td>

                    <button class="toggle-btn"
                            title="${coupon.active ? "Deactivate" : "Activate"}"
                            onclick="toggleActive(${coupon.couponId})">
                        <i class="fa-solid fa-power-off"></i>
                    </button>

                    <button class="edit-btn"
                            onclick="editCoupon(${coupon.couponId})">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="delete-btn"
                            onclick="deleteCoupon(${coupon.couponId})">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>

            </tr>

        `;

    });

}


// Status reflects what the backend would actually do with the coupon,
// not just the active flag - an active but expired coupon still fails.
function couponStatus(coupon) {

    if (!coupon.active) {
        return { cls: "inactive", label: "Inactive" };
    }

    const now = new Date();

    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
        return { cls: "scheduled", label: "Scheduled" };
    }

    if (coupon.validTo && now > new Date(coupon.validTo)) {
        return { cls: "expired", label: "Expired" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { cls: "expired", label: "Limit reached" };
    }

    return { cls: "live", label: "Live" };

}


function formatValidity(coupon) {

    const from = coupon.validFrom
        ? new Date(coupon.validFrom).toLocaleDateString()
        : "Any time";

    const to = coupon.validTo
        ? new Date(coupon.validTo).toLocaleDateString()
        : "No end";

    return from + " &rarr; " + to;

}


// =====================================================
// FORM
// =====================================================

function openForm(coupon) {

    const panel =
        document.getElementById("couponFormPanel");

    document.getElementById("formTitle").textContent =
        coupon ? "Edit Coupon" : "Add Coupon";

    document.getElementById("couponId").value =
        coupon ? coupon.couponId : "";

    document.getElementById("code").value =
        coupon ? coupon.code : "";

    document.getElementById("discountType").value =
        coupon ? coupon.discountType : "PERCENT";

    document.getElementById("discountValue").value =
        coupon ? coupon.discountValue : "";

    document.getElementById("minOrderAmount").value =
        coupon && coupon.minOrderAmount != null ? coupon.minOrderAmount : "";

    document.getElementById("maxDiscount").value =
        coupon && coupon.maxDiscount != null ? coupon.maxDiscount : "";

    document.getElementById("usageLimit").value =
        coupon && coupon.usageLimit != null ? coupon.usageLimit : "";

    document.getElementById("validFrom").value =
        coupon && coupon.validFrom ? toLocalInput(coupon.validFrom) : "";

    document.getElementById("validTo").value =
        coupon && coupon.validTo ? toLocalInput(coupon.validTo) : "";

    document.getElementById("active").checked =
        coupon ? !!coupon.active : true;

    setFormMessage("", false);

    toggleMaxDiscount();

    panel.hidden = false;

    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

}


function closeForm() {

    document.getElementById("couponFormPanel").hidden = true;

    setFormMessage("", false);

}


function setFormMessage(text, isError) {

    const el = document.getElementById("formMessage");

    el.textContent = text || "";

    el.className = "form-message" + (isError ? " error" : " success");

}


// The datetime-local input needs "yyyy-MM-ddTHH:mm" with no zone
function toLocalInput(value) {

    const date = new Date(value);

    const pad = n => String(n).padStart(2, "0");

    return date.getFullYear()
        + "-" + pad(date.getMonth() + 1)
        + "-" + pad(date.getDate())
        + "T" + pad(date.getHours())
        + ":" + pad(date.getMinutes());

}


function numberOrNull(id) {

    const raw = document.getElementById(id).value.trim();

    return raw === "" ? null : Number(raw);

}


function saveCoupon() {

    const code =
        document.getElementById("code").value.trim();

    const discountType =
        document.getElementById("discountType").value;

    const discountValue = numberOrNull("discountValue");


    // Validate before calling out, so obvious mistakes get an instant answer
    if (!code) {

        setFormMessage("Enter a coupon code.", true);

        return;

    }

    if (discountValue === null || discountValue <= 0) {

        setFormMessage("Discount value must be more than zero.", true);

        return;

    }

    if (discountType === "PERCENT" && discountValue > 100) {

        setFormMessage("A percentage discount cannot exceed 100.", true);

        return;

    }


    const validFrom = document.getElementById("validFrom").value;
    const validTo = document.getElementById("validTo").value;


    if (validFrom && validTo && new Date(validTo) < new Date(validFrom)) {

        setFormMessage("End date cannot be before the start date.", true);

        return;

    }


    const payload = {
        code: code,
        discountType: discountType,
        discountValue: discountValue,
        minOrderAmount: numberOrNull("minOrderAmount"),
        maxDiscount: discountType === "PERCENT"
            ? numberOrNull("maxDiscount")
            : null,
        usageLimit: numberOrNull("usageLimit"),
        validFrom: validFrom ? validFrom : null,
        validTo: validTo ? validTo : null,
        active: document.getElementById("active").checked
    };


    const couponId =
        document.getElementById("couponId").value;

    const isEdit = couponId !== "";

    const url = isEdit
        ? `${couponApi}/admin/${couponId}`
        : `${couponApi}/admin/add`;


    const saveBtn = document.getElementById("saveCouponBtn");

    saveBtn.disabled = true;


    fetch(url, {

        method: isEdit ? "PUT" : "POST",

        headers: adminAuthHeaders({
            "Content-Type": "application/json"
        }),

        body: JSON.stringify(payload)

    })

        .then(response => {

            return response.json().then(body => {

                if (!response.ok) {

                    throw new Error(
                        body.message || "Could not save the coupon."
                    );

                }

                return body;

            });

        })

        .then(() => {

            closeForm();

            loadCoupons();

        })

        .catch(error => {

            setFormMessage(error.message, true);

        })

        .finally(() => {

            saveBtn.disabled = false;

        });

}


// =====================================================
// ROW ACTIONS
// =====================================================

function editCoupon(couponId) {

    const coupon =
        allCoupons.find(c => c.couponId === couponId);

    if (coupon) {

        openForm(coupon);

    }

}


function toggleActive(couponId) {

    const coupon =
        allCoupons.find(c => c.couponId === couponId);

    if (!coupon) {
        return;
    }


    const updated = Object.assign({}, coupon, {
        active: !coupon.active
    });


    fetch(`${couponApi}/admin/${couponId}`, {

        method: "PUT",

        headers: adminAuthHeaders({
            "Content-Type": "application/json"
        }),

        body: JSON.stringify(updated)

    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Could not update the coupon.");
            }

            loadCoupons();

        })

        .catch(error => {

            console.error(error);

            alert(error.message);

        });

}


function deleteCoupon(couponId) {

    const coupon =
        allCoupons.find(c => c.couponId === couponId);

    const label = coupon ? coupon.code : "this coupon";


    if (!confirm("Delete " + label + "? This cannot be undone.")) {

        return;

    }


    fetch(`${couponApi}/admin/${couponId}`, {

        method: "DELETE",

        headers: adminAuthHeaders()

    })

        .then(response => {

            if (!response.ok) {
                throw new Error("Could not delete the coupon.");
            }

            loadCoupons();

        })

        .catch(error => {

            console.error(error);

            alert(error.message);

        });

}
