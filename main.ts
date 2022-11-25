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
	completionPrefix: " \"completion\": ",
	completionSuffix: "}"
}

export default class TextDatasetAid extends Plugin {
	settings: TextDatasetAidSettings;

	async onload() {
		console.log("loading plugin");
		await this.loadSettings();

		addIcon('PromptAid', PromptAid);
		addIcon('CompletionAid', CompletionAid);
		
		

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'prompt-dataset-aid',
			name: 'Send prompt to dataset',
			icon: 'PromptAid',
			editorCallback: async(editor: Editor, view: MarkdownView) => {

				this.app.vault.adapter.exists("PromptTrackFileConOhObsidian.txt").then((exists) => {
					new Notice("File exists check: " + exists);

					if(!exists) {
						console.log("Prompt: " + this.settings.promptPrefix + "\"" + editor.getSelection() + "\"" + this.settings.promptSuffix);
						// Append the prompt to the dataset file
						this.app.vault.adapter.append(this.settings.datasetFile, this.settings.promptPrefix + "\"" + editor.getSelection() + "\"" + this.settings.promptSuffix);
						this.app.vault.createBinary("PromptTrackFileConOhObsidian.txt", new ArrayBuffer(0));
					}else{
						new Notice("Last line in dataset is not empty. Please complete the last prompt before adding a new one" );
					}
				});
			}
		});
		this.addCommand({
			id: 'completion-dataset-aid',
			name: 'Send completion to dataset',
			icon: 'CompletionAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				this.app.vault.adapter.exists("PromptTrackFileConOhObsidian.txt").then((exists) => {

					if(!exists) {
						//Open ended Completion
						//log the completion to the console for debugging
						console.log("Open Ended Completion: " + this.settings.promptPrefix + "\"\"" + this.settings.promptSuffix + this.settings.completionPrefix + "\"" + editor.getSelection() + "\"" + this.settings.completionSuffix);
						// Append the completion to the dataset file with a preceding empty prompt 
						this.app.vault.adapter.append(this.settings.datasetFile, this.settings.promptPrefix + "\"\"" + this.settings.promptSuffix + this.settings.completionPrefix + "\"" + editor.getSelection() + "\"" + this.settings.completionSuffix);
						//delete the prompt tracking file
						this.app.vault.adapter.remove("PromptTrackFileConOhObsidian.txt");

					}else{ 
						// Prompted Completion
						// Get the completion
						console.log("Prompted Completion: " + this.settings.completionPrefix + "\"" + editor.getSelection() + "\"" + this.settings.completionSuffix);
						// Append the completion to the dataset file
						this.app.vault.adapter.append(this.settings.datasetFile, this.settings.completionPrefix + "\"" + editor.getSelection() + "\"" + this.settings.completionSuffix);
						// Append a new line to the dataset file
						this.app.vault.adapter.append(this.settings.datasetFile, "\n");
						//remove the prompt tracking file
						this.app.vault.adapter.remove("PromptTrackFileConOhObsidian.txt");

					}
				});
			}});
			


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TextDatasetAidSettingTab(this.app, this));


	}

	onunload() {
		console.log("unloading plugin");
		// unlaod dataset file
		this.unload();

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



class TextDatasetAidSettingTab extends PluginSettingTab {
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
