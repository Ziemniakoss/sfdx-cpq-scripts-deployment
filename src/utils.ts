import { sep } from "path";
import { existsSync } from "fs";

const SFDX_PROJECT_DEFINITION_FILE = "sfdx-project.json";

export function getRootSfdxProjectDir(startDir = process.cwd()): string {
	const checkedDirAsArr = startDir.split(sep);
	while (checkedDirAsArr.length > 0) {
		const currCheckedDir = checkedDirAsArr.join(sep);
		const fullFileName =
			currCheckedDir + sep + SFDX_PROJECT_DEFINITION_FILE;
		if (existsSync(fullFileName)) {
			return currCheckedDir;
		}
		checkedDirAsArr.pop();
	}
	throw new Error("Couldn't find root file of sfdx project");
}
