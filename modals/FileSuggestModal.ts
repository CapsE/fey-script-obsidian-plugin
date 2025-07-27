import {App, SuggestModal, TFile} from "obsidian";

export class FileSuggestModal extends SuggestModal<TFile> {
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
