<hr />

> Simple and fast tarball url forwarder that searches with version tags

## Description

This fastify app was created to always serve the latest versions of the packages of your verdaccio registry, because verdaccio apparently doesn't have a direct url for the latest tarball.

## Limitations

According to how this app works, it is not possible to have different protocols between this app and verdaccio. That is, it cannot be like:

* This app with ``https`` and verdaccio registry with ``http``.
* This app with ``http`` and verdaccio registry with ``https``.

Both need to have the same protocol.

## Testing

Before the test, launch your verdaccio and run this app with ``tsc && NODE_ENV=development node .``.

Test with following command:

```sh
# With yarn
$ yarn add http://localhost:4747/-/tarball/<PACKAGE_NAME>

# With npm
$ npm i http://localhost:4747/-/tarball/<PACKAGE_NAME>

# With yarn and version tag
$ yarn add http://localhost:4747/-/tarball/<PACKAGE_NAME>/canary

# With npm
$ npm i http://localhost:4747/-/tarball/<PACKAGE_NAME>/canary
```

## Production Usage

To use this app in production stage, using a reverse proxy like [NGINX](https://www.nginx.com/) or [Apache Web Server](https://httpd.apache.org/) is highly recommended.

### Nginx Config Templates

* [HTTP](./nginx-template-http.conf)
* [HTTPS with Certbot](./nginx-template-certbot.conf)