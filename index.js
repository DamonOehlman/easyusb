var EventEmitter = require('events').EventEmitter;
var usb = require('usb');

/**
  # easyusb

  This module wraps the [usb](https://github.com/nonolith/node-usb) package to
  provide a slightly simpler interface to working with USB devices.  It is not
  a full-featured implementation and at this point in time is focused on
  reading from devices.

  For more complex applications I would recommend either looking at the `usb`
  package or potentially the [node-hid](https://github.com/node-hid/node-hid)
  project.

  ## Example Usage (Proposed)

  The following example will demonstrate interfacing with a PS3 guitar hero
  controller.

  <<< examples/gh-controller.js

**/
module.exports = function(opts) {
  var devices = (opts || {}).devices || [];
  var device = new EventEmitter();
  var target;

  function isMatch(a) {
    return devices.filter(function(b) {
      return b[0] == a[0] && b[1] == a[1];
    }).length > 0;
  }

  function readDescriptor(data) {
    return [
      data.deviceDescriptor.idVendor,
      data.deviceDescriptor.idProduct
    ];
  }

  device.read = function(callback) {
    if (! target) {
      return callback(new Error('could not find device'));
    }
  };

  if (typeof opts == 'string' || (opts instanceof String)) {
    devices = [ opts.split(':') ]
  }
  else if (Array.isArray(opts)) {
    devices = opts;
  }

  // look for the target device
  target = usb.getDeviceList().map(readDescriptor).filter(isMatch)[0];
  console.log(target);

  return device;
};
