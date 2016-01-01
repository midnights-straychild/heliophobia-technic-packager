/**
 * Debug entry point because cli kills the debugger apparently.
 */

modpack = require('./app/modpack');

runMode = "cli";

modpack.createModPackFromBranch("stage");