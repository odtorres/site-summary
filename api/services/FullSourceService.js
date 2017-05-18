/**
 * Full Source Service
 *
 * @description :: Service logic for managing crawlprocesses
 */
let Crawler = require("crawler")
let url = require('url')

module.exports = {

    getFullSource: function (options, done) {
        try {            
            let res = options.res
            let $ = res.$
            let images = []
            const currentUrl = url.parse(res.options.uri)
            $("a").each((index, e) => {
                if (res.options.uri && e.attribs.href) {
                    let goodUrl = url.resolve(res.options.uri, e.attribs.href)
                    e.attribs.href = goodUrl
                    e.attribs.target = "_blank"
                }
            })
            $("link").each((index, e) => {
                if (res.options.uri && e.attribs.href) {
                    let goodUrl = url.resolve(res.options.uri, e.attribs.href)
                    e.attribs.href = goodUrl
                }
            })
            $("img").each((index, e) => {
                if (res.options.uri && e.attribs.src) {
                    let goodUrl = url.resolve(res.options.uri, e.attribs.src)
                    e.attribs.src = goodUrl
                }
            })
            $("iframe").each((index, e) => {
                if (res.options.uri && e.attribs.src) {
                    let goodUrl = url.resolve(res.options.uri, e.attribs.src)
                    e.attribs.src = goodUrl
                }
            })
            $("script").each((index, e) => {
                if (res.options.uri && e.attribs.src) {
                    let goodUrl = url.resolve(res.options.uri, e.attribs.src)
                    if (e.attribs.src)
                        e.attribs.src = goodUrl
                }
            })
            done($.html())
            // $.html() -- aca todo el html 
            // res.body -- aca esta todo el html
            /* $("img").each((index, e) => {
                 if (res.options.uri && e.attribs.src) {
                     images.push(url.resolve(res.options.uri, e.attribs.src))
                 }
             })*/


        } catch (ex) {
            sails.log("Exception Full source:", ex)
            done("Server Error")
        }

    }
}