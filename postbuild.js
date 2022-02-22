const { join } = require("path");
const {
	existsSync,
	readSync,
	statSync,
	mkdirSync,
	readdirSync,
	copyFileSync,
} = require("fs");

//https://stackoverflow.com/a/22185855
function copyRecursive(src, dest) {
	const exists = existsSync(src);
	const stats = exists && statSync(src);
	const isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
		mkdirSync(dest);
		readdirSync(src).forEach(function (childItemName) {
			copyRecursive(join(src, childItemName), join(dest, childItemName));
		});
	} else {
		copyFileSync(src, dest);
	}
}

copyRecursive(
	join("src", "commands", "cpq-scripts", "generate-resources"),
	join("lib", "commands", "cpq-scripts", "generate-resources")
);
