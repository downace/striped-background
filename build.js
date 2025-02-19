const shell = require("shelljs");

shell.set("-e");

shell.config.verbose = true;

shell.rm("-rf", "dist");

shell.exec("tsc -p tsconfig.cjs.json");
shell.exec("tsc -p tsconfig.esm.json");
shell.exec("tsc -p tsconfig.types.json");

shell.echo('{"type": "commonjs"}').to("dist/_cjs/package.json");
shell.echo('{"type": "module"}').to("dist/_esm/package.json");
