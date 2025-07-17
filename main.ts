import {ItemView, Notice, Plugin, TFile, WorkspaceLeaf} from "obsidian";
import {extractFrontmatter} from "fey-script";

const VIEW_TYPE = "my-custom-view";

function openFullscreen(elem: HTMLElement) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if ((elem as any).webkitRequestFullscreen) {
		(elem as any).webkitRequestFullscreen();
	} else if ((elem as any).msRequestFullscreen) {
		(elem as any).msRequestFullscreen();
	}
}

class MyCustomView extends ItemView {
	file: TFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		this.contentEl.addEventListener('wheel', (e) => {
			this.scrollPosition = this.contentEl.scrollTop;
			console.log('Saving:', this.scrollPosition);
		});
	}

	getViewType() {
		return VIEW_TYPE;
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

export default class LivePreviewPlugin extends Plugin {
	private activeFile;

	async onload() {
		this.registerView(VIEW_TYPE, leaf => new MyCustomView(leaf));

		// When the active file changes, update preview (if it exists)
		this.registerEvent(this.app.workspace.on("file-open", (file) => {
			const textExtensions = ["md", "txt", "csv", "json", "yaml", "xml"];

			if (file instanceof TFile && !textExtensions.includes(file.extension)) {
				return;
			}
			this.activeFile = this.app.workspace.getActiveFile();
			const leaf = this.getExistingPreviewLeaf();
			if (leaf) {
				(leaf.view as MyCustomView).setFile(file);
			}
		}));

		// Optional: update view when saved
		this.registerEvent(this.app.vault.on("modify", (file) => {
			const leaf = this.getExistingPreviewLeaf();
			if (leaf && (leaf.view as MyCustomView).file === file) {
				(leaf.view as MyCustomView).render();
			}
		}));

		this.addRibbonIcon('dice', 'Fey-Script', async () => {
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.setViewState({ type: VIEW_TYPE, active: false });
			this.app.workspace.revealLeaf(leaf);
			const view = leaf.view;
			if (view instanceof MyCustomView) {
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
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

	getExistingPreviewLeaf(): WorkspaceLeaf | null {
		return this.app.workspace.getLeavesOfType(VIEW_TYPE)[0] || null;
	}
}
