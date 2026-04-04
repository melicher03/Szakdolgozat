# FamilyHub - Teljes Projekt Dokumentacio

## 1. Bevezetes
A FamilyHub egy csaladi kommunikacios webalkalmazas, amelynek celja, hogy egy kozos, konnyen hasznalhato digitalis terben tamogassa a csaladtagok mindennapi kapcsolattartasat. A projekt szakdolgozati keretben keszult, es olyan alapveto funkciokat fog ossze, amelyek egy modern csaladi platformtol elvarhatok:

- valos ideju uzenetkuldes,
- csoportos beszelgetesek,
- kozos esemenynaptar,
- kategorizaIt hivatkozasmentes,
- fajlmegosszas es adattarolas.

A FamilyHub kulon hangsulyt helyez a gyakorlati hasznalhatosagra, az atlathato feluletre es az adatok felhoalapu kezelesere.

## 2. Projektcel es alapgondolat
A projekt alapgondolata, hogy a csaladon beluli kommunikaciot es informaciomegosztast ne kulonbozo, szetszort platformokon keresztul kelljen intezni, hanem egy egyseges rendszerben. A FamilyHub ezt ugy valositja meg, hogy a klasszikus social feed jellegu elemeket, a chatet, a naptarat es a fajl/link kezelesi modulokat egy alkalmazason belul egyesiti.

Fo celok:
- Egyszeru, gyors kommunikacio biztositas.
- Csaladi csoportok szervezese es kezelese.
- Fontos linkek es fajlok rendszerezett tarolasa.
- Kozos esemenyek nyomon kovetese.
- Skalazhato backend-frontend architektura kialakitasa.

## 3. Funkcionalis kovetelmenyek (README alapjan)
A README-ben meghatarozott funkciok:

1. Uzenetkuldes
A felhasznalok valos idoben kuldhetnek egymasnak uzeneteket, ezzel gyors es azonnali kommunikaciot biztositva.

2. Csoportos beszelgetesek
A rendszer csaladi csoportokba szervezi a kommunikaciot, ahol tobb tag egyszerre tud interakcioba lepni.

3. Kategorizalt hivatkozasmentes
A fontos hivatkozasok mentese strukturaltan, hogy kesobb konnyen visszakereshetok legyenek.

4. Esemenynaptar
A csaladtagok kozos esemenyeket tudnak letrehozni es kovetni.

5. Adattarolas es fajlmegosztas
Fajlok feltoltese, tarolasa es megosztasa kozponti helyen, felhoalapu megoldassal.

## 4. Technologiai stack
### 4.1 Frontend
- React
- TypeScript
- Material UI (MUI)
- Vite

A frontend modern komponensalapu strukturat kovet, ahol az allapotkezeles es API-integracio a komponensekben, elsosorban hookokkal tortenik.

### 4.2 Backend
- Node.js
- NestJS
- TypeORM
- PostgreSQL (Supabase)
- WebSocket (Socket.IO, Nest gateway)

A backend modulrendszere egyertelmuen kulonvalasztja az uzleti logikat, kontrollereket, DTO-kat es entitasokat.

### 4.3 Infrastrukturális elemek
- Supabase PostgreSQL: adatbazis
- Supabase Storage: fajltarolas
- REST API + WebSocket kommunikacio frontend es backend kozott

## 5. Rendszerarchitektura
A FamilyHub klasszikus kliens-szerver architekturara epul:

- Frontend (React): UI, felhasznaloi interakciok, API hivasok, WebSocket kliens.
- Backend (NestJS): REST vegpontok, WebSocket gateway, adatbazismuveletek.
- Supabase: perzisztens adattarolas (strukturalt adatok + fajlok).

Adatfolyam altalanos menete:
1. Felhasznaloi muvelet a frontendben.
2. REST hivas vagy WebSocket uzenet a backend fele.
3. Backend validacio, uzleti logika, TypeORM muveletek.
4. Valasz a frontend fele.
5. UI frissites.

## 6. Backend modulok attekintese
A jelenlegi projektstrukturaban az almodulok kulon mappakban helyezkednek el.

### 6.1 AppModule
Az alkalmazas gyoker modulja, ahol osszeall a teljes rendszer:
- ConfigModule (globalis konfiguracio)
- TypeOrmModule (adatbazis-kapcsolat)
- Domain modulok importja

### 6.2 FamilyGroups modul
Feladata a csaladi csoportok kezelese:
- csoport letrehozas,
- listazas,
- egyedi csoport lekero,
- modositas,
- torles.

### 6.3 Messages modul
Valos ideju uzenetkezeles:
- uzenetek tarolasa,
- csoport szerinti lekeres,
- WebSocket esemenyek kezelese (join, send, typing, leave).

### 6.4 CalendarEvents modul
Kozos naptar funkcionalitas:
- esemenyek CRUD muveletei,
- csoporthoz rendelt esemenyek,
- datum/idointervallum kezeles.

### 6.5 Assets modul
Link- es fajlkezeles:
- URL mentese adatbazisba,
- fajl feltoltes Supabase Storage-ba,
- mentett assetek listazasa,
- torles.

### 6.6 Tasks modul
Altalanos feladatkezelo minta modul, amely tovabbi workflow-k alapjat adhatja.

