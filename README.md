# Irodalmi Videók

Egy weboldal, ami valójában egy könyv: kinyitható borító, tartalomjegyzék, és
minden fejezetre kattintva a lap valódi lapozás-animációval (a gerinc körül,
a bal oldal fölé lendülve) fordul át, hogy megjelenjen a hozzá tartozó videó.
Fejezetről fejezetre is lehet lapozni (nem csak a tartalomjegyzékből), és
minden oldalnak saját, megosztható URL-je van (`#toc`, `#fejezet-1` … `#fejezet-10`)
— egy ilyen linket megnyitva a könyv rögtön ott nyílik meg, animáció nélkül.

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
