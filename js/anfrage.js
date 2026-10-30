// Anfrage-Assistent (mehrstufiges Formular, Versand über Web3Forms)
(() => {
    const KEY = 'af137e3b-abfb-4e5a-9716-3557a55e8258';
    const form = document.getElementById('quiz');
    if (!form) return;

    const steps = [...form.querySelectorAll('.quiz-step')];
    const bar = form.querySelector('.quiz-progress span');
    const count = form.querySelector('.quiz-count b');
    const back = form.querySelector('.quiz-back');
    const submit = form.querySelector('.quiz-submit');
    const status = form.querySelector('.quiz-status');
    const done = form.querySelector('.quiz-done');
    let current = 0;

    function show(i) {
        current = i;
        steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
        bar.style.width = ((i + 1) / steps.length * 100) + '%';
        count.textContent = i + 1;
        back.hidden = i === 0;
        submit.hidden = i !== steps.length - 1;
        status.textContent = '';
    }

    // Auswahl antippen -> automatisch weiter
    form.querySelectorAll('.quiz-options input').forEach((input) => {
        input.addEventListener('change', () => {
            setTimeout(() => { if (current < steps.length - 1) show(current + 1); }, 220);
        });
    });
    back.addEventListener('click', () => show(Math.max(0, current - 1)));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (form.botcheck.checked) return;
        const last = steps[steps.length - 1];
        const invalid = [...last.querySelectorAll('input, textarea')].find((el) => !el.checkValidity());
        if (invalid) {
            invalid.reportValidity();
            status.textContent = 'Bitte Name, Telefon und die Einwilligung ausfüllen.';
            status.className = 'quiz-status is-error';
            return;
        }
        const d = Object.fromEntries(new FormData(form));
        submit.disabled = true;
        status.className = 'quiz-status';
        status.textContent = 'Wird gesendet …';
        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    access_key: KEY,
                    subject: `Neue Anfrage (Assistent): ${d.anliegen || 'ohne Angabe'} – ${d.dringlichkeit || ''}`,
                    from_name: 'Etlabora IT Webseite – Anfrage-Assistent',
                    replyto: d.email || undefined,
                    Anliegen: d.anliegen || '–',
                    Kunde: d.groesse || '–',
                    Dringlichkeit: d.dringlichkeit || '–',
                    Ort: d.ort || '–',
                    Name: d.name,
                    Telefon: d.telefon,
                    'E-Mail': d.email || '–',
                    Nachricht: d.nachricht || '–',
                    Seite: location.pathname
                })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            steps.forEach((s) => s.classList.remove('is-active'));
            form.querySelector('.quiz-nav').hidden = true;
            form.querySelector('.quiz-count').hidden = true;
            bar.style.width = '100%';
            status.textContent = '';
            done.hidden = false;
        } catch (err) {
            status.textContent = 'Das Senden hat leider nicht geklappt. Bitte rufen Sie uns an: 015 510 385216.';
            status.className = 'quiz-status is-error';
            submit.disabled = false;
        }
    });

    show(0);
})();
