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

## Example Usage

The following example will demonstrate interfacing with a PS3 guitar hero
controller.  This example demonstrates how to connect to a device with a
specific `vendor:product` device string:

__NOTE:__  Interfacing with the guitar hero controller is proving difficult
and if you are trying to achieve this for anything, then I'd recommend
checking out the [pull-hid](https://github.com/DamonOehlman/pull-hid) as
a much more robust alternative.

```js
var easyusb = require('easyusb');
var device = easyusb('0x12ba:0x0100');

device.read(function(err, data) {
  if (err) {
    console.error(err);
    return device.close();
  }

  console.log('read data: ', data);
  device.close();
});

```

The next example shows how the
[skyportal](https://github.com/DamonOehlman/skyportal) can be simplified
using the `easyusb` module.  In this example, we look for any of the matching
vendor / product combinations that we know a portal might have:

```js
var easyusb = require('easyusb');
var device = easyusb([
  [ 0x1430, 0x1f17 ],
  [ 0x1430, 0x0150 ]
]);

device.read(0x20, function(err, data) {
  if (err) {
    console.error(err);
    return device.close();
  }

  console.log('read data: ', data);
  device.close();
});

```

## Reference

### easyusb(opts) => EventEmtiter

Create a patched `EventEmitter` that will provide the ability to interact with
a usb device matching the specified criteria specified in `opts`.  Devices can
be specified either specifying `opts.devices`, or passing through an array of
vendor / product pairs or a single vendor:product device string.

### device.close(callback)

Attempt to close the device interface.

### device.read(size, callback)

Attempt to read `size` bytes from the input endpoint of the connected
usb device.

### device.write(data, callback)

Write the specified `data` to the device.

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
