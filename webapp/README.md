# audible-feedback
Simple webapp for training feedback frequencies.

Live at **https://chrish.github.io/audible-feedback/**

## Modes

- **Explore** — click any of the 31 ISO frequency bands to hear it play
- **Guess** — play a random frequency and identify which band it is
- **Competition** — timed session (10–30 questions) with full result statistics

## Deployment

Handled automatically by GitHub Actions on every push to `main`. The workflow builds `dist/` from the `webapp/` source and deploys it to GitHub Pages.

To enable it: go to **Settings → Pages** and set the source to **GitHub Actions**.

## Development

No build step required. Open `index.html` directly in a browser, or serve with any static file server:

```bash
python3 -m http.server
```
