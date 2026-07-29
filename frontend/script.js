const WEB_APP =
    "https://script.google.com/macros/s/AKfycbzQ59JjARpUzZQkqALSPSVNP9s5Zdt1qzzunsJvuE5bsZxIkf1LVjLALRdNMwvWFYlN/exec";

const form = document.getElementById("demoForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const participant =
        document.getElementById("participant").value;

    const warning =
        document.getElementById("warning").checked;

    const formData = new FormData();

    formData.append(
        "data",
        JSON.stringify({
            participant: participant,
            warningAcknowledged: warning
        })
    );

    fetch(WEB_APP, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            participant: participant,
            warningAcknowledged: warning
        })
    });

    alert(
        `Training Complete

✔ Participant recorded

✔ Password was NOT transmitted

✔ Password was NOT stored

This demonstrates safe frontend-to-cloud data handling.`
    );

    form.reset();

});