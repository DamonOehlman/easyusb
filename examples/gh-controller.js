var easyusb = require('..');

easyusb('0x12ba:0x0100')
  .read(function(err, data) {
    console.log('read data: ', data);
  });
