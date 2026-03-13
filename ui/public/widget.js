(function () {
    // Automatically detect the base URL from the script source
    const script = document.currentScript;
    const scriptUrl = new URL(script.src);
    const baseUrl = scriptUrl.origin;

    // Create and style the Iframe
    const iframe = document.createElement("iframe");
    iframe.src = baseUrl;
    iframe.style.position = "fixed";
    iframe.style.bottom = "90px";
    iframe.style.right = "20px";
    iframe.style.width = "400px";
    iframe.style.maxWidth = "calc(100vw - 40px)";
    iframe.style.height = "600px";
    iframe.style.maxHeight = "calc(100vh - 120px)";
    iframe.style.border = "none";
    iframe.style.borderRadius = "20px";
    iframe.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
    iframe.style.zIndex = "999999";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transform = "translateY(20px) scale(0.95)";
    iframe.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    iframe.style.transformOrigin = "bottom right";

    document.body.appendChild(iframe);

    // Create the toggle button
    const button = document.createElement("button");
    button.innerHTML = `
        <svg id="chat-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        <svg id="close-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    `;

    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.width = "64px";
    button.style.height = "64px";
    button.style.borderRadius = "24px";
    button.style.background = "#2563eb";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = "999999";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.boxShadow = "0 8px 24px rgba(37,99,235,0.3)";
    button.style.transition = "all 0.2s ease";

    document.body.appendChild(button);

    let isOpen = false;

    button.onclick = () => {
        const chatIcon = document.getElementById("chat-icon");
        const closeIcon = document.getElementById("close-icon");

        if (!isOpen) {
            iframe.style.display = "block";
            setTimeout(() => {
                iframe.style.opacity = "1";
                iframe.style.transform = "translateY(0) scale(1)";
            }, 10);
            chatIcon.style.display = "none";
            closeIcon.style.display = "block";
            button.style.transform = "rotate(90deg)";
        } else {
            iframe.style.opacity = "0";
            iframe.style.transform = "translateY(20px) scale(0.95)";
            setTimeout(() => {
                iframe.style.display = "none";
            }, 300);
            chatIcon.style.display = "block";
            closeIcon.style.display = "none";
            button.style.transform = "rotate(0deg)";
        }
        isOpen = !isOpen;
    };

    // Hover effects
    button.onmouseover = () => button.style.transform = isOpen ? "rotate(90deg) scale(1.05)" : "scale(1.05)";
    button.onmouseout = () => button.style.transform = isOpen ? "rotate(90deg) scale(1)" : "scale(1)";

})();