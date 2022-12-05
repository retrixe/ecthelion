# ecthelion

A frontend for Octyne.

## Quick Start

1. Prerequisites: Install [Node.js](https://nodejs.dev/en/download/) (on macOS/Linux, follow the "install via a package manager" instructions, preferably using [n](https://nodejs.dev/en/download/package-manager#n) to get the latest Node.js LTS version) and [Git](https://www.atlassian.com/git/tutorials/install-git). After installing Node.js, run `corepack enable` in the terminal to install the Yarn package manager (run as administrator/`sudo` may be needed).
2. Download Ecthelion to a folder by running `git clone https://github.com/retrixe/ecthelion.git` in terminal where you wish to place Ecthelion.
3. Select the current version of Ecthelion after downloading it by running `git checkout <version>` in the Ecthelion folder. Alternatively, for the development version, run `git checkout main`.
4. Follow the steps [here](https://github.com/retrixe/ecthelion#configuration) to configure Ecthelion correctly. After configuration changes, rebuild Ecthelion with `yarn build`.
5. Run `yarn start` to start Ecthelion's built-in web server, you can specify a port by passing `-p <port>`. Alternatively, you can run `yarn export` to export Ecthelion to static HTML/CSS/JS files in the `out` folder you can serve via nginx or Apache.
6. To update Ecthelion, run `git pull` in the Ecthelion folder, then re-run step 2 through 5.

You might want to manage Ecthelion using systemd on Linux systems, which can start and stop Ecthelion, start it on boot, store its logs and restart it on crash. [This article should help you out.](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6) Alternatively, you can run Ecthelion with Octyne, but if you have issues with Ecthelion, this may be a problem.

## Configuration

Create a `config.json` in the top level of the project and then add the following content:

```json
{
  "ip": "<absolute URL to Octyne>",
  "nodes": {
    "<name of node>": "<absolute URL to Octyne node>"
  },
  "basePath": "<pass this if you want ecthelion on a sub-path like e.g. /ecthelion>"
}
```

The ip field is required, while nodes and basePath are optional.

Absolute URLs to Octyne should be accessible to users (make sure Octyne is port forwarded), and are in the format of `http[s]://<ip address or domain name>[:<port>][/<sub-URL if using nginx/apache to reverse proxy>]`, e.g. `http://43.12.45.32:42069` or `https://console.myserver.com/octyne`. Using `localhost` will only work on the same machine that Octyne runs on. The URL should also not end with `/`.
