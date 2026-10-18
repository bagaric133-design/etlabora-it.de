// Kontaktformular
// Sobald ein Web3Forms-Zugangsschlüssel eingetragen ist, werden Anfragen direkt per E-Mail zugestellt.
// Ohne Schlüssel öffnet das Formular das E-Mail-Programm mit vorausgefüllter Nachricht.
(() => {
    const WEB3FORMS_KEY = '';
    const MAIL_TO = 'info@etlabora-it.de';

    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = form.querySelector('.cf-status');
    const button = form.querySelector('.cf-submit');

    const setStatus = (text, type) => {
        status.textContent = text;
        status.className = 'cf-status' + (type ? ' is-' + type : '');
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (form.botcheck.checked) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            setStatus('Bitte füllen Sie alle Pflichtfelder (*) aus.', 'error');
            return;
        }

        const d = Object.fromEntries(new FormData(form));
        const subject = `Anfrage über die Webseite: ${d.anliegen}`;
        const body = [
            `Name: ${d.name}`,
            d.firma ? `Firma/Praxis: ${d.firma}` : '',
            `E-Mail: ${d.email}`,
            d.telefon ? `Telefon: ${d.telefon}` : '',
            `Anliegen: ${d.anliegen}`,
            '',
            d.nachricht
        ].filter((line, i) => line !== '' || i === 5).join('\n');

        if (!WEB3FORMS_KEY) {
            window.location.href = `mailto:${MAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            setStatus('Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht dort ab.', 'ok');
            return;
        }

        button.disabled = true;
        setStatus('Wird gesendet …');
        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject,
                    from_name: 'Etlabora IT Webseite',
                    replyto: d.email,
                    name: d.name,
                    firma: d.firma,
                    email: d.email,
                    telefon: d.telefon,
                    anliegen: d.anliegen,
                    nachricht: d.nachricht
                })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            form.reset();
            setStatus('Danke! Ihre Nachricht ist angekommen. Wir melden uns schnellstmöglich bei Ihnen.', 'ok');
        } catch (err) {
            setStatus(`Das Senden hat leider nicht geklappt. Bitte rufen Sie uns an oder schreiben Sie an ${MAIL_TO}.`, 'error');
        } finally {
            button.disabled = false;
        }
    });
})();
