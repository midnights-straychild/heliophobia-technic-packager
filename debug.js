/**
 * Debug entry point because cli kills the debugger apparently.
 */

modpack = require('./app/modpack');

runMode = "cli";

modpack.createModPackFromTag("e779e08d8ad7bc7c11a4f17b8dddee79a89d35a1", "refs/tags/1.3.0_pre");