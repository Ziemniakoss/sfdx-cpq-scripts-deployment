import { sep } from "path";
import { existsSync, promises } from "fs";
import { SfdxCommand } from "@salesforce/command";
import { getRootSfdxProjectDir } from "../../utils";

interface ScriptConfig {
	scriptName: string;
	quoteFields: string[];
	quoteLineGroupFields: string[];
	quoteLineFields: string[];
	consumptionScheduleFields: string[];
	consumptionRateFields: string[];
}

export default class Org extends SfdxCommand {
	public async run(): Promise<unknown> {
		console.log(this.config);
		console.log("dirname", __dirname);
		const scriptName = await this.ux.prompt("Script name:", {
			required: true,
		});
		const quoteFields = await this.askForNeededFields("Quote fields");
		const quoteLineGroupFields = await this.askForNeededFields(
			"Quote line group fields"
		);
		const quoteLineFields = await this.askForNeededFields(
			"Quote line fields"
		);
		const consumptionScheduleFields = await this.askForNeededFields(
			"Consumpption schedule fields"
		);
		const consumptionRateFields = await this.askForNeededFields(
			"Consumption Rates fields"
		);
		const scriptConfig = {
			scriptName,
			quoteFields,
			quoteLineGroupFields,
			quoteLineFields,
			consumptionScheduleFields,
			consumptionRateFields,
		};
		const path = await this.generateFilesForScript(scriptConfig);
		return { ...scriptConfig, path };
	}

	private async generateFilesForScript(config: ScriptConfig) {
		this.ux.startSpinner("Generating custom script files");
		const rootProjectDir = getRootSfdxProjectDir();
		const cpqScriptsFolder = rootProjectDir + sep + "customCpqScripts";
		if (!existsSync(cpqScriptsFolder)) {
			await promises.mkdir(cpqScriptsFolder);
		}
		const scriptRootDir = cpqScriptsFolder + sep + config.scriptName;
		await promises.mkdir(scriptRootDir);

		await Promise.all([
			this.generateExampleScript(scriptRootDir),
			this.generateScriptPackageJson(scriptRootDir, config),
			this.generateExampleTypingsScript(scriptRootDir),
		]);

		this.ux.stopSpinner();
	}

	private getResourcePath(name: string): string {
		return __dirname + sep + "generate-resources" + sep + name;
	}
	private async generateExampleScript(dir: string): Promise<unknown> {
		const fileName = dir + sep + "index.js";
		const sourceFile = this.getResourcePath("example-script.js");
		return promises.copyFile(sourceFile, fileName);
	}

	private async generateExampleTypingsScript(dir: string): Promise<unknown> {
		const fileName = dir + sep + "index.d.ts";
		const sourceFile = this.getResourcePath("example-script.d.ts");
		return promises.copyFile(sourceFile, fileName);
	}

	private async generateScriptPackageJson(
		dir: string,
		config: ScriptConfig
	): Promise<unknown> {
		const examplePackageJsonPath = this.getResourcePath("package.json");
		const packageJson = await promises
			.readFile(examplePackageJsonPath, "utf-8")
			.then((packageJsonAsString) => JSON.parse(packageJsonAsString))
			.then((packageJson) => {
				packageJson.cpqScriptConfig = {
					quoteLineFields: config.quoteLineFields,
					quoteFields: config.quoteFields,
					quoteLineGroupFields: config.quoteLineGroupFields,
					consumptionScheduleFields: config.consumptionScheduleFields,
					consumptionRateFields: config.consumptionRateFields,
				};
				return packageJson;
			});

		const fileName = dir + sep + "package.json";
		return promises.writeFile(
			fileName,
			JSON.stringify(packageJson, null, 4)
		);
	}

	private async askForNeededFields(promptName: string): Promise<string[]> {
		return this.ux
			.prompt(promptName, { required: false })
			.then((response) => {
				if (response == null) {
					return [];
				}
				return response
					.split(",")
					.map((dirtyField) => dirtyField.trim());
			});
	}
}
