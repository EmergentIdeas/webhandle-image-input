import setup from "../initialize-webhandle-component.mjs"

export default async function startServer(webhandle) {
	webhandle.development = true	
	webhandle.routers.preStatic.use((req, res, next) => {
		req.user = {
			name: "administrator"
			, groups: ["administrators"]
		}
		
		next()
	})
	webhandle.routers.primary.get('/@something', (req, res, next) => {
		res.end('@something')
	})
	webhandle.routers.primary.get('/some thing', (req, res, next) => {
		res.end('@some thing')
	})
	setup(webhandle)
}