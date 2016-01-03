/**
 * Debug entry point because cli kills the debugger apparently.
 */

modpack = require('./app/modpack');

runMode = "cli";

//modpack.createModPackFromBranch("master");
//modpack.createModPackFromBranch("stage");
modpack.createModPackFromTag("1.3.0_pre");