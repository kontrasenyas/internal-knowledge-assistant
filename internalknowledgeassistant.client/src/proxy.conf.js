const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/weatherforecast"
    ],
    target: "https://localhost:7232",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
];

module.exports = PROXY_CONFIG;
