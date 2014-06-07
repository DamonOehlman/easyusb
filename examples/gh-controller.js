var easyusb = require('..');
var device = easyusb('0x12ba:0x0100');


device.read(64, function(err, data) {
  if (err) {
    console.error(err);
    return device.close();
  }

  console.log('read data: ', data);
  device.close();
});
