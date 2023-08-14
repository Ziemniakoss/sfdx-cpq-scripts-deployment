import { SfdxCommand, flags } from "@salesforce/command";
import { Messages } from "@salesforce/core";
import { promises } from "fs";
import { join } from "path";
import { CPQ_SCRIPTS_FOLDER_NAME, ScriptConfig } from "../../utils";

Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages("sfdx-cpq-scripts-deployment", "deploy");

interface CustomScript {
	Id: string | null;
	SBQQ__Code__c;
	SBQQ__ConsumptionRateFields__c;
	SBQQ__ConsumptionScheduleFields__c;
	SBQQ__QuoteFields__c;
	SBQQ__QuoteLineFields__c;
	SBQQ__GroupFields__c;
	Name;
}

export default class Deploy extends SfdxCommand {
	public static description = messages.getMessage("description");
	protected static requiresUsername = true;
	protected static flagsConfig = {
		all: flags.boolean({
			description: messages.getMessage("flag:all"),
			char: "a",
		}),
		scripts: flags.string({
			description: messages.getMessage("flag:scripts"),
			char: "s",
			required: true,
		}),
	};
	protected static requiresProject = true;

	public async run(): Promise<unknown> {
		const scriptNames: string[] = this.flags.scripts
			.split(",")
			.map((scriptName) => scriptName.trim());
		this.ux.startSpinner(
			"Deploying CPQ scripts",
			"fetching existing CPQ scripts"
		);
		const scriptNameToId = await this.getExistingScriptsIds(scriptNames);
		const customScripts = await Promise.all(
			scriptNames.map((scriptName) =>
				this.prepareCustomScriptSobject(
					scriptName,
					scriptNameToId.get(scriptName)
				)
			)
		);
		const scriptsToUpdate = customScripts.filter(
			(script) => script.Id != null
		);
		const dmlPromises = [];
		if (scriptsToUpdate.length > 0) {
			const updatePromise = this.org
				.getConnection()
				.sobject("SBQQ__CustomScript__c")
				.update(scriptsToUpdate, { allOrNone: true });
			dmlPromises.push(updatePromise);
		}

		const scriptsToInsert = customScripts.filter(
			(script) => script.Id == null
		);
		if (scriptsToInsert.length > 0) {
			const insertPromise = this.org
				.getConnection()
				.sobject("SBQQ__CustomScript__c")
				.insert(scriptsToInsert);
			dmlPromises.push(insertPromise);
		}
		this.ux.setSpinnerStatus("Upserting records");
		return Promise.all(dmlPromises);
	}

	private async prepareCustomScriptSobject(
		scriptName: string,
		id?: string
	): Promise<CustomScript> {
		const result = await Promise.all([
			this.readScriptConfig(scriptName),
			this.readScriptContent(scriptName),
		]);
		const [scriptConfig, content] = result;
		return {
			Name: scriptName,
			Id: id,
			SBQQ__Code__c: content,
			SBQQ__ConsumptionRateFields__c:
				scriptConfig.consumptionRateFields?.join("\n"),
			SBQQ__ConsumptionScheduleFields__c:
				scriptConfig.consumptionScheduleFields?.join("\n"),
			SBQQ__GroupFields__c: scriptConfig.quoteLineGroupFields?.join("\n"),
			SBQQ__QuoteFields__c: scriptConfig.quoteFields?.join("\n"),
			SBQQ__QuoteLineFields__c: scriptConfig.quoteLineFields?.join("\n"),
		};
	}

	private async readScriptContent(scriptName: string): Promise<string> {
		const path = join(
			this.project.getPath(),
			CPQ_SCRIPTS_FOLDER_NAME,
			scriptName,
			"index.js"
		);
		return promises.readFile(path, "utf-8");
	}

	private async readScriptConfig(scriptName: string): Promise<ScriptConfig> {
		const path = join(
			this.project.getPath(),
			CPQ_SCRIPTS_FOLDER_NAME,
			scriptName,
			"package.json"
		);
		return promises
			.readFile(path, "utf-8")
			.then((content) => {
				console.log(content);
				return JSON.parse(content);
			})
			.then((packageJson) => packageJson.cpqScriptConfig);
	}

	private async getExistingScriptsIds(
		scriptNames: string[]
	): Promise<Map<string, string>> {
		const scriptNameToId = new Map();
		return this.org
			.getConnection()
			.sobject("SBQQ__CustomScript__c")
			.find({ Name: { $in: scriptNames } }, { Id: 1, Name: 1 })
			.then((scripts) => {
				for (const script of scripts) {
					// @ts-ignore field Name is not typed
					scriptNameToId.set(script.Name, script.Id);
				}
				return scriptNameToId;
			});
	}
}
