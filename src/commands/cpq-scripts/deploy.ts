import { SfdxCommand } from "@salesforce/command";

export default class Org extends SfdxCommand {
	public async run(): Promise<unknown> {
		this.ux.log("Test");
		return "done";
	}
}
