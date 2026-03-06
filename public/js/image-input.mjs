import { View } from "@webhandle/backbone-view"
import { FileSelectDialog } from '@webhandle/tree-file-browser'

let fileSink
try {
	let mod = await import("@webhandle/site-editor-bridge")
	fileSink = mod.siteEditorBridge.resourceTypes.files
}
catch(e) {
	// well... This may keep it from working, but it doesn't need this if the sink
	// is passed with the constructor
}

let defaults = {
	className: 'webhandle-file-input'
}

class ImageInput extends View {
	constructor(options) {
		super(Object.assign({}, defaults, options))
		
		if(!this.sink) {
			this.sink = fileSink
		}
	}
	
	frame = starterFrame
	
	preinitialize(options) {
		this.events = Object.assign({}, {
			'click .image-holder': 'chooseImage'
			, 'click .remove': 'removeImage'
			, 'click .browse': 'chooseImage'
		}, options.events)
		options.events = this.events
	}
	
	removeImage(evt, target) {
		this.input.value = ''
		this.el.querySelector('.image-holder').innerHTML = ''
		this.updateClasses()
	}
	
	getDirectoryStorageKey() {
		return '@webhandle/image-input/remembered-directory/' + this.rememberDirectorySet
	}

	async chooseImage(evt, target) {
		evt.preventDefault()
		evt.stopPropagation()
		let properties = {
			sink: this.sink
			, imagesOnly: this.imagesOnly
		}
		let dir
		if(this.startingDirectory) {
			dir = this.startingDirectory
		}
		else if(this.rememberDirectorySet) {
			dir = window.localStorage.getItem(this.getDirectoryStorageKey())
		}

		if(dir) {
			while(dir.startsWith('/')) {
				dir = dir.substring(1)
			}
			properties.startingDirectory = dir
		}

		let dialog = new FileSelectDialog(properties)
		let selection = await dialog.open()
		if(selection && selection.url) {
			this.setInputValue(selection.url)
			if(this.rememberDirectorySet) {
				let parts = selection.url.split('/')
				parts.pop()
				let lastChosenDirectory = parts.join('/')
				window.localStorage.setItem(this.getDirectoryStorageKey(), lastChosenDirectory)
			}
		}
		this.addPicture()
		this.updateClasses()
	}
	
	setInputValue(url) {
		this.input.value = url
	}
	
	render() {
		this.el.innerHTML = this.frame
		this.addPicture()
		this.updateClasses()
	}
	
	addPicture() {
		if(this.input.value) {
			this.el.querySelector('.image-holder').innerHTML = 
			`<img src="${this.input.value}" alt="Click to change." />`
		}
	}
	
	updateClasses() {
		if(this.input.value) {
			this.el.classList.remove('empty')
		}
		else {
			this.el.classList.add('empty')
		}
	}
}

class FileInput extends ImageInput {
	frame = fileStarterFrame
	addPicture() {
		if(this.input.value) {
			this.el.querySelector('.image-holder').innerHTML = 
			`<a target="_blank" href="${this.input.value}" >${this.input.value}</a>`
		}
	}
	preinitialize(options) {
		this.events = Object.assign({}, {
			'click .image-holder a': 'linkClick'
			, 'click .image-holder': 'chooseImage'
			, 'click .remove': 'removeImage'
			, 'click .browse': 'chooseImage'
		}, options.events)
		options.events = this.events
	}
	linkClick(evt) {
		evt.stopPropagation()
	}
	setInputValue(url) {
		let marker = '#format=webp2x'
		if(url.includes(marker)) {
			let parts = url.split(marker)
			url = parts[0]
		}
		super.setInputValue(url)
	}
}

let starterFrame = 
`
<div class="frame">
	<div class="image-holder">
	
	</div>
	<div class="info">
	
	</div>
	<div class="controls">
		<button class="material-icons browse">
			photo_library
		</button>	
		<button class="material-icons remove">
			remove_circle_outline
		</button>
	</div>
</div>
`

let fileStarterFrame = 
`
<div class="frame">
	<div class="image-holder">
	
	</div>
	<div class="info">
	
	</div>
	<div class="controls">
		<button class="material-icons browse">
			library_books
		</button>	
		<button class="material-icons remove">
			remove_circle_outline
		</button>
	</div>
</div>
`

let imageProcessedAttribute = 'data-webhandle-input-image-processed'
let fileProcessedAttribute = 'data-webhandle-input-file-processed'
let dirAttribute = 'data-starting-directory'

function createImageInputs() {
	let inputs = document.querySelectorAll('input[data-view-component="@webhandle/image-input"]')
	for(let input of inputs) {
		let dir = input.getAttribute(dirAttribute)
		let processed = input.getAttribute(imageProcessedAttribute)
		if(processed) {
			continue
		}

		let img = new ImageInput({
			input: input
			, imagesOnly: true
			, startingDirectory: dir
			, rememberDirectorySet: 'imageInput'
		})

		img.render()
		
		img.appendTo(input.parentElement)
		input.setAttribute(imageProcessedAttribute, 'true')
		input.type = 'hidden'
	}

}

function createFileInputs() {
	let inputs = document.querySelectorAll('input[data-view-component="@webhandle/file-input"]')
	for(let input of inputs) {
		let dir = input.getAttribute(dirAttribute)
		let processed = input.getAttribute(fileProcessedAttribute)
		if(processed) {
			continue
		}

		let file = new FileInput({
			input: input
			, startingDirectory: dir
			, rememberDirectorySet: 'fileInput'
		})

		file.render()
		
		file.appendTo(input.parentElement)
		input.setAttribute(fileProcessedAttribute, 'true')
		input.type = 'hidden'
	}

}

export { createImageInputs, createFileInputs, ImageInput, FileInput }
