var easyusb = require('..');
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
