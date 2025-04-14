document.getElementById("urlForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const urlInput = document.getElementById("urlInput").value;
    const resultElement = document.getElementById("result");
    resultElement.classList.remove("result-safe", "result-danger", "error"); // Réinitialiser les classes

    try {
        // Analyser pour le phishing
        const phishingResponse = await fetch("/api/phishing/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlInput })
        });

        const phishingData = await phishingResponse.json();
        let phishingResult = "";

        if (phishingResponse.ok) {
            phishingResult = phishingData.phishing === "phishing" ? "Phishing detected!" : "No phishing detected.";
            resultElement.classList.add(phishingData.phishing === "phishing" ? "result-danger" : "result-safe");
        } else {
            phishingResult = `Phishing Error: ${phishingData.error}`;
            resultElement.classList.add("error");
        }

        // Analyser pour l'injection SQL
        const sqlResponse = await fetch("/api/sql_injection/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: urlInput })
        });

        const sqlData = await sqlResponse.json();
        let sqlResult = "";

        if (sqlResponse.ok) {
            sqlResult = sqlData.sql_injection ? "SQL Injection detected!" : "No SQL Injection detected.";
            resultElement.classList.add(sqlData.sql_injection ? "result-danger" : "result-safe");
        } else {
            sqlResult = `SQL Injection Error: ${sqlData.error}`;
            resultElement.classList.add("error");
        }

        // Analyser pour XSS
        const xssResponse = await fetch("/api/xss/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: urlInput })
        });

        const xssData = await xssResponse.json();
        let xssResult = "";

        if (xssResponse.ok) {
            xssResult = xssData.xss ? "XSS detected!" : "No XSS detected.";
            resultElement.classList.add(xssData.xss ? "result-danger" : "result-safe");
        } else {
            xssResult = `XSS Error: ${xssData.error}`;
            resultElement.classList.add("error");
        }

        resultElement.innerHTML = `${phishingResult}<br>${sqlResult}<br>${xssResult}`;
    } catch (error) {
        resultElement.textContent = `Error: ${error.message}`;
        resultElement.classList.add("error");
    }
});