# Irodalmi Videók

Egy weboldal, ami valójában egy könyv: kinyitható borító, tartalomjegyzék, és
minden fejezetre kattintva a lap "kilapozódik", hogy a hátoldalán megjelenjen
a hozzá tartozó videó.

Egyelőre **ideiglenes/dummy tartalommal** fut — 10 valós, ellenőrzött (de nem
véglegesnek szánt) YouTube videóval, főleg Shakespeare-témában (TED-Ed,
Crash Course Literature/Theater), plusz egy Dosztojevszkij-videó. A végleges
linkeket később kapja meg a projekt.

## Fejlesztés

Build-lépés nincs, tiszta HTML/CSS/JS:

```bash
npx serve .
```

## Fájlok

- `index.html` — az oldal váza (borító + könyv-spread)
- `css/style.css` — a könyv-design és a 3D lapozás-animáció
- `js/chapters-data.js` — a fejezetek adatai (cím, szerző, YouTube ID, leírás)
- `js/book.js` — borító nyitása, tartalomjegyzék renderelés, lapozás-logika

## GitHub Pages

`main` ág, repó gyökér.
