# LRWRA Raindata App

This is a work project for the Little Rock Water Reclamation Authority. This is a Next.js web app designed to deliver data from our network of rain gauges to the public!

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## T3 Stack Info

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Getting Started

To run a development instance of the project, install the dependencies and run the development script.

```bash
npm install
npm run dev
```

The output will indicate that the development server can be reached via `localhost:3000` in your browser.

## Deployment

Because this project includes both the client and server, it must be hosted as a Node process. This can be done on a new clone of the project with the build and run commands.

```bash
npm install
npm run build
npm run start
```

### PM2

[PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) allows the node process to be persisted for deployment purposes. The `ecosystem.config.js` file allows configuration of how the node server is run. To start the process while in the project's root directory, run the following command.

```base
pm2 start ecosystem.config.js
```

The recommended way to install PM2 on Windows is by using [pm2-installer](https://github.com/jessety/pm2-installer)

To see the full pm2 CLI help guide, run `pm2 -h` or `pm2 [command] -h`. You can list the running processes with `pm2 status` or `pm2 list`, which includes a list of IDs and Names for the processes. You can see the logs via `pm2 logs [id|name|namespace]`. You can restart a process with `pm2 restart [id|name|namespace]` and stop with `pm2 stop [id|name|namespace]`.

## Maintenance

The Javascript ecosystem is ever-changing, and this project should be updated to address any vulnerabilities that become known. Major vulnerabilities associated with this project's dependencies can be viewed by running `npm audit`. The `npm audit fix` command will apply any upgrades that can be safely done automatically, but some fixes are more involved.

The `npm outdated` and `npm upgrade` commands can be used to keep dependencies up to date, so any recommended bug fixes can be applied. Keep in mind that some package upgrades will have breaking changes, and may require some development time to migrate to the new version.
