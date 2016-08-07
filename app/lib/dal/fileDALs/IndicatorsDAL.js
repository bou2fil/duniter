/**
 * Created by cgeek on 22/08/15.
 */

const co = require('co');

module.exports = IndicatorsDAL;

function IndicatorsDAL(rootPath, qioFS, parentCore, localDAL, AbstractStorage) {

  "use strict";

  const that = this;

  AbstractStorage.call(this, rootPath, qioFS, parentCore, localDAL);

  this.init = () => {
    return co(function *() {
      yield [
        that.coreFS.makeTree('indicators/'),
        that.coreFS.makeTree('indicators/issuers')
      ];
    });
  };

  this.writeCurrentExcluding = (excluding) => that.coreFS.writeJSON('indicators/excludingMS.json', excluding);

  this.writeCurrentRevocating = (revocating) => that.coreFS.writeJSON('indicators/revocatingMS.json', revocating);

  this.writeCurrentExcludingForCert = (excluding) => that.coreFS.writeJSON('indicators/excludingCRT.json', excluding);
  
  this.writeCurrentExcludingForIdty = (excluding) => that.coreFS.writeJSON('indicators/excludingIDTY.json', excluding);

  this.getCurrentMembershipExcludingBlock = () => that.coreFS.readJSON('indicators/excludingMS.json');

  this.getCurrentMembershipRevocatingBlock = () => that.coreFS.readJSON('indicators/revocatingMS.json');

  this.getCurrentCertificationExcludingBlock = () => that.coreFS.readJSON('indicators/excludingCRT.json');

  this.getCurrentIdentityExcludingBlock = () => that.coreFS.readJSON('indicators/excludingIDTY.json');
}
