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
                <!-- Preisseite vorübergehend ausgeblendet. Zum Reaktivieren hier wieder ergänzen: <a href="preise.html">Preise</a> -->
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

    // Chat: siehe js/chat.js
});
