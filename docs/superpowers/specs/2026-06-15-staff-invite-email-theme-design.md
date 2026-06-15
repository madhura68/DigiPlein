# DigiPlein Staff Invite Email Theme

## Context

De staff-uitnodiging wordt via de SMTP/sendmail-laag verstuurd. De bestaande mail is
plain text en betrouwbaar, maar sluit visueel nog niet aan op de DigiPlein UI.

## Design

De uitnodigingsmail wordt `multipart/alternative`:

- `text/plain` blijft de fallback voor sobere mailclients en deliverability.
- `text/html` krijgt inline styles, omdat mailclients Tailwind, CSS variables en
  externe stylesheets niet betrouwbaar ondersteunen.
- De HTML gebruikt DigiPlein-tokenwaarden uit `app/styles/theme.css`: zwarte
  tekst, witte kaart, lichte pagina-achtergrond, `#ee7203` alleen als accentvlak
  of knopachtergrond, en `#b35400` als enige oranje tekstkleur op wit.
- De uitnodigingslink staat zowel als CTA-link als ruwe URL in de mail.
- Er wordt geen Bibliotheek Rotterdam-logo gebruikt zonder expliciete toestemming.

## Veiligheid

De uitnodigingstoken blijft alleen in de mailinhoud staan. Logging blijft
gesanitized en mag geen token, uitnodigingslink, ontvanger of naam bevatten.
Headerwaarden blijven beschermd tegen newline-injectie.

## Testdekking

De mailtests bewaken dat de SMTP-transportinput een multipartbericht bevat met
beide alternatieven, de DigiPlein-kleuren in de HTML gebruikt, de link zichtbaar
blijft als fallback, en logging geen gevoelige uitnodigingsdata lekt.
