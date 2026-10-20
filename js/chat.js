// Etlabora IT – Website-Assistent
// Läuft komplett im Browser. Es werden keine Eingaben an einen Server gesendet.
(() => {
    const root = document.querySelector('.ai-chatbot');
    if (!root) return;

    const KB = window.ETLABORA_KB || { pages: [], faqs: [] };
    const PHONE = '015 510 385216';
    const TEL = 'tel:+4915510385216';
    const WA = 'https://wa.me/4915510385216';
    const MAIL = 'info@etlabora-it.de';

    const toggle = root.querySelector('.ai-chatbot-toggle');
    const close = root.querySelector('.ai-chatbot-close');
    const form = root.querySelector('.ai-chatbot-form');
    const input = form.querySelector('input');
    const messages = root.querySelector('.ai-chatbot-messages');
    const suggestionBox = root.querySelector('.ai-chatbot-suggestions');

    // ---------- Text-Aufbereitung ----------
    const STOP = new Set(('der die das den dem des ein eine einen einem einer und oder aber ich du sie wir ihr es mein meine meinen mir mich ist sind bin war habe hat haben wird werden kann können könnt koennen soll sollte muss müssen brauche braucht brauchen mit für fuer von zu zum zur im in an auf aus bei wie was wo wann warum wer welche welcher welches gibt es auch noch nicht kein keine nur mal bitte hallo hi danke ja nein so sehr mehr viel etwas eigentlich denn dann da hier dort man uns euch ihnen ihre ihr unser unsere als ob wenn dass weil schon gut gerne gern einfach machen macht mache hilfe helfen helft hilft frage fragen ab immer oft dauernd staendig andauernd seit heute gestern irgendwie problem probleme funktioniert geht ganz total richtig').split(' '));

    const SYN = {
        email: ['mail', 'e-mail', 'emails', 'outlook', 'postfach', 'posteingang'],
        wlan: ['wifi', 'wi-fi', 'internet', 'router', 'fritzbox', 'netz', 'empfang'],
        drucker: ['drucken', 'druckt', 'scanner', 'scannen'],
        virus: ['viren', 'trojaner', 'malware', 'gehackt', 'hacker', 'angriff', 'ransomware', 'verschluesselt', 'erpressung', 'phishing'],
        backup: ['datensicherung', 'sicherung', 'sichern', 'gesichert', 'nas', 'festplatte'],
        passwort: ['kennwort', 'login', 'anmelden', 'anmeldung', 'zugang', 'mfa', 'zwei-faktor', '2fa'],
        laptop: ['pc', 'computer', 'rechner', 'notebook', 'geraet', 'geraete'],
        langsam: ['lahm', 'haengt', 'friert', 'absturz', 'stuerzt', 'performance', 'traege'],
        kosten: ['preis', 'preise', 'kostet', 'teuer', 'guenstig', 'stundensatz', 'euro', 'bezahlen', 'rechnung'],
        fernwartung: ['teamviewer', 'anydesk', 'remote', 'ferne', 'fernzugriff'],
        microsoft: ['m365', 'office', 'office365', 'teams', 'onedrive', 'sharepoint', 'exchange', 'word', 'excel'],
        praxis: ['arztpraxis', 'arzt', 'zahnarzt', 'physiotherapie', 'therapie', 'kanzlei', 'steuerberater', 'anwalt'],
        server: ['windows-server', 'active', 'directory', 'domain', 'domaene', 'dateiserver'],
        termin: ['vorbeikommen', 'vor-ort', 'besuch', 'kommen'],
    };
    const SYN_INDEX = {};
    Object.entries(SYN).forEach(([k, list]) => { SYN_INDEX[k] = k; list.forEach((w) => { SYN_INDEX[w] = k; }); });

    const norm = (t) => t.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9\-\s]/g, ' ');
    const stem = (w) => w.replace(/(ungen|ung|en|er|es|e|n|s)$/, '');
    const tokens = (t) => {
        const out = [];
        norm(t).split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).forEach((w) => {
            const st = stem(w);
            if (st) out.push(st);
            if (SYN_INDEX[w] && SYN_INDEX[w] !== st) out.push('~' + SYN_INDEX[w]);
        });
        return out;
    };

    // kleine Tippfehler-Toleranz
    const close1 = (a, b) => {
        if (a === b) return true;
        if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
        let i = 0, j = 0, diff = 0;
        while (i < a.length && j < b.length) {
            if (a[i] === b[j]) { i++; j++; continue; }
            if (++diff > 1) return false;
            if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
        }
        return diff + (a.length - i) + (b.length - j) <= 1;
    };

    // ---------- Wissensbasis indexieren ----------
    const LABEL = {}; KB.pages.forEach((p) => { LABEL[p.u] = p.l || p.t; });
    const docs = [];
    KB.faqs.forEach((f) => docs.push({ type: 'faq', q: f.q, a: f.a, u: f.u, t: f.t, tq: tokens(f.q), ta: tokens(f.a), tt: tokens(f.t) }));
    KB.pages.forEach((p) => docs.push({ type: 'page', u: p.u, t: p.l || p.t, a: p.d, tq: tokens(p.l + ' ' + p.h), ta: tokens(p.d), tt: tokens(p.t) }));

    const CURATED = [
        ['WLAN bricht ab, schlechtes WLAN, Internet langsam, kein Empfang', 'Häufige Ursachen für schlechtes WLAN sind ein einzelner Router für zu viele Räume, dicke Wände, ungünstige Kanäle oder veraltete Geräte. Mit gut platzierten Access Points und richtiger Einrichtung ist das meist dauerhaft gelöst – wir prüfen das gern bei Ihnen vor Ort.', 'netzwerk-server.html', 'Netzwerk & WLAN'],
        ['Drucker druckt nicht, Drucker offline, Scanner geht nicht', 'Druckerprobleme liegen oft an Treibern, geänderten IP-Adressen im Netzwerk oder Warteschlangen, die hängen. Vieles lösen wir per Fernwartung, bei Hardware-Problemen kommen wir vorbei.', 'service-support.html', 'Service & Support'],
        ['Computer PC Laptop langsam, hängt, stürzt ab, friert ein', 'Langsame oder abstürzende Rechner haben fast immer eine klare Ursache – zum Beispiel volle Festplatten, Autostart-Programme, fehlende Updates, Schadsoftware oder alte Hardware. Mit einer Fehleranalyse finden wir die Ursache und beheben sie dauerhaft.', 'fehleranalyse.html', 'Fehleranalyse'],
        ['E-Mail kommt nicht an, landet im Spam, Outlook geht nicht, Postfach voll', 'Wenn E-Mails nicht ankommen oder im Spam landen, fehlen oft wichtige Einstellungen bei der Domain (SPF, DKIM, DMARC). Outlook-Probleme liegen häufig am Profil oder an einem vollen Postfach. Beides lässt sich meist schnell per Fernwartung lösen.', 'exchange-online.html', 'Exchange Online'],
        ['Passwort vergessen, Konto gesperrt, Anmeldung geht nicht, Login Microsoft', 'Bei gesperrten Konten oder vergessenen Passwörtern helfen wir schnell beim Zurücksetzen – und richten auf Wunsch gleich MFA ein, damit das Konto künftig besser geschützt ist.', 'mfa.html', 'MFA'],
        ['neuer Laptop PC einrichten, Daten übertragen, neues Gerät', 'Wir richten neue Computer und Laptops komplett ein: Benutzerkonto, E-Mail, Programme, Drucker und die Übertragung Ihrer Daten vom alten Gerät.', 'benutzerbetreuung.html', 'Benutzerbetreuung'],
        ['Daten gelöscht, Datei weg, Daten verloren, Festplatte kaputt, wiederherstellen', 'Bitte arbeiten Sie mit dem betroffenen Gerät möglichst nicht weiter, damit nichts überschrieben wird. Wenn ein Backup vorhanden ist, holen wir die Daten von dort zurück. Melden Sie sich am besten direkt.', 'wiederherstellung.html', 'Wiederherstellung'],
        ['Homeoffice, von zuhause arbeiten, Fernzugriff aufs Büro, VPN', 'Für sicheres Arbeiten von zu Hause richten wir Microsoft 365, OneDrive und bei Bedarf ein VPN ein, damit Sie geschützt auf Ihre Daten zugreifen können.', 'vpn-netzwerk.html', 'VPN & Netzwerk'],
        ['Praxis Arztpraxis Kanzlei IT, Datenschutz Praxis, Patientendaten', 'Für Praxen und Kanzleien sind sichere Zugänge, verschlüsselte Geräte und zuverlässige Backups besonders wichtig. Wir setzen die technischen Maßnahmen um und erklären sie verständlich.', 'it-security.html', 'IT-Sicherheit'],
        ['Sicherheitscheck, wie sicher ist meine IT, IT prüfen lassen', 'Mit einem IT-Sicherheitscheck prüfen wir Konten, Passwörter, Updates, Virenschutz, Firewall und Backups und zeigen Ihnen verständlich, was zu tun ist.', 'sicherheitscheck.html', 'Sicherheitscheck'],
        ['Netzwerkschrank Verkabelung Kabel Switch LAN Patchfeld', 'Wir bauen und ordnen Netzwerkschränke, verkabeln sauber und beschriften alles – damit Störungen schneller gefunden werden und Erweiterungen einfach möglich sind.', 'netzwerk-server.html', 'Netzwerk & Server'],
    ];
    CURATED.forEach(([k, a, u, t]) => docs.push({ type: 'cur', q: k, a, u, t, tq: tokens(k), ta: tokens(a), tt: tokens(t) }));
    const df = {};
    docs.forEach((d) => new Set([...d.tq, ...d.ta, ...d.tt]).forEach((w) => { df[w] = (df[w] || 0) + 1; }));
    const idf = (w) => Math.log(1 + docs.length / (1 + (df[w] || 0)));

    function score(qt, d) {
        let s = 0;
        qt.forEach((w) => {
            const weight = w.startsWith('~') ? 0.5 : 1;
            const hit = (arr) => arr.some((x) => x === w || close1(x, w) || (w.length > 5 && (x.startsWith(w) || w.startsWith(x))));
            if (hit(d.tq)) s += 3 * idf(w) * weight;
            else if (hit(d.tt)) s += 2 * idf(w) * weight;
            else if (hit(d.ta)) s += 1 * idf(w) * weight;
        });
        if (d.type === 'faq') s *= 1.1;
        if (d.type === 'cur') s *= 1.35;
        return s;
    }

    // ---------- Orte ----------
    const PLACES = [
        ['bad godesberg', 'it-service-bad-godesberg.html', 'Bad Godesberg'], ['godesberg', 'it-service-bad-godesberg.html', 'Bad Godesberg'],
        ['beuel', 'it-service-beuel.html', 'Beuel'], ['siegburg', 'it-service-siegburg.html', 'Siegburg'],
        ['sankt augustin', 'it-service-sankt-augustin.html', 'Sankt Augustin'], ['st augustin', 'it-service-sankt-augustin.html', 'Sankt Augustin'],
        ['troisdorf', 'it-service-troisdorf.html', 'Troisdorf'], ['koenigswinter', 'it-service-koenigswinter.html', 'Königswinter'],
        ['koeln', 'it-service-koeln.html', 'Köln'], ['bonn', 'it-service-bonn.html', 'Bonn'],
    ];
    const NEAR = ['wachtberg', 'meckenheim', 'bornheim', 'alfter', 'rheinbach', 'niederkassel', 'hennef', 'lohmar', 'bad honnef', 'remagen', 'wesseling', 'swisttal', 'much', 'neunkirchen'];

    // ---------- feste Antworten ----------
    const A = {
        greet: { text: 'Hallo! 👋 Ich bin der Assistent von Etlabora IT. Fragen Sie mich gern zu Microsoft 365, Netzwerk & WLAN, IT-Sicherheit, Backup oder Fernwartung – oder schildern Sie einfach Ihr Problem.', chips: ['Welche Leistungen?', 'Was kostet das?', 'Fernwartung starten'] },
        thanks: { text: 'Sehr gern! Wenn Sie möchten, melden Sie sich einfach direkt – das erste Gespräch ist kostenlos.', actions: ['call', 'wa'] },
        contact: { text: `Sie erreichen Etlabora IT direkt per Telefon unter ${PHONE}, per WhatsApp oder per E-Mail an ${MAIL}. Sie sprechen immer mit Ihrem persönlichen Ansprechpartner.`, actions: ['cal', 'call', 'wa', 'mail'] },
        price: { text: 'Die Kosten hängen vom Umfang ab – deshalb besprechen wir den Aufwand immer vorher mit Ihnen, ohne Überraschungen auf der Rechnung. Die Erstberatung ist kostenlos. Schildern Sie kurz Ihr Anliegen, dann bekommen Sie eine klare Einschätzung.', actions: ['cal', 'wa'] },
        emergency: { text: '⚠️ Das klingt dringend. Bitte trennen Sie das betroffene Gerät vom Netzwerk (WLAN aus bzw. Kabel ziehen), schalten Sie es aber nicht aus, und geben Sie keine Passwörter oder Zahlungen heraus. Rufen Sie uns direkt an, damit wir schnell helfen können.', actions: ['call', 'wa'], link: ['it-security.html', 'IT-Sicherheit'] },
        remote: { text: 'Für die Fernwartung laden Sie TeamViewer oder AnyDesk herunter und geben uns nach kurzer Absprache die angezeigte ID. Eine Verbindung entsteht nur mit Ihrer Freigabe.', actions: ['call', 'wa'], link: ['remote.html', 'Zur Fernwartung'] },
        services: { text: 'Etlabora IT hilft bei: IT-Beratung & Planung, Netzwerk & WLAN & Server, Microsoft 365 & E-Mail, Azure & Intune, IT-Sicherheit, Backup & Datensicherung sowie Support per Fernwartung und vor Ort.', link: ['leistungen.html', 'Alle Leistungen'], chips: ['Microsoft 365', 'WLAN Probleme', 'Backup einrichten'] },
        area: { text: 'Vor Ort sind wir in Bonn und im Rhein-Sieg-Kreis unterwegs – z. B. Bad Godesberg, Beuel, Siegburg, Sankt Augustin, Troisdorf und Königswinter. Per Fernwartung helfen wir überall.', link: ['leistungen.html', 'Leistungen ansehen'] },
        private: { text: 'Ja, wir helfen auch Privatkunden – zum Beispiel bei WLAN, neuen Laptops, Druckern, E-Mail oder der Sicherung von Fotos und Dokumenten.', actions: ['call', 'wa'] },
        hours: { text: 'Am besten erreichen Sie uns per WhatsApp oder über das Kontaktformular – wir melden uns schnellstmöglich persönlich zurück. Die aktuellen Erreichbarkeitszeiten finden Sie auch in unserem Google-Profil.', actions: ['wa', 'form'] },
        bot: { text: 'Ich bin ein einfacher Website-Assistent und kenne die Inhalte dieser Webseite. Für Ihre konkrete Situation sprechen Sie am besten direkt mit uns – persönlich und kostenlos.', actions: ['call', 'wa'] },
        fallback: { text: 'Dazu habe ich keine passende Antwort gefunden. Schreiben Sie uns Ihr Anliegen am besten kurz per WhatsApp oder über das Formular – Sie bekommen eine persönliche Antwort.', actions: ['cal', 'wa'], chips: ['Welche Leistungen?', 'Was kostet das?', 'Kontakt'] },
    };

    const has = (q, list) => list.some((w) => (w.startsWith(' ') || w.endsWith(' ') ? q.includes(w) : new RegExp('(^|\\s)' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(q)));

    function intent(raw) {
        const q = ' ' + norm(raw) + ' ';
        const short = q.trim().split(/\s+/).length <= 3;
        if (has(q, ['gehackt', 'hacker', 'erpress', 'verschluesselt worden', 'dateien verschluesselt', 'daten verschluesselt', 'ransomware', 'trojaner', 'virus auf', 'virus drauf', 'einen virus', 'virus eingefangen', 'link geklickt', 'phishing', 'betrueger', 'betrug', 'datenleck', 'angegriffen', 'falscher microsoft'])) return A.emergency;
        if (short && has(q, [' hallo ', ' hi ', ' hey ', ' moin ', ' servus ', 'guten tag', 'guten morgen', 'guten abend'])) return A.greet;
        if (short && has(q, ['danke', 'super', 'perfekt', ' top '])) return A.thanks;
        if (has(q, [' ki ', 'chatgpt', 'roboter', ' bot ', 'bist du ein mensch', 'echter mensch'])) return A.bot;
        if (has(q, ['kosten', ' kostet', ' preis', 'preise', 'teuer', 'guenstig', 'stundensatz', 'was zahl', 'angebot'])) return A.price;
        if (has(q, ['termin', 'beratung', 'erstberatung', 'buchen', 'kalender'])) return { text: 'Eine kostenlose Erstberatung können Sie direkt online buchen – wählen Sie einfach Ihren Wunschtermin, wir rufen Sie dann an.', actions: ['cal', 'call', 'wa'] };
        if (has(q, ['oeffnungszeit', 'erreichbar', 'wann seid', 'wann sind sie', 'uhrzeit', 'wochenende', 'samstag', 'sonntag', 'abends'])) return A.hours;
        if (has(q, ['teamviewer', 'anydesk', 'fernwartung starten', 'fernwartung', 'remote'])) return A.remote;
        if (has(q, ['privat', 'zuhause', 'zu hause', 'oma', 'opa', 'eltern'])) return A.private;
        if (has(q, ['kontakt', 'telefon', 'nummer', 'anrufen', 'erreichen', 'whatsapp', 'adresse', 'email adresse', 'mail adresse'])) return A.contact;
        const place = PLACES.find(([k]) => q.includes(k));
        if (place) return { text: `Ja, in ${place[2]} sind wir für Sie da – per Fernwartung sofort und nach Absprache auch vor Ort.`, link: [place[1], `IT-Service ${place[2]}`], actions: ['call', 'wa'] };
        if (has(q, NEAR)) return A.area;
        if (has(q, ['wo seid', 'wo sind sie', 'einzugsgebiet', 'umgebung', 'region', 'vor ort'])) return A.area;
        if (short && has(q, ['leistung', 'angebot', 'was macht', 'was bietet', 'service'])) return A.services;
        return null;
    }

    function search(raw) {
        const qt = tokens(raw);
        if (!qt.length) return null;
        const ranked = docs.map((d) => ({ d, s: score(qt, d) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
        if (!ranked.length) return null;
        const best = ranked[0];
        const threshold = qt.length === 1 ? 1.6 : 2.6;
        if (best.s < threshold) return null;
        const d = best.d;
        const related = [];
        ranked.slice(1).forEach((r) => {
            if (related.length < 2 && r.s > best.s * 0.55 && r.d.u !== d.u && !related.find((x) => x.u === r.d.u)) related.push(r.d);
        });
        return {
            text: d.type === 'page' ? `${d.t}: ${d.a}` : d.a,
            link: [d.u, `Mehr dazu: ${LABEL[d.u] || d.t}`],
            related,
            actions: ['wa'],
        };
    }

    // ---------- Darstellung ----------
    const ACTION = {
        call: ['📞 Anrufen', TEL, false], wa: ['💬 WhatsApp', WA, true],
        mail: ['✉️ E-Mail', 'mailto:' + MAIL, false], cal: ['📅 Termin buchen', 'https://cal.com/etlabora-it/erstberatung', true], form: ['📝 Formular', 'kontakt.html#formular', false],
    };

    function bubble(type) {
        const b = document.createElement('div');
        b.className = 'ai-message ' + type;
        messages.appendChild(b);
        return b;
    }

    function render(res) {
        const b = bubble('bot');
        const p = document.createElement('p');
        p.textContent = res.text;
        b.appendChild(p);
        const links = [];
        if (res.link) links.push(res.link);
        (res.related || []).forEach((r) => links.push([r.u, LABEL[r.u] || r.t]));
        if (links.length) {
            const box = document.createElement('div');
            box.className = 'ai-links';
            links.forEach(([href, label], i) => {
                const a = document.createElement('a');
                a.href = href; a.textContent = (i === 0 ? '→ ' : '↗ ') + label;
                box.appendChild(a);
            });
            b.appendChild(box);
        }
        if (res.actions && res.actions.length) {
            const box = document.createElement('div');
            box.className = 'ai-actions';
            res.actions.forEach((k) => {
                const [label, href, ext] = ACTION[k];
                const a = document.createElement('a');
                a.href = href; a.textContent = label;
                if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
                box.appendChild(a);
            });
            b.appendChild(box);
        }
        if (res.chips) setChips(res.chips);
        messages.scrollTop = messages.scrollHeight;
    }

    function setChips(list) {
        suggestionBox.innerHTML = '';
        list.forEach((t) => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.textContent = t;
            btn.addEventListener('click', () => ask(t));
            suggestionBox.appendChild(btn);
        });
    }

    function typing() {
        const b = bubble('bot typing');
        b.innerHTML = '<span></span><span></span><span></span>';
        messages.scrollTop = messages.scrollHeight;
        return b;
    }

    function ask(q) {
        const clean = q.trim();
        if (!clean) return;
        const u = bubble('user'); u.textContent = clean;
        input.value = '';
        const t = typing();
        const res = intent(clean) || search(clean) || A.fallback;
        setTimeout(() => { t.remove(); render(res); }, 450 + Math.min(clean.length * 8, 450));
    }

    toggle.addEventListener('click', () => {
        root.classList.toggle('open');
        if (root.classList.contains('open')) setTimeout(() => input.focus({ preventScroll: true }), 50);
    });
    close.addEventListener('click', () => root.classList.remove('open'));
    form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
    setChips(['Welche Leistungen?', 'WLAN ist langsam', 'Was kostet das?']);

    // Kopf & Begrüßung anpassen
    const sub = root.querySelector('.ai-chatbot-header span');
    if (sub) sub.textContent = 'Kennt alle Inhalte dieser Seite';
    const first = messages.querySelector('.ai-message.bot');
    if (first) first.textContent = 'Hallo! 👋 Stellen Sie mir einfach Ihre Frage – z. B. „Mein WLAN bricht ständig ab“ oder „Brauche ich ein Backup für Microsoft 365?“.';
    input.placeholder = 'Ihre Frage oder Ihr Problem …';

    // Test-Hook
    window.__etlaboraChatAnswer = (q) => intent(q) || search(q) || A.fallback;
})();
