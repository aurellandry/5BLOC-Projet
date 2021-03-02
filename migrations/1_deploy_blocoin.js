const Blocoin = artifacts.require("BloCoin");

module.exports = function (deployer) {
  deployer.deploy(Blocoin);
};
