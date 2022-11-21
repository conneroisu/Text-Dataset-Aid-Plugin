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
		await this.loadSettings();


		addIcon('PromptAid', PromptAid);
		addIcon('CompletionAid', CompletionAid);
		// This creates an icon in the left ribbon.
		
		

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'prompt-dataset-aid',
			name: 'Send prompt to dataset',
			icon: 'PromptAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//read teh last line of the dataset file using vault
				const lastLine = this.app.vault.adapter.read(this.settings.datasetFile, -1);
				//Convert the last line to a string
				const lastLineString = lastLine.toString();
				//if there is no content in the last line
				if (lastLineString.includes("prompt")) {
					new Notice("Dataset file already has a prompt, a completion is needed for the the prompt: " + lastLineString);
				}else{

				//get the selected text
				const selectedText = editor.getSelection();
				//add quotes around the selected text with /" and prefix and suffix
				const quotedText = this.settings.promptPrefix + "\"" + selectedText + "\"" + this.settings.promptSuffix;
				//append the quoted text to the dataset file with vault
				this.app.vault.adapter.append(this.settings.datasetFile, quotedText);

				new Notice('Selection sent as Prompt to dataset');
				}

			}
		});
		this.addCommand({
			id: 'completion-dataset-aid',
			name: 'Send completion to dataset',
			icon: 'CompletionAid',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//get the selected text
				const selectedText = editor.getSelection();
				//read the last line of the dataset file
				const lastLine = this.app.vault.adapter.read(this.settings.datasetFile, -1);

				//Convert lastLine to string
				const lastLineString = lastLine.toString();
				

				//if the last line does not contain a prompt
				if (!lastLineString.includes("prompt")) {
					//create a open ended completion with an empty prompt
					const quotedText = this.settings.promptPrefix + "\"" + "\"" + this.settings.promptSuffix + this.settings.completionPrefix + "\"" + selectedText + "\"" + this.settings.completionSuffix;
					//add a new line to the end of the quoted text
					const quotedTextWithNewLine = quotedText + "\n";
					//append the quoted text to the dataset file with vault
					this.app.vault.adapter.append(this.settings.datasetFile, quotedTextWithNewLine);

					new Notice('Selection sent as Open Ended Completion to dataset');
				}else{
				//add quotes around the selected text with /" and prefix and suffix
				const quotedText = this.settings.completionPrefix + "\"" + selectedText + "\"" + this.settings.completionSuffix;
				// add new line to the end of the quoted text
				const quotedTextWithNewLine = quotedText + "\n";
				//append the quoted text to the dataset file with vault
				this.app.vault.adapter.append(this.settings.datasetFile, quotedTextWithNewLine);
				
				new Notice('Selection sent as Completion to dataset');
				}
			}
			});


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
