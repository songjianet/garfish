const { $ } = require('zx');
const waitOn = require('wait-on');
const killPort = require('kill-port');
const { step } = require('./utils');
const portMap = require('../cypress/project/config.json');

const ports = Object.keys(portMap).map((pkgPath) => portMap[pkgPath].port);

const opts = {
  resources: ports.map((port) => `http://localhost:${port}`),
  validateStatus(status) {
    return status >= 200 && status < 300; // default if not provided
  },
};

function runAllExample() {
  // Usage with promises
  return (
    Promise.all(ports.map((port) => killPort(port)))
      // build all demo or dev all example
      .then(() => {
        if (process.env.CI) {
          step('\n building dev project...');
          return $`pnpm run build --parallel --filter "@garfish-cypress/*"`;
        } else {
          step('\n run dev project...');
          return $`npx cross-env TEST_ENV=true pnpm start --filter "@garfish-cypress/*" --parallel`;
        }
      })
      // http-server all demo
      .then(() => {
        if (process.env.CI) {
          step('\n http-server dev dist...');
          Object.keys(portMap).forEach((pkgPath) => {
            // historyapifallback
            if (pkgPath === 'cypress/project/main') {
              $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port} --proxy http://localhost:${portMap[pkgPath].port}?`;
            } else {
              $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port}`;
            }
          });
        }
      })
      .then(() => waitOn(opts))
      .catch((err) => {
        console.error(err);
        ports.forEach((port) => killPort(port));
      })
  );
}

module.exports = {
  ports,
  runAllExample,
};