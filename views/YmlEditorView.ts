import { TFile, WorkspaceLeaf, ItemView } from "obsidian";

const VIEW_TYPE_YML = "yml-md-view";

export class YmlEditorView extends ItemView {
	private file: TFile | null = null;
	private textarea: HTMLTextAreaElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.textarea = document.createElement("textarea");
		this.textarea.style.width = "100%";
		this.textarea.style.height = "100%";
		this.contentEl.appendChild(this.textarea);
	}

	getViewType(): string {
		return VIEW_TYPE_YML;
	}

	getDisplayText(): string {
		return this.file?.basename ?? "YML Editor";
	}

	async setFile(file: TFile) {
		this.file = file;
		this.textarea.value = await this.app.vault.read(file);

		this.textarea.addEventListener("blur", async () => {
			if (this.file) {
				await this.app.vault.modify(this.file, this.textarea.value);
			}
		});
	}
}
