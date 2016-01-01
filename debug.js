/**
 * Debug entry point because cli kills the debugger apparently.
 */

modpack = require('./app/modpack');

runMode = "cli";

modpack.createModPackFromTag("000bad93037b042e81fcc138846722214a42770c");