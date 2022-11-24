import { addIcon, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PromptAid} from './constants';
import { CompletionAid } from './constants';
import { readFileSync } from 'fs';

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
		await this.loadSettings();

		addIcon('PromptAid', PromptAid);
		addIcon('CompletionAid', CompletionAid);
		
		

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'prompt-dataset-aid',
			name: 'Send prompt to dataset',
			icon: 'PromptAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// Read from the dataset file in the vault
				let dataset = readFileSync(this.app.vault.adapter.getFullPath(this.settings.datasetFile), 'utf8');
				// get the last line in the dataset
				let lastLine = dataset.split("\n").pop();

				if(lastLine == "") {
					// Get the current selection 
					let selection = editor.getSelection();
					// Get the dataset file
					let datasetFile = this.settings.datasetFile;
					// Get the prompt prefix
					let promptPrefix = this.settings.promptPrefix;
					// Get the prompt suffix
					let promptSuffix = this.settings.promptSuffix;
					// Get the prompt 
					let datasetprompt = promptPrefix + "\"" + selection + "\"" + promptSuffix;
					// log the prompt to the console
					console.log("Prompt: " + datasetprompt);
					// Append the prompt to the dataset file
					this.app.vault.adapter.append(datasetFile, datasetprompt);
				}else{
					new Notice("Last line in dataset is not empty: " + lastLine);
					new Notice("Please complete the last prompt before adding a new one.");
				}
			}
		});
		this.addCommand({
			id: 'completion-dataset-aid',
			name: 'Send completion to dataset',
			icon: 'CompletionAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				// Get the prompt prefix
				let promptPrefix = this.settings.promptPrefix;
				// Get the prompt suffix
				let promptSuffix = this.settings.promptSuffix;
				// Get the completion prefix
				let completionPrefix = this.settings.completionPrefix;
				// Get the completion suffix
				let completionSuffix = this.settings.completionSuffix;
				// Get the dataset file 
				let datasetFile = this.settings.datasetFile;
				// Get the current selection
				let selection = editor.getSelection();
				
				// Read from the dataset file in the vault
				let dataset = readFileSync(this.app.vault.adapter.getFullPath(this.settings.datasetFile), 'utf8');
				// get the last line in the dataset
				let lastLine = dataset.split("\n").pop();

				if(lastLine == "") {
					//Open ended Completion
					// Get the completion
					let datasetOpenEndedCompletion = promptPrefix + "\"\"" + promptSuffix + completionPrefix + "\"" + selection + "\"" + completionSuffix;
					// log the completion to the console
					console.log("Open Ended Completion: " + datasetOpenEndedCompletion);
					// Append the completion to the dataset file with a preceding empty prompt 
					this.app.vault.adapter.append(datasetFile, datasetOpenEndedCompletion);


				}else{ 
					// Prompted Completion
					// Get the completion
					console.log("Prompted Completion: " + completionPrefix + "\"" + selection + "\"" + completionSuffix);
					// Append the completion to the dataset file
					this.app.vault.adapter.append(datasetFile, completionPrefix + "\"" + selection + "\"" + completionSuffix);
					// Append a new line to the dataset file
					this.app.vault.adapter.append(datasetFile, "\n");

				}
			}});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TextDatasetAidSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log("unloading plugin");
		// Release dataset file lock

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
