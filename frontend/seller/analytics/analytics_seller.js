document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("currentSellerId")) {
        localStorage.setItem("currentSellerId", "s1");
    }

    const currentSellerId = localStorage.getItem("currentSellerId");

    if (typeof storesData !== 'undefined' && storesData[currentSellerId]) {
        const sellerData = storesData[currentSellerId];
        
        const headerName = document.querySelector(".user-profile .user-name");
        const headerEmail = document.querySelector(".user-profile .user-email");
        const headerAvatar = document.querySelector(".user-profile .avatar");

        if (headerName) headerName.textContent = "Alex Johnson";
        if (headerEmail) headerEmail.textContent = sellerData.name;
        if (headerAvatar && sellerData.logo) headerAvatar.src = sellerData.logo;
    }
});