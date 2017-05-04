/**
 * Full Source Service
 *
 * @description :: Service logic for managing crawlprocesses
 */
let Crawler = require("crawler")
let url = require('url')

module.exports = {

    getFullSource: function (options, done) {
        let crawler = new Crawler({
            userAgent: "oscarCrawler",
            retries: 0,
            retryTimeout: 10000,
            skipDuplicates: false,
            priorityRange: 10,
            callback: function (error, res, callbackDone) {
                try {
                    if (error) {
                        done(error);
                        return;
                    }
                    var $ = res.$
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
                    sails.log(ex)
                    done("Server Error")
                }
                callbackDone()
            }
        })

        crawler.queue({
            uri: options.url,
            priority: 5
        })
    }
}