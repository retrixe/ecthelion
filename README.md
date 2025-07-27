# ecthelion

A frontend for Octyne.

## Quick Start (Integrated)

Ecthelion comes built into Octyne as a web interface, so you can use it without any additional setup. To access Ecthelion, simply navigate to the Octyne web interface in your browser. This requires Octyne 1.4+ and the `webui` feature enabled in the Octyne configuration.

You may need Ecthelion standalone if you have a multi-node Octyne setup, or if you want to host Ecthelion separately from Octyne. In this case, follow the steps below.

## Quick Start (Standalone)

1. Prerequisites: Install [Node.js](https://nodejs.dev/en/download/) and [Git](https://www.atlassian.com/git/tutorials/install-git). Run `corepack enable` in the terminal as admin/`sudo` to install the Yarn package manager.
2. Download Ecthelion to a folder by running `git clone https://github.com/retrixe/ecthelion.git` in terminal where you wish to place Ecthelion.
3. Select the current version of Ecthelion after downloading it by running `git checkout <version>` in the Ecthelion folder. Alternatively, for the development version, run `git checkout main`.
4. Follow the steps [in the configuration section](https://github.com/retrixe/ecthelion#configuration) to configure Ecthelion correctly. After configuration changes, rebuild Ecthelion with `yarn && yarn build`.
5. Run `yarn start` to start Ecthelion's built-in web server, you can specify a port by passing `-p <port>`. Alternatively, you can run `yarn export` to export Ecthelion to static HTML/CSS/JS files in the `out` folder you can serve via nginx or Apache, however, supporting dynamic routes will require additional work.
6. To update Ecthelion in the future, run `git pull`, then re-run step 3 through 5. [Additionally, make sure to setup HTTPS!](https://github.com/retrixe/ecthelion#https-setup)

You might want to run Ecthelion using `systemd` (if using Linux) to start/stop Ecthelion automatically for you. Alternatively, you can run Ecthelion with Octyne, but if you have issues with Ecthelion, this may be a problem.

### systemd Setup

Create a file named `ecthelion.service` in `/etc/systemd/system/` with the following content:

<details>
<summary>ecthelion.service</summary>

```ini
[Unit]
Description=Ecthelion
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=on-failure
RestartSec=1
# Replace `abcxyz` with your Linux account username.
User=abcxyz
WorkingDirectory=/home/abcxyz/ecthelion/
ExecStart=/usr/bin/env yarn start -p 4200

[Install]
WantedBy=multi-user.target
```

</details>

Then simply run `sudo systemctl enable --now ecthelion.service` to enable and start Ecthelion.

## Configuration

Create a `config.json` in the top level of the project and then add the following content:

```json
{
  "ip": "<absolute URL to Octyne>",
  "nodes": {
    "<name of node>": "<absolute URL to Octyne node>"
  },
  "basePath": "<pass this if you want ecthelion on a sub-path like e.g. /ecthelion>",
  "enableCookieAuth": false
}
```

**⚠️ Important Notes:**

- The `ip` field is required, while `nodes`, `basePath` and `enableCookieAuth` are optional.
- Absolute URLs to Octyne should be accessible to users (make sure Octyne is port forwarded), and are in the format of `http[s]://<ip address or domain name>[:<port>][/<sub-URL if using nginx/apache to reverse proxy>]`, e.g. `http://43.12.45.32:42069` or `https://console.myserver.com/octyne`. The URL should also not end with `/`!
- Cookie authentication is more secure, but it requires Octyne v1.1+, and Ecthelion + Octyne nodes must be under a single domain / IP address!

  To achieve this, you can use a reverse proxy like nginx or Apache. [The Octyne documentation has sample configs for both.](https://github.com/retrixe/octyne#https-setup)
- It is possible to point Ecthelion to an Octyne v1.4+ Web UI port instead of an API port, by adding `/api` to the end of the URL.
