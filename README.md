# Firefox Add-on for PaperHive

[![Build Status](https://travis-ci.org/paperhive/paperhive-firefox-addon.svg?branch=master)](https://travis-ci.org/paperhive/paperhive-firefox-addon)
[![Dependency
Status](https://gemnasium.com/paperhive/paperhive-firefox-addon.svg)](https://gemnasium.com/paperhive/paperhive-firefox-addon)

## Testing

* Install Firefox >= 38.
* Install [jpm](https://www.npmjs.com/package/jpm):
```
npm install -g jpm
```
* Edit config data:
```
cp config.json.default config.json
```
* Run the add-on:
```
jpm run -b /usr/bin/firefox
```

## License
The PaperHive Firefox Add-on is licensed under the
[GPL3](https://www.gnu.org/licenses/gpl.html) license.
