# LRWRA Raindata App

This is a work project for the Little Rock Water Reclamation Authority. This is a Next.js web app designed to deliver data from our network of rain gauges to the public!

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Getting Started

From the root directory (the same directory this README is in) run `npm run dev` to run a development instance of the app!

## Deployment

Because this project includes both the client and server, it must be hosted as a Node process. This can be done on a new clone of the project with the build and run commands.

```bash
npm run build
npm run start
```

### PM2

PM2 allows the node process to be persisted for deployment purposes. The `ecosystem.config.js` file allows configuration of how the node server is run.

The recommended way to install PM2 on Windows is by using [pm2-installer](https://github.com/jessety/pm2-installer)