## 7. Entitasok es adatmodell
A projekt TypeORM entitasokkal dolgozik. A fontosabb modellek:

1. FamilyGroup
- csoport azonosito,
- csoportnev,
- tagok,
- tulajdonos.

2. Message
- uzenetazonosito,
- szoveg,
- kuldo adatai,
- csoporthoz tartozo azonosito,
- letrehozas ideje.

3. CalendarEvent
- esemenyazonosito,
- cim/leiras,
- kezdo es zaro idopont,
- csoportkapcsolat.

4. SharedAsset
- asset tipus (FILE vagy URL),
- cim,
- URL,
- storage path (fajl eseten),
- MIME tipus,
- fajlmeret,
- csoportkapcsolat,
- feltolto,
- letrehozas idopontja.

## 8. API szemlelet es kommunikacio
### 8.1 REST API
A REST vegpontok a klasszikus eroforras-szemleletet kovetik.
Peldak:
- /family-groups
- /calendar-events
- /assets
- /tasks

### 8.2 WebSocket
A chatmodul valos ideju esemenyeket kezel:
- csatlakozas csoporthoz,
- uzenet kuldes/fogadas,
- gepeles jelzes,
- kilepes csoportbol.

## 9. Frontend struktura es UI koncepcio
A jelenlegi frontend a komponensalapu megkozelitest koveti. A fo oldal ket panelre szervezodik:

1. Bal panel
- kivalasztott csaladi csoport fajljai es linkjei,
- fajlfeltoltes,
- URL mentese,
- tarolt elemek listaja.

2. Jobb panel
- kivalasztott csoport chat felulete,
- uzenetlista,
- uzenetkuldes,
- gepeles/online allapot visszajelzesek.

Ez a felepites csokkenti a vizualis zajt es a felhasznalot a ket legfontosabb napi muveletre fokuszalja:
- kommunikacio,
- tartalomkezeles.

## 10. Konfiguracio es kornyezeti valtozok
A projekt futasahoz kulonosen fontosak a backend kornyezeti valtozoi.

Fobb valtozok:
- SUPABASE_DB_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET

Alapertelmezett storage bucket: media

Megjegyzes:
A fajlfeltoltes Supabase Storage mukodeshez a SUPABASE_URL es SUPABASE_SERVICE_ROLE_KEY kotelezo.
A backend alapertelmezetten a media bucketet hasznalja, ha a SUPABASE_STORAGE_BUCKET nincs beallitva.

## 11. Telepites es futtatas (fejlesztoi)
Altalanos fejlesztoi lepesek:

1. Fuggosegek telepitese
- backend es frontend csomagok telepitese.

2. Kornyezeti valtozok beallitasa
- backend .env konfiguracio Supabase adatokkal.

3. Backend inditas
- NestJS szerver futtatasa.

4. Frontend inditas
- Vite dev szerver futtatasa.

5. Ellenorzes
- API endpointok,
- chat kapcsolodas,
- link mentes,
- fajlfeltoltes.

## 12. Jelenlegi allapot rovid ertekelese
A projekt jelenleg mar nem csak alapvaz, hanem tobb, valoban hasznalhato modulbol allo alkalmazas:

- valos ideju chat alapok megvannak,
- csoportkezeles elerheto,
- naptar modul integralt,
- URL es fajl asset kezeles kialakitott,
- frontend ket-paneles, celzott workflow-val.

## 13. Kockazatok es ismert technikai pontok
1. Schema sync kockazat
TypeORM synchronize=true beallitas fejlesztes kozben kenyelmes, de valos adatokkal konnyen okozhat indulasi hibakat (null constraint, tipusvaltas, stb.).

2. Migraciok hianya
A stabil adatbazis-verziokezeleshez migration workflow ajanlott.

3. Auth kulon modul hianya
A jelenlegi allapotban a felhasznalo-azonositas egyszerusitett, teljes auth/authorization modul tovabbi fejlesztesi terulet.

## 14. Javasolt kovetkezo fejlesztesi lepesek
1. TypeORM migrations teljes bevezetese
- synchronize kikapcsolasa,
- schema valtozasok kontrollalt kezelese.

2. Hitelesites es jogosultsag
- felhasznalo kezeles,
- token alapu vedelmi retegek.

3. Assetekhez metaadatok es kategoriak
- files: tipus/szulo mappa/cimkek,
- links: kategoriak, kedvencek, gyorsszurok.

4. Chat bovites
- uzenetelozmeny paginalas,
- read receipt,
- media attachment chaten belul.

5. Megfigyelhetoseg
- strukturalt logolas,
- alap metrikak,
- hibak kovetese.

## 15. Osszegzes
A FamilyHub projekt egy jol strukturalt, modern webalkalmazas alapokra epulo szakdolgozati rendszer, amely a csaladi kommunikacio es kozos digitalis tartalomkezeles kulcsproblemainak megoldasara keszult. A README-ben meghatarozott funkcionalitasok technikailag megalapozott iranyba fejlodtek, es a projekt jelenlegi allapota jo kiindulopontot ad egy teljes, produkcios szintu csaladi platform fele.

A rendszer legnagyobb erteke az, hogy egyesiti:
- a valos ideju kommunikaciot,
- a strukturalt informaciotarolast,
- es a csoportalapu egyuttmukodest
egy egyseges, bovitheto architekturaban.
