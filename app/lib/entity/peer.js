"use strict";
let Q = require('q');
let _ = require('underscore');
let vucoin = require('vucoin');
let rawer = require('../ucp/rawer');

module.exports = Peer;

let DEFAULT_HOST = 'localhost';
let BMA_REGEXP = /^BASIC_MERKLED_API( ([a-z_][a-z0-9-_.]*))?( ([0-9.]+))?( ([0-9a-f:]+))?( ([0-9]+))$/;

function Peer(json) {

  this.documentType = 'peer';

  _(json).keys().forEach((key) => {
   this[key] = json[key];
  });

  this.endpoints = this.endpoints || [];
  this.statusTS = this.statusTS || 0;

  this.keyID = () => this.pubkey && this.pubkey.length > 10 ? this.pubkey.substring(0, 10) : "Unknown";

  this.copyValues = (to) => {
    ["version", "currency", "pub", "endpoints", "hash", "status", "statusTS", "block", "signature"].forEach((key)=> {
      to[key] = this[key];
    });
  };

  this.copyValuesFrom = (from) => {
    ["version", "currency", "pub", "endpoints", "block", "signature"].forEach((key) => {
      this[key] = from[key];
    });
  };

  this.json = () => {
    let json = {};
    ["version", "currency", "endpoints", "status", "block", "signature"].forEach((key) => {
      json[key] = this[key];
    });
    json.raw = this.getRaw();
    json.pubkey = this.pubkey;
    return json;
  };

  this.getBMA = () => {
    var bma = null;
    this.endpoints.forEach((ep) => {
      let matches = !bma && ep.match(BMA_REGEXP);
      if (matches) {
        bma = {
          "dns": matches[2] || '',
          "ipv4": matches[4] || '',
          "ipv6": matches[6] || '',
          "port": matches[8] || 9101
        };
      }
    });
    return bma || {};
  };

  this.getDns = () => {
    let bma = this.getBMA();
    return bma.dns ? bma.dns : null;
  };

  this.getIPv4 = () => {
    let bma = this.getBMA();
    return bma.ipv4 ? bma.ipv4 : null;
  };

  this.getIPv6 = () => {
    let bma = this.getBMA();
    return bma.ipv6 ? bma.ipv6 : null;
  };

  this.getPort = () => {
    var bma = this.getBMA();
    return bma.port ? bma.port : null;
  };

  this.getHostPreferDNS = () => {
    let bma = this.getBMA();
    return (bma.dns ? bma.dns :
      (bma.ipv4 ? bma.ipv4 :
        (bma.ipv6 ? bma.ipv6 : '')));
  };

  this.getHost = () => {
    let bma = this.getBMA();
    return (this.hasValid4(bma) ? bma.ipv4 :
      (bma.dns ? bma.dns :
        (bma.ipv6 ? '[' + bma.ipv6 + ']' : DEFAULT_HOST)));
  };

  this.getURL = () => {
    let bma = this.getBMA();
    let base = this.getHost();
    if(bma.port)
      base += ':' + bma.port;
    return base;
  };

  this.hasValid4 = (bma) => bma.ipv4 && !bma.ipv4.match(/^127.0/) && !bma.ipv4.match(/^192.168/) ? true : false;

  this.getNamedURL = () => this.getURL();

  this.getRaw = () => rawer.getPeerWithoutSignature(this);

  this.getRawSigned = () => rawer.getPeer(this);

  this.connect = (done) => {
    vucoin(this.getDns() || this.getIPv6() || this.getIPv4() || DEFAULT_HOST, this.getPort(), done, {
      timeout: 2000
    });
  };

  this.connectP = (timeout) => {
    return Q.Promise((resolve, reject) => {
      vucoin(this.getDns() || this.getIPv6() || this.getIPv4() || DEFAULT_HOST, this.getPort(),
          (err, node) => {
            if (err) return reject(err);
            resolve(node);
          }, {
            timeout: timeout || 2000
          });
    });
  };

  this.isReachable = () => {
    return this.getURL() ? true : false;
  };
}

Peer.statics = {};

Peer.statics.peerize = function(p) {
  return p != null ? new Peer(p) : null;
};
