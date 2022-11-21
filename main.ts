import { addIcon, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PromptAid} from './constants';
import { CompletionAid } from './constants';

interface TextDatasetAidSettings {
	datasetFile: string;
	promptPrefix: string;
	promptSuffix: string;
	completionPrefix: string;
	completionSuffix: string;
}

const DEFAULT_SETTINGS: TextDatasetAidSettings = {
	datasetFile: 'dataset.txt',
	promptPrefix: "{\"prompt\": ",
	promptSuffix: ",",
	completionPrefix: "\"completion\": ",
	completionSuffix: "}"
}

export default class TextDatasetAid extends Plugin {
	settings: TextDatasetAidSettings;

	async onload() {
		await this.loadSettings();
		addIcon('PromptAid', PromptAid);
		addIcon('CompletionAid', CompletionAid);
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('PromptAid', 'PromptAid', (evt: MouseEvent) => {
			


		});
		const completionIconEl = this.addRibbonIcon('CompletionAid', 'CompletionAid', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');


		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'prompt-dataset-aid',
			name: 'Send prompt to dataset',
			icon: 'PromptAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//get the selected text
				const selectedText = editor.getSelection();
				//add quotes around the selected text with /" and prefix and suffix
				const quotedText = this.settings.promptPrefix + "\"" + selectedText + "\"" + this.settings.promptSuffix;
				//append the quoted text to the dataset file with vault
				this.app.vault.adapter.write(this.settings.datasetFile, quotedText);

				new Notice('Selection sent as Prompt to dataset');

			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: TextDatasetAid;

	constructor(app: App, plugin: TextDatasetAid) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Dataset File')
			.setDesc('The file containing the dataset.')
			.addText(text => text
				.setPlaceholder('dataset.txt')
				.setValue(this.plugin.settings.datasetFile)
				.onChange(async (value) => {
					this.plugin.settings.datasetFile = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Prompt Prefix')
			.setDesc('The prefix for the prompt.')
			.addText(text => text
				.setPlaceholder('{"prompt": ')
				.setValue(this.plugin.settings.promptPrefix)
				.onChange(async (value) => {
					this.plugin.settings.promptPrefix = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Prompt Suffix')
			.setDesc('The suffix for the prompt.')
			.addText(text => text
				.setPlaceholder(',')
				.setValue(this.plugin.settings.promptSuffix)
				.onChange(async (value) => {
					this.plugin.settings.promptSuffix = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Completion Prefix')
			.setDesc('The prefix for the completion.')
			.addText(text => text
				.setPlaceholder('"completion": ')
				.setValue(this.plugin.settings.completionPrefix)
				.onChange(async (value) => {
					this.plugin.settings.completionPrefix = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Completion Suffix')
			.setDesc('The suffix for the completion.')
			.addText(text => text
				.setPlaceholder('}')
				.setValue(this.plugin.settings.completionSuffix)
				.onChange(async (value) => {
					this.plugin.settings.completionSuffix = value;
					await this.plugin.saveSettings();
				}));

	
	}
}
