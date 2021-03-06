
import './lib/polyfills'
import './lib/mixins'

import ready from 'domready'
import router from 'page'
import dom from 'dom'
import domify from 'domify'

import home from './routes/home'
// import register from './routes/register'


ready(() => {

	const mainSelector = '[data-main]'
	const page = dom('.page')
	const main = dom(mainSelector)
	const nav = dom('.nav')

	router('*', transition)
	router('/', home)
	router('/schedule', home)
	router.start()

	function transition (ctx, next) {
		if (ctx.init) {
			console.log('setting prev to', ctx.path)
			router.prev = ctx
			next()
			return
		}

		if (isSamePath(ctx.path, router.prev.path)) {
			next()
			return
		}

		// TODO: scroll to schedule if already on homepage

		page.addClass('page-transition')

		fetch(ctx.path)
			.then(res => res.text())
			.then(handleResponse)
			.then(_ => next())
			.then(_ => router.prev = ctx)
			.catch(err => {
				console.error(err)
				// Fallback to just changing the page
				// window.location.pathname = ctx.path
			})

		function handleResponse (res) {
			const html = dom(domify(res))
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const prevId = dom('meta[property="page:id"]').attr('content')
					const id = html.find('meta[property="page:id"]').attr('content')
					// Switch page meta (title, meta id)
					document.title = html.find('title').text()
					dom('meta[property="page:id"]').attr('content', id)
					// Switch page class
					page.removeClass(`page-${prevId}`)
					page.addClass(`page-${id}`)
					// Switch navigation class
					nav.find('.active').removeClass('active')
					nav.find(`[data-id="${id}"]`).addClass('active')
					// Swap out page content
					const content = html.find(mainSelector)
					main.html(content.html())
					window.scrollTo(0, 0)
					page.removeClass('page-transition')
					// Pass along control
					resolve()
				}, 300)
			})
		}
	}

})


function isSamePath (curr, prev) {
	if (curr === prev) return true
	if (curr === '/' && prev === '/schedule/') return true
	if (curr === '/schedule/' && prev === '/') return true
	return false
}
