import { App, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import FileService from "src/filehandler/FileService";
import FileRenderer from "./src/filehandler/FileRenderer";
import { DEFAULT_TEMPLATE } from "src/util/constants";

interface MeetingNotesSettings {
	meetingNoteFolder: string;
	template: string;
	dateFormat: string;
}

const DEFAULT_SETTINGS: MeetingNotesSettings = {
	meetingNoteFolder: "MeetingNotes",
	template: DEFAULT_TEMPLATE,
	dateFormat: "DD-MMM-YYYY HH-mm-ss",
};

export default class MeetingNotes extends Plugin {
	settings: MeetingNotesSettings;
	fileHandler: FileRenderer;
	fileService: FileService;

	private registerServices() {
		this.fileHandler = new FileRenderer(
			this.app.vault,
			this.app.fileManager
		);
		this.fileService = new FileService(this.fileHandler);
	}

	async onload() {
		this.registerServices();
		await this.loadSettings();

		this.addSettingTab(new MeetingNotesSettingTab(this.app, this));

		this.app.vault.on("create", async (file: TFile) => {
			// on "create" callback is also triggered when folders are created, filter by checking wether the
			// new file has an extension
			if (file.extension !== undefined) {
				await this.fileService.createFileCreationCallback(
					file,
					this.settings.meetingNoteFolder,
					this.settings.template,
					this.settings.dateFormat
				);
			}
		});
		console.log("Info: Community plugin Meeting notes loaded.");
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MeetingNotesSettingTab extends PluginSettingTab {
	plugin: MeetingNotes;

	constructor(app: App, plugin: MeetingNotes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Meeting Notes Settings" });

		new Setting(containerEl)
			.setName("Meeting Notes Folder Name")
			.setDesc("Folder which will contain the generated notes")
			.addText((text) =>
				text
					.setPlaceholder("Enter your meeting folder name")
					.setValue(this.plugin.settings.meetingNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.meetingNoteFolder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Template")
			.setDesc(
				"Use the default template or define your own. Hint: {{Date}} will be resolved to the current date"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(DEFAULT_TEMPLATE)
					.setValue(this.plugin.settings.template)
					.onChange(async (value) => {
						this.plugin.settings.template = value;
						await this.plugin.saveSettings();
					})
					.then((text) => {
						text.inputEl.style.width = "100%";
						text.inputEl.rows = 10;
					})
			);

		new Setting(containerEl)
			.setName("Date Format")
			.setDesc(
				"Format for the meeting note filename (uses moment.js format). Default: DD-MMM-YYYY HH-mm-ss"
			)
			.addText((text) =>
				text
					.setPlaceholder("DD-MMM-YYYY HH-mm-ss")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
