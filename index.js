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
  var reattach = false;
  var target;

  function isMatch(data) {
    var a = readDescriptor(data);
    return devices.filter(function(b) {
      return b[0] == a[0] && b[1] == a[1];
    }).length > 0;
  }

  function open() {
    try {
      target.open();
    }
    catch (e) {
      return device.emit('error', e);
    }

    // reset the device and then open the interface
    target.reset(function(err) {
      var di;

      if (err) {
        return device.emit('error', err);
      }

      // select the portal interface
      di = device.interface = target.interface(0);

      // if the kernel driver is active for the interface, release
      if (di.isKernelDriverActive()) {
        di.detachKernelDriver();

        // flag that we need to reattach the kernel driver
        reattach = true;
      }

      // claim the interface (um, horizon)
      try {
        di.claim();
      }
      catch (e) {
        return device.error(e);
      }

      console.log(di);

      device.open = true;
      device.emit('open');
    });
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

    if (! device.open) {
      return device.once('open', function() {
        device.read(callback);
      });
    }

    console.log('need to read from device', device.target);
  };

  if (typeof opts == 'string' || (opts instanceof String)) {
    devices = [ opts.split(':') ]
  }
  else if (Array.isArray(opts)) {
    devices = opts;
  }

  // look for the target device
  target = device.target = usb.getDeviceList().filter(isMatch)[0];
  device.open = false;

  if (target) {
    open();
  }

  return device;
};
