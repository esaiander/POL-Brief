# Payer of Last Resort Brief

Static site for the NASDDDS research brief *Payer of Last Resort*.
No build step. Upload the folder contents to any static host.

## Files

- `index.html` — the brief (uses `assets/` and `brief.js`)
- `brief.js` — contents rail highlighting and reading-progress bar
- `assets/` — logos, dome icons, cover photo, bundled fonts
- `brief-single.html` — the same brief in one self-contained file (cover photo included)
- `brief-lite.html` — one self-contained file, lighter: no cover photo, fonts from Google Fonts
- `.nojekyll` — keeps GitHub Pages from processing the folder

## Hosting

- **GitHub Pages**: push this folder to a repository, then Settings → Pages →
  Deploy from branch `main`, folder `/ (root)`.
- **Netlify / Vercel / S3 / any web server**: upload the folder as-is;
  `index.html` is the entry point.
- **Single file**: if the host only takes one file, use `brief-single.html`.

## Optional variants

`brief.js` reads these attributes on the `<html>` element:

- `data-palette="institutional|woodland|ink|aubergine"`
- `data-density="compact|standard|spacious"`
- `data-cover="photo|editorial|minimal"`

Defaults are institutional, standard, photo.
