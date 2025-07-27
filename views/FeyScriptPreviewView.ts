import {ItemView, TFile, WorkspaceLeaf} from "obsidian";
import {extractFrontmatter} from 'fey-script';

function openFullscreen(elem: HTMLElement) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if ((elem as any).webkitRequestFullscreen) {
		(elem as any).webkitRequestFullscreen();
	} else if ((elem as any).msRequestFullscreen) {
		(elem as any).msRequestFullscreen();
	}
}

export const FEY_SCRIPT_VIEW = "fey-script-view";

export class FeyScriptPreviewView extends ItemView {
	file: TFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		this.contentEl.addEventListener('wheel', (e) => {
			this.scrollPosition = this.contentEl.scrollTop;
			console.log('Saving:', this.scrollPosition);
		});
	}

	getViewType() {
		return FEY_SCRIPT_VIEW;
	}

	getDisplayText() {
		return "Live Preview";
	}

	async onOpen() {
		await this.render();
	}

	prepareFeyScriptCode(code, title) {
		code = code.replaceAll(/\!\[\[([\s\S]+?)\]\]/g, (match, fileName) => {
			const [url, params] = fileName.split('?');
			const file = this.app.metadataCache.getFirstLinkpathDest(url, "");

			if (file) {
				const src = this.app.vault.getResourcePath(file);
				return `\n![](${src}&${params})\n`
			}

			return '';
		});
		const frontMatter = /^\n*---\n([\s\S]*?)\n---/g.exec(code);
		code = code.replaceAll(/^\n*---\n([\s\S]*?)\n---/g, '')
		return `${frontMatter || ''}# ${title}\n ${code}`;
	}

	async setFile(file: TFile | null) {
		this.file = file;
		await this.render();
	}

	async render() {
		this.contentEl.empty();
		if (!this.file) return;

		try {
			let content = await this.app.vault.read(this.file);
			const title = this.file.basename;
			const {frontMatterData, cleanMDX} = extractFrontmatter(content);
			content = this.prepareFeyScriptCode(cleanMDX, title);
			const viewer = document.createElement('fey-viewer');
			viewer.setData(frontMatterData);
			viewer.resolveImports = async (path) => {
				const file = this.app.metadataCache.getFirstLinkpathDest(path, "");
				if (file instanceof TFile) {
					const content = await this.app.vault.read(file);
					return this.prepareFeyScriptCode(content, file.basename)
				}
				return null;
			}
			viewer.innerHTML = content;
			this.contentEl.appendChild(viewer);
			this.contentEl.addEventListener("dblclick", (event) => {
				const target = event.target as HTMLElement;

				if (target.tagName === "IMG") {
					const img = target as HTMLImageElement;
					openFullscreen(img);
				}
			});

			setTimeout(() => {
				console.log('Scrolling to:', this.scrollPosition);
				this.contentEl.scroll(0, this.scrollPosition);
				viewer.classList.add('done');
			}, 200);
		} catch (err) {
			console.error("Error rendering preview:", err);
		}
	}
}
