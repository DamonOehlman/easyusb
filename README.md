# easyusb

This module wraps the [usb](https://github.com/nonolith/node-usb) package to
provide a slightly simpler interface to working with USB devices.  It is not
a full-featured implementation and at this point in time is focused on
reading from devices.

For more complex applications I would recommend either looking at the `usb`
package or potentially the [node-hid](https://github.com/node-hid/node-hid)
project.


[![NPM](https://nodei.co/npm/easyusb.png)](https://nodei.co/npm/easyusb/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/badges/stability-badges) 

## Example Usage (Proposed)

The following example will demonstrate interfacing with a PS3 guitar hero
controller.

```js
var easyusb = require('easyusb');

easyusb('0x12ba:0x0100')
  .read(function(err, data) {
    console.log('read data: ', data);
  });

```

## License(s)

### ISC

Copyright (c) 2014, Damon Oehlman <damon.oehlman@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
