document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    let menuToggle = document.querySelector('.mobile-menu-toggle');

    if (header) {
        if (!menuToggle) {
            menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.type = 'button';
            menuToggle.setAttribute('aria-label', 'Menü öffnen');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<span></span><span></span><span></span>';
            const logo = header.querySelector('.logo');
            logo.insertAdjacentElement('afterend', menuToggle);
        }

        const drawer = document.createElement('aside');
        drawer.className = 'mobile-drawer';
        drawer.id = 'mobile-navigation';
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML = `
            <div class="mobile-drawer-head">
                <a href="index.html" class="mobile-drawer-logo" aria-label="Etlabora IT Startseite"><img src="images/logo-footer.png" alt="Etlabora IT"></a>
                <button class="mobile-drawer-close" type="button" aria-label="Menü schließen">×</button>
            </div>
            <nav class="mobile-drawer-nav" aria-label="Mobile Navigation">
                <a href="index.html">Start</a>
                <div class="mobile-nav-group">
                    <div class="mobile-nav-group-head">
                        <a href="leistungen.html">Leistungen</a>
                        <button class="mobile-submenu-toggle" type="button" aria-label="Leistungen aufklappen" aria-expanded="false">+</button>
                    </div>
                    <div class="mobile-submenu">
                        <a href="it-beratung.html">IT-Beratung & Planung</a>
                        <a href="netzwerk-server.html">Netzwerk & Server</a>
                        <a href="microsoft365.html">Microsoft 365 & Cloud</a>
                        <a href="azure-intune.html">Azure & Intune</a>
                        <a href="it-security.html">IT-Security</a>
                        <a href="backup-cloud.html">Backup & Cloud</a>
                        <a href="service-support.html">Service & Support</a>
                    </div>
                </div>
                <a href="preise.html">Preise</a>
                <a href="kontakt.html">Kontakt</a>
                <a href="remote.html">Fernwartung</a>
                <a href="ueber-uns.html">Über uns</a>
            </nav>
            <div class="mobile-drawer-contact">
                <p class="mobile-drawer-eyebrow">Direkter Kontakt</p>
                <h2>Wie können wir helfen?</h2>
                <a href="tel:+4915510385216"><span>Telefon</span>015 510 385216</a>
                <a href="mailto:info@etlabora-it.de"><span>E-Mail</span>info@etlabora-it.de</a>
                <p><span>Standort</span>Bonn, Deutschland</p>
                <a class="mobile-drawer-cta" href="kontakt.html">Erstberatung anfragen <b>→</b></a>
            </div>`;

        const overlay = document.createElement('button');
        overlay.className = 'mobile-menu-overlay';
        overlay.type = 'button';
        overlay.setAttribute('aria-label', 'Menü schließen');
        document.body.append(overlay, drawer);
        menuToggle.setAttribute('aria-controls', drawer.id);

        const closeButton = drawer.querySelector('.mobile-drawer-close');
        const submenuToggle = drawer.querySelector('.mobile-submenu-toggle');
        const navGroup = drawer.querySelector('.mobile-nav-group');

        const setMenu = (open) => {
            document.body.classList.toggle('menu-open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
            drawer.setAttribute('aria-hidden', String(!open));
            if (open) closeButton.focus();
        };

        menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
        closeButton.addEventListener('click', () => setMenu(false));
        overlay.addEventListener('click', () => setMenu(false));
        drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
        submenuToggle.addEventListener('click', () => {
            const expanded = navGroup.classList.toggle('submenu-open');
            submenuToggle.setAttribute('aria-expanded', String(expanded));
            submenuToggle.setAttribute('aria-label', expanded ? 'Leistungen zuklappen' : 'Leistungen aufklappen');
            submenuToggle.textContent = expanded ? '−' : '+';
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
        });
    }

    const contactForm = document.querySelector('#contact-form');
    const successDialog = document.querySelector('#contact-success-dialog');

    if (contactForm && successDialog) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const status = contactForm.querySelector('.contact-form-status');
        const dialogClose = successDialog.querySelector('.contact-dialog-close');
        const defaultButtonText = submitButton.textContent;

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;

            submitButton.disabled = true;
            submitButton.textContent = 'Wird gesendet...';
            status.className = 'contact-form-status';
            status.textContent = '';

            try {
                const fields = Object.fromEntries(new FormData(contactForm).entries());
                const response = await fetch('https://formsubmit.co/ajax/info@etlabora-it.de', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(fields)
                });
                const result = await response.json();
                if (!response.ok || result.success === false || result.success === 'false') throw new Error('Formularversand fehlgeschlagen');

                contactForm.reset();
                if (typeof successDialog.showModal === 'function') successDialog.showModal();
                else successDialog.setAttribute('open', '');
            } catch (error) {
                status.className = 'contact-form-status error';
                status.textContent = 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an info@etlabora-it.de.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = defaultButtonText;
            }
        });

        dialogClose.addEventListener('click', () => {
            if (typeof successDialog.close === 'function') successDialog.close();
            else successDialog.removeAttribute('open');
        });
        successDialog.addEventListener('click', (event) => {
            if (event.target === successDialog && typeof successDialog.close === 'function') successDialog.close();
        });
    }

    const aiChatbot = document.querySelector('.ai-chatbot');
    if (!aiChatbot) return;

    const toggle = aiChatbot.querySelector('.ai-chatbot-toggle');
    const close = aiChatbot.querySelector('.ai-chatbot-close');
    const form = aiChatbot.querySelector('.ai-chatbot-form');
    const input = form.querySelector('input');
    const messages = aiChatbot.querySelector('.ai-chatbot-messages');
    const suggestions = aiChatbot.querySelectorAll('.ai-chatbot-suggestions button');

    const answers = [
        { keys: ['leistung', 'angebot', 'service'], text: 'Wir unterstützen bei IT-Beratung, Netzwerk & Server, Microsoft 365, Azure & Intune, IT-Security, Backup & Cloud sowie Service & Support.' },
        { keys: ['kontakt', 'telefon', 'whatsapp', 'nummer'], text: 'Sie erreichen Etlabora IT telefonisch oder per WhatsApp unter 015 510 385216 oder per E-Mail an info@etlabora-it.de.' },
        { keys: ['microsoft', '365', 'office', 'teams', 'exchange', 'onedrive'], text: 'Bei Microsoft 365 helfen wir mit Exchange Online, Teams, OneDrive, SharePoint, Einrichtung, Migration und laufender Betreuung.' },
        { keys: ['azure', 'intune', 'entra', 'autopilot'], text: 'Azure & Intune umfasst Geräteverwaltung, Entra ID, Sicherheitsrichtlinien, MFA, Conditional Access und Windows Autopilot.' },
        { keys: ['security', 'sicherheit', 'firewall', 'mfa', 'virenschutz'], text: 'Im Bereich IT-Security unterstützen wir bei Firewall, MFA, Virenschutz, Benutzerrechten und Sicherheitschecks.' },
        { keys: ['backup', 'datensicherung', 'cloud'], text: 'Für Backup & Datensicherung planen wir lokale Sicherungen, NAS, Cloud-Backup, Wiederherstellungstests und Monitoring.' },
        { keys: ['preis', 'kosten', 'angebot'], text: 'Die Kosten hängen vom Umfang ab. Am besten kurz Kontakt aufnehmen, dann kann Etlabora IT ein passendes Angebot vorbereiten.' },
        { keys: ['termin', 'beratung', 'erstberatung'], text: 'Eine kostenlose Erstberatung können Sie direkt über den Kontakt-Button oder per WhatsApp anfragen.' }
    ];

    function addMessage(text, type) {
        const bubble = document.createElement('div');
        bubble.className = 'ai-message ' + type;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function replyTo(question) {
        const q = question.toLowerCase();
        const match = answers.find((item) => item.keys.some((key) => q.includes(key)));
        return match ? match.text : 'Dazu kann ich kurz helfen: Schreiben Sie uns am besten per WhatsApp oder Kontaktformular, dann melden wir uns persönlich mit einer passenden Antwort.';
    }

    function sendQuestion(question) {
        const clean = question.trim();
        if (!clean) return;
        addMessage(clean, 'user');
        setTimeout(() => addMessage(replyTo(clean), 'bot'), 250);
        input.value = '';
    }

    toggle.addEventListener('click', () => aiChatbot.classList.toggle('open'));
    close.addEventListener('click', () => aiChatbot.classList.remove('open'));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendQuestion(input.value);
    });
    suggestions.forEach((button) => button.addEventListener('click', () => sendQuestion(button.textContent)));
});
