import {App, Notice, Plugin, TFile, WorkspaceLeaf, SuggestModal, MarkdownView, Editor, Menu} from "obsidian";
import {FEY_SCRIPT_VIEW, FeyScriptPreviewView} from "./views/FeyScriptPreviewView";

export default class LivePreviewPlugin extends Plugin {
	private activeFile;

	async onload() {
		this.registerView(FEY_SCRIPT_VIEW, leaf => new FeyScriptPreviewView(leaf));

		// When the active file changes, update preview (if it exists)
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			const textExtensions = ["md", "txt", "csv", "json", "yaml", "xml"];

			if (file instanceof TFile && !textExtensions.includes(file.extension)) {
				return;
			}
			this.activeFile = this.app.workspace.getActiveFile();
			const leaf = this.getExistingPreviewLeaf();
			if (leaf) {
				(leaf.view as FeyScriptPreviewView).setFile(file);
			}
		}));

		// Optional: update view when saved
		this.registerEvent(this.app.vault.on("modify", (file) => {
			const leaf = this.getExistingPreviewLeaf();
			if (leaf && (leaf.view as FeyScriptPreviewView).file === file) {
				(leaf.view as FeyScriptPreviewView).render();
			}
		}));

		this.addRibbonIcon('dice', 'Fey-Script', async () => {
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.setViewState({ type: FEY_SCRIPT_VIEW, active: false });
			this.app.workspace.revealLeaf(leaf);
			const view = leaf.view;
			if (view instanceof FeyScriptPreviewView) {
				view.setFile(this.activeFile);
			} else {
				console.warn("View not ready or not MyCustomView:", view);
			}
		});

		this.addRibbonIcon('lightbulb', 'Get Inspired!', async () => {
			const words = [
				"big",
				"small",
				"fast",
				"slow",
				"happy",
				"sad",
				"hot",
				"cold",
				"old",
				"young",
				"new",
				"good",
				"bad",
				"nice",
				"mean",
				"easy",
				"hard",
				"clean",
				"dirty",
				"loud",
				"quiet",
				"bright",
				"dark",
				"strong",
				"weak",
				"enchanted",
				"mystical",
				"ancient",
				"cursed",
				"glimmering",
				"ethereal",
				"ghostly",
				"legendary",
				"magical",
				"shimmering",
				"spectral",
				"whimsical",
				"otherworldly",
				"divine",
				"fabled",
				"mythical",
				"bewitched",
				"phantasmal",
				"celestial",
				"eldritch",
				"grim",
				"gloomy",
				"shadowy",
				"sinister",
				"bleak",
				"haunting",
				"macabre",
				"ominous",
				"murky",
				"dreary",
				"forlorn",
				"dreadful",
				"eerie",
				"chilling",
				"twisted",
				"vile",
				"malevolent",
				"wicked",
				"ghostly",
				"cursed",
				"morbid",
				"ashen",
				"nocturnal",
				"hollow",
				"gruesome",
				"bright",
				"radiant",
				"shiny",
				"glowing",
				"sunny",
				"golden",
				"sparkling",
				"gleaming",
				"warm",
				"soft",
				"airy",
				"pure",
				"cheerful",
				"vibrant",
				"luminous",
				"silvery",
				"whimsical",
				"breezy",
				"gentle",
				"glimmering",
				"joyful",
				"peaceful",
				"heavenly",
				"angelic",
				"delightful",
				"kind",
				"brave",
				"clever",
				"funny",
				"friendly",
				"honest",
				"loyal",
				"shy",
				"confident",
				"curious",
				"gentle",
				"wise",
				"charming",
				"grumpy",
				"proud",
				"humble",
				"thoughtful",
				"polite",
				"generous",
				"bold",
				"calm",
				"ambitious",
				"caring",
				"moody",
				"silly",
				"rocky",
				"lush",
				"barren",
				"windswept",
				"verdant",
				"arid",
				"snowy",
				"foggy",
				"rolling",
				"mountainous",
				"flat",
				"forested",
				"marshy",
				"grassy",
				"rugged",
				"serene",
				"tropical",
				"desolate",
				"picturesque",
				"fertile",
				"misty",
				"coastal",
				"volcanic",
				"craggy",
				"frozen"
			];
			const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

			new Notice(`${randomElement(words)}, ${randomElement(words)}, ${randomElement(words)}`, 10000);
		});

		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor, view: MarkdownView) => {
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				const match = line.substring(0, cursor.ch).match(/\[\[>\s?([^\]]*)$/);

				if (match) {
					const query = match[1];
					new FileSuggestModal(this.app, query, (selectedPath) => {
						const from = {
							line: cursor.line,
							ch: cursor.ch - match[0].length,
						};
						const nextText = editor.getRange(cursor, { line: cursor.line, ch: cursor.ch + 2 });
						const endsWithClosing = nextText === ']]';

						const to = endsWithClosing
							? { line: cursor.line, ch: cursor.ch + 2 }
							: cursor;
						editor.replaceRange(`[[> ${selectedPath}]]`, from, to);
					}).open();
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file: TFile, source: string) => {
				menu.addItem((item) => {
					item.setTitle('Create Special Note');
					item.setIcon('document');
					item.onClick(async () => {
						const folder = file.parent;
						if(!folder) return;
						const name = "new-file.yml.md";
						const path = folder.path + "/" + name;

						if (!this.app.vault.getAbstractFileByPath(path)) {
							await this.app.vault.create(path, "key: value\nanother: thing");
							new Notice(`Created ${name}`);
						} else {
							new Notice(`${name} already exists`);
						}
					});
				});
			})
		);
	}



	onunload() {
		this.app.workspace.detachLeavesOfType(FEY_SCRIPT_VIEW);
	}

	getExistingPreviewLeaf(): WorkspaceLeaf | null {
		return this.app.workspace.getLeavesOfType(FEY_SCRIPT_VIEW)[0] || null;
	}
}

class FileSuggestModal extends SuggestModal<TFile> {
	private files: TFile[];
	private onChoose: (path: string) => void;
	private query: string;

	constructor(app: App, query: string, onChoose: (path: string) => void) {
		super(app);
		this.files = app.vault.getMarkdownFiles();
		this.onChoose = onChoose;
		this.query = query;
	}

	getSuggestions(query: string): TFile[] {
		const q = this.query.toLowerCase();
		return this.files.filter((file) => file.path.toLowerCase().includes(q));
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		el.setText(file.path);
	}

	onChooseSuggestion(file: TFile) {
		this.onChoose(file.path);
	}
}
