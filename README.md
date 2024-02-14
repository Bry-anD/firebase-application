
![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
│   └── firebase-messaging-sw.js
│   └── assets/
│   │   └── favicon.svg
│   │   └── lamp.svg
│   │   └── add_numeric_display.svg
│   │   └── add_widget_gaugue.svg
│   │   └── Riego-auto-functions.png
│   └── canvas-gauges/
|
├── src/
│   ├── components/
│   │   └── Card.astro
│   │   └── ActionsSection.astro
│   │   └── ControlSection.astro
│   │   └── HomeSection.astro
│   │   └── PanelSection.astro
│   │   └── LandingHeader.astro
│   │   └── Register.astro
│   │   └── Widget.astro
│   │   └── Gaugues.astro
│   │   └── Lamps.astro
│   │   └── Indicator.astro
│   │   └── Logo.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│   |   └── index.astro
│   └── javascript/
│       └── firebase.js
│       └── auth.js
│       └── functions.js
│       └── messaging.js
│       └── realtime.js
│       └── index.js
│       └── tables.js
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more about Astro?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
