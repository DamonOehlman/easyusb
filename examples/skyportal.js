var easyusb = require('..');
var devices = [
  [ 0x1430, 0x1f17 ],
  [ 0x1430, 0x0150 ]
];

easyusb(devices)
  .read(0x20, function(err, data) {
    if (err) {
      return console.error(err);
    }

    console.log('read data: ', data);
  });
