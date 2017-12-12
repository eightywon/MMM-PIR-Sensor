'use strict';

/* Magic Mirror
 * Module: MMM-PIR-Sensor-BlankIt
 * 
 * By Scott Neitzel http://eightywon.org
 *
 * Forked from:
 * By Paul-Vincent Roll http://paulvincentroll.com
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const Gpio = require('onoff').Gpio;
const exec = require('child_process').exec;

module.exports = NodeHelper.create({
  start: function () {
    this.started = false;
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'CONFIG' && this.started == false) {
     const self = this;
     this.config = payload;

     // Setup value which represent on and off
     const valueOn = this.config.invertSensorValue ? 0 : 1;
     const valueOff = this.config.invertSensorValue ? 1 : 0;

     //Setup pins
     this.pir = new Gpio(this.config.sensorPIN, 'in', 'both');

     //Detected movement
     this.pir.watch(function(err, value) {
      if (value==valueOn) {
       clearTimeout(self.deactivateMonitorTimeout);
       self.sendSocketNotification("USER_PRESENCE",true);
      } else if (value==valueOff) {
       self.deactivateMonitorTimeout=setTimeout(function() {
        self.sendSocketNotification("USER_PRESENCE",false);
       }, self.config.powerSavingDelay*1000);
      }
     });
     this.started=true;
    }
  }
});
