var debug = require('debug')('easyusb');
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

  ## Example Usage

  The following example will demonstrate interfacing with a PS3 guitar hero
  controller.  This example demonstrates how to connect to a device with a
  specific `vendor:product` device string:

  __NOTE:__  Interfacing with the guitar hero controller is proving difficult
  and if you are trying to achieve this for anything, then I'd recommend
  checking out the [pull-hid](https://github.com/DamonOehlman/pull-hid) as
  a much more robust alternative.

  <<< examples/gh-controller.js

  The next example shows how the
  [skyportal](https://github.com/DamonOehlman/skyportal) can be simplified
  using the `easyusb` module.  In this example, we look for any of the matching
  vendor / product combinations that we know a portal might have:

  <<< examples/skyportal.js

  ## Reference

  ### easyusb(opts) => EventEmtiter

  Create a patched `EventEmitter` that will provide the ability to interact with
  a usb device matching the specified criteria specified in `opts`.  Devices can
  be specified either specifying `opts.devices`, or passing through an array of
  vendor / product pairs or a single vendor:product device string.

**/
module.exports = function(opts) {
  var devices = (opts || {}).devices || [];
  var device = new EventEmitter();
  var reattach = false;
  var target;
  var input;
  var output;

  function isMatch(data) {
    var a = readDescriptor(data);
    return devices.filter(function(b) {
      return b[0] == a[0] && b[1] == a[1];
    }).length > 0;
  }

  function open() {
    try {
      debug('attempting to open device');
      target.open();
    }
    catch (e) {
      debug('captured error opening device: ', e);
      return device.emit('error', e);
    }

    // reset the device and then open the interface
    debug('resetting device');
    target.reset(function(err) {
      var di;

      if (err) {
        return device.emit('error', err);
      }

      debug('device interfaces: ' + target.interfaces.map(function(iface) {
        return '#' + iface.id;
      }));

      // select the portal interface
      debug('selecting device interface');
      di = device.interface = target.interface((opts || {}).interface || 0);

      // if the kernel driver is active for the interface, release
      if (di.isKernelDriverActive()) {
        debug('detaching kernel driver');
        di.detachKernelDriver();

        // flag that we need to reattach the kernel driver
        reattach = true;
      }

      // claim the interface (um, horizon)
      try {
        debug('claiming interface');
        di.claim();
      }
      catch (e) {
        debug('error claiming interface: ', e);
        return device.emit('error', e);
      }

      // find the input endpoint
      input = device.input = di.endpoints.filter(function(iface) {
        return iface.direction == 'in';
      })[0];

      // find the output endpoint
      output = device.output = di.endpoints.filter(function(iface) {
        return iface.direction == 'out';
      })[0];

      debug('device successfully opened');
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

  /**
    ### device.close(callback)

    Attempt to close the device interface.
  **/
  device.close = function(callback) {
    // ensure we have a callback
    callback = callback || function() {};

    if (! device.interface) {
      return callback(new Error('not connected'));
    }

    debug('releasing interface');
    device.interface.release(function(err) {
      if (err) {
        return callback(err);
      }

      // release the input and output endpoints
      input = device.input = undefined;
      output = device.output = undefined;

      if (reattach) {
        debug('reattaching kernel driver');
        device.interface.attachKernelDriver();
        reattach = false;
      }

      // release the device reference
      device.interface = undefined;
      device.open = false;

      debug('closing device');
      device.close();
      callback();
    });
  };

  /**
    ### device.read(size, callback)

    Attempt to read `size` bytes from the input endpoint of the connected
    usb device.

  **/
  device.read = function(size, callback) {
    // if size is a function, then remap args
    if (typeof size == 'function') {
      callback = size;
      size = 0;
    }

    if (! target) {
      return callback(new Error('could not find device'));
    }

    if (! device.open) {
      return device.once('open', function() {
        device.read(size, callback);
      });
    }

    // if we have no input endpoint, then report unable to read
    if (! input) {
      return callback(new Error('no input endpoint - cannot read from device'));
    }

    if (! size) {
      size = input.descriptor.wMaxPacketSize;
    }

    debug('attempting to read ' + size + ' bytes from the input endpoint');
    input.transfer(size, callback);
  };

  /**
    ### device.write(data, callback)

    Write the specified `data` to the device.

  **/
  device.write = function(data, callback) {
    if (! target) {
      return callback(new Error('could not find device'));
    }

    if (! device.open) {
      return device.once('open', function() {
        device.write(data, callback);
      });
    }

    if (! Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    // send the data
    debug('--> ', data.length, data);
    output.transfer(data, callback);
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
