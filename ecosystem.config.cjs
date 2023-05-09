module.exports = {
  apps: [
    {
      name: "lrwra-raindata",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p " + (process.env.PORT || 8020),
      watch: false,
      autorestart: true,
    },
  ],
};
