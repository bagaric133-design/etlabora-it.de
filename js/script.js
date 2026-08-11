document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.header .nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
        });
    }

    document.querySelectorAll('.form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Danke! Ihre Nachricht wurde vorbereitet. Bitte E-Mail/Telefon noch mit Ihrem Anbieter verbinden.');
        });
    });

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
        { keys: ['kontakt', 'telefon', 'whatsapp', 'nummer'], text: 'Sie erreichen Etlabora IT telefonisch oder per WhatsApp unter +49 172 9513348 oder per E-Mail an info@etlabora-it.de.' },
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
