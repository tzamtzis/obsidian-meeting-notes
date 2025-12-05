import moment from "moment";
import { FileManager, TFile, Vault } from "obsidian";
import path from "path";

export default class FileRenderer {
	vault: Vault;
	fileManager: FileManager;

	constructor(vault: Vault, fileManager: FileManager) {
		this.vault = vault;
		this.fileManager = fileManager;
	}

	/**
	 * Renames a given File to the specified date format
	 *
	 * @param file File to rename
	 * @param dateFormat Date format string (moment.js format)
	 */
	async ChangeFileName(file: TFile, dateFormat: string) {
		const dateName = moment(Date()).format(dateFormat);
		const dirname = path.dirname(file.path);
		const newPath = path.join(dirname, `${dateName}.${file.extension}`);

		await this.fileManager.renameFile(file, newPath);
	}

	async FillNewNote(file: TFile, template: string) {
		const todayDate = new Date().toLocaleDateString().toString();
		const content = template.replaceAll("{{Date}}", todayDate);

		try {
			await this.vault.modify(file, content);
		} catch (error) {
			console.error(`Error modifying file (path="${file.path})"`);
			throw error;
		}
	}
}
