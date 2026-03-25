(function () {
    // Automatically detect the base URL from the script source
    const script = document.currentScript;
    const chatbotId = script.getAttribute('data-chatbot') || '';
    const scriptUrl = new URL(script.src);
    const baseUrl = scriptUrl.origin;

    // Session Tracking
    let sessionId = localStorage.getItem(`yourchatbot_sess_${chatbotId}`);
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(`yourchatbot_sess_${chatbotId}`, sessionId);
    }

    // Create and style the Iframe
    const iframe = document.createElement("iframe");
    iframe.src = `${baseUrl}/demo?chatbotId=${chatbotId}&sessionId=${sessionId}&embedded=true`;
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
    iframe.style.zIndex = "99999999";
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transform = "translateY(30px) scale(0.95)";
    iframe.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    iframe.style.transformOrigin = "bottom right";

    document.body.appendChild(iframe);

    // Create the toggle button
    const button = document.createElement("button");
    button.innerHTML = `
        <svg id="chat-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        <svg id="close-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    `;

    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.borderRadius = "30px";
    button.style.background = "#2563eb";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = "99999999";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.boxShadow = "0 10px 25px rgba(37,99,235,0.4)";
    button.style.transition = "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    document.body.appendChild(button);

    let isOpen = false;

    const toggleChat = (forceClose = false) => {
        const chatIcon = button.querySelector("#chat-icon");
        const closeIcon = button.querySelector("#close-icon");

        if (forceClose) isOpen = true; // Set to true so it toggles to false

        if (!isOpen) {
            // Opening
            iframe.style.display = "block";
            // Add timestamp to avoid caching
            const currentSrc = new URL(iframe.src);
            currentSrc.searchParams.set('t', Date.now());
            iframe.src = currentSrc.toString();

            setTimeout(() => {
                iframe.style.opacity = "1";
                iframe.style.transform = "translateY(0) scale(1)";
            }, 10);
            
            button.style.opacity = "0";
            button.style.pointerEvents = "none";
            button.style.visibility = "hidden";
            setTimeout(() => {
                if (isOpen) button.style.display = "none";
            }, 400);
        } else {
            // Closing
            iframe.style.opacity = "0";
            iframe.style.transform = "translateY(30px) scale(0.95)";
            
            button.style.display = "flex";
            setTimeout(() => {
                button.style.opacity = "1";
                button.style.pointerEvents = "auto";
                button.style.visibility = "visible";
                iframe.style.display = "none";
            }, 10);
        }
        isOpen = !isOpen;
    };

    button.onclick = () => toggleChat();

    // Listen for close message from iframe
    window.addEventListener("message", (event) => {
        if (event.data === "closeChatbot") {
            toggleChat(true);
        }
    });

    // Hover effects
    button.onmouseover = () => {
        if (!isOpen) button.style.transform = "scale(1.05)";
    };
    button.onmouseout = () => {
        if (!isOpen) button.style.transform = "scale(1)";
    };

})();