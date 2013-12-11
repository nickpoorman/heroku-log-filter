#heroku-log-filter

CLI tool to filter out heroku messages and retain the color coding. It might be just as simple to do this with a combination of bash-fu and grep but now there is a node module for it.

[![build status](https://secure.travis-ci.org/nickpoorman/heroku-log-filter.png)](https://travis-ci.org/nickpoorman/heroku-log-filter)

# example

filter out status messages:

``` bash
$ heroku logs | node heroku-log-filter -e "/server/status"
```

# install

With [npm](https://npmjs.org) do:

```
npm install -g heroku-log-filter
```

# license

MIT
