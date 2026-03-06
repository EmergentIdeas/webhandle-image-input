# @webhandle/image-input

A widget which transforms `<input>` elements into file browsers.

## Install

```sh
npm install @webhandle/image-input
```

## Configuration 
```json
{
	"@webhandle/image-input": {
		"publicFilesPrefix": "/@webhandle/image-input/files"
		, "provideResources": false
	}
}
```
`provideResources` is false by default, meaning that this component won't get added to the importmap for every
page view. It gets added by the template below. This makes the page just a little lighter. However, maybe that's
not what you want, and so can force these resources to be added. 

Additional note, Firefox as of March 2026 does not
quite yet permit multiple importmap objects (coming soon). Until then, the component detects if the browser is 
Firefox and provides the resources regardless.


## Setup

```js
import setupImageInput from "@webhandle/image-input/initialize-webhandle-component.mjs"
let managerImageInput = await setupImageInput(webhandle)
```

### Usage

The normal way to use this would be like:

```html
<label>
	Preview:
	<input data-view-component="@webhandle/image-input" type="text" name="preview" />
</label>

<label>
	Document:
	<input data-view-component="@webhandle/file-input" type="hidden" name="attachedDocument"  data-starting-directory="docs"  />
</label>

__$globals.externalResourceManager::@webhandle/image-input/createInputs__
```

This would automatically convert the inputs above to image and file browsers respectively. That template is safe to include multiple times,
although probably you shouldn't.

That usage will try to use the file sinks from the `@webhandle/site-editor-bridge` component. If that component is not be used
or is not available because the user is not an administrator, then the direct usage method is the way.


### Direct Usage

```js
import { ImageInput } from "@webhandle/image-input"
let input = document.querySelect('#my-input-el')
let img = new ImageInput({
	input: input
	, sink: remoteFileSink
	, imagesOnly: true
	, startingDirectory: 'images'
})
img.render()
img.appendTo(input.parentElement)
```