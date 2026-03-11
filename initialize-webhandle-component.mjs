import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"
import setupBackboneView from "@webhandle/backbone-view/initialize-webhandle-component.mjs"
import treeFileBrowserSetup from "@webhandle/tree-file-browser/initialize-webhandle-component.mjs"
import setupMaterialIcons from "@webhandle/material-icons/initialize-webhandle-component.mjs"

let initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/image-input'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	publicFilesPrefix: "/@webhandle/image-input/files"
	, provideResources: false
}


initializeWebhandleComponent.setup = async function (webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config

	await setupBackboneView(webhandle)
	let treeFileBrowserManager = await treeFileBrowserSetup(webhandle)
	let managerMaterialIcons = await setupMaterialIcons(webhandle)
	// let stylesManager = await stylesSetup(webhandle)
	
	webhandle.routers.preDynamic.use((req, res, next) => {
		if(config.provideResources || (req.agentInfo && req.agentInfo.browser === 'firefox')) {
			// At present, firefox won't let us use multiple importmaps, so if we think
			// we might need this, let's provide it in the beginning.
			manager.addExternalResources(res.locals.externalResourceManager)
		}
		
		next()
	})
	
	manager.addExternalResources = (externalResourceManager, options) => {
		managerMaterialIcons.addExternalResources(externalResourceManager)
		treeFileBrowserManager.addExternalResources(externalResourceManager)
		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: config.publicFilesPrefix + '/css/image-input.css'
		})

		externalResourceManager.provideResource({
			url: config.publicFilesPrefix + '/js/image-input.mjs'
			, mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: '@webhandle/image-input'
		})
	}
	
	function getExternalResourceManager(data) {
		if(!data) {
			return
		}
		if(data.includeResource) {
			return data
		}
		if(data.externalResourceManager) {
			return data.externalResourceManager
		}
		return data

	}



	webhandle.addTemplate('@webhandle/image-input/addExternalResources', (data) => {
		let externalResourceManager = getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
	})

	webhandle.addTemplate('@webhandle/image-input/createInputs', (data) => {
		try {
			let externalResourceManager = getExternalResourceManager(data)
			manager.addExternalResources(externalResourceManager)

			let resources = externalResourceManager.render()
			let result = `
	<script type="module">
			import { createImageInputs, createFileInputs } from "@webhandle/image-input"
			createImageInputs()
			createFileInputs()
	</script>`

			return resources + result
		}
		catch(e) {
			console.error(e)
		}
	})
	

	// Allow access to the component and style code
	let filePath = path.join(initializeWebhandleComponent.componentDir, "public")

	manager.staticPaths.push(
		webhandle.addStaticDir(
			filePath,
			{
				urlPrefix: config.publicFilesPrefix
				, fixedSetOfFiles: true
			}
		)
	)


	return manager
}

export default initializeWebhandleComponent
