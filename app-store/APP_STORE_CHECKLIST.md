# AFRO SPORT — TestFlight / App Store checklist

## App identity
- Name: AFRO SPORT
- Bundle ID: com.chisostome.afrosport
- Version: 1.0.0
- Initial build: 1
- Primary category: Sports
- Suggested subtitle: Michezo ya Afrika na dunia
- Support URL: https://chisostome.github.io/AFRO-SPORT/support.html
- Privacy Policy URL: https://chisostome.github.io/AFRO-SPORT/privacy.html
- Marketing URL: https://chisostome.github.io/AFRO-SPORT/
- App website: https://chisostome.github.io/AFRO-SPORT/

## Draft description
AFRO SPORT ni programu ya michezo inayokuwezesha kufuatilia mechi, ligi, timu, wachezaji, msimamo wa ligi, wafungaji bora na takwimu nyingine za michezo.

Imejengwa kwa kuzingatia matumizi rahisi kwenye simu na inaunganisha taarifa za michezo na akaunti za watumiaji pale inapohitajika.

## Draft keywords
michezo,football,soka,africa,mechi,ligi,timu,wachezaji,takwimu,matokeo

## Suggested metadata
- Copyright: © 2026 AFRO SPORT
- Primary language: Swahili
- App type: Free
- Age rating: chagua rating inayolingana na maudhui halisi ya toleo la mwisho.

## Privacy draft
The app uses account authentication and stores account information needed to provide the service. Review the actual production data flows before publishing the final App Privacy answers in App Store Connect.

Likely data categories to review:
- Contact Info: email address, if collected for account authentication.
- User Content: display name, if collected and shown in the app.
- Identifiers: account/user identifier, if used for account management.
- Diagnostics: only declare if the production app actually collects diagnostics through a third-party SDK.

## Before TestFlight
1. Jiunge na Apple Developer Program.
2. Tengeneza App ID ya wazi: com.chisostome.afrosport.
3. Tengeneza app record ya App Store Connect kwa bundle ID hiyo.
4. Kubali mikataba ya Apple inayohitajika.
5. Weka App Privacy na privacy policy URL.
6. Weka screenshots na metadata.
7. Weka GitHub Actions secrets zilizoainishwa kwenye .github/workflows/release-ios.yml.
8. Endesha workflow ya Release iOS.
9. Hakikisha build imeonekana App Store Connect na malizia taarifa za TestFlight.
10. Kwa external testers, tuma build ya kwanza kwa beta review ikiwa App Store Connect itaomba.
