(function () {

    const iframe = document.createElement("iframe");

    iframe.src = "https://ai-chatbot-project-alpha.vercel.app";
    iframe.style.position = "fixed";
    iframe.style.bottom = "80px";
    iframe.style.right = "20px";
    iframe.style.width = "350px";
    iframe.style.height = "500px";
    iframe.style.border = "none";
    iframe.style.display = "none";
    iframe.style.zIndex = "9999";

    document.body.appendChild(iframe);

    const button = document.createElement("button");

    button.innerHTML = "💬";

    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.borderRadius = "50%";
    button.style.background = "#2563eb";
    button.style.color = "#fff";
    button.style.fontSize = "24px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";

    document.body.appendChild(button);

    button.onclick = () => {

        if (iframe.style.display === "none") {
            iframe.style.display = "block";
        } else {
            iframe.style.display = "none";
        }

    };

})();