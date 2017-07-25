/**
 * Summary
 *
 * @description :: Service logic for managing crawlprocesses
 */
let Crawler = require("crawler")
let url = require('url')
var moment = require('moment');
request = require('request').defaults({ maxRedirects: Infinity })
require('events').EventEmitter.prototype._maxListeners = Infinity;

//require('events').EventEmitter.prototype.setMaxListeners(0)

module.exports = {

    siteSummary: function (options, done) {

        let crawler = new Crawler({
            userAgent: "oscarCrawler",
            retries: 0,
            retryTimeout: 10000,
            timeout: 120000,
            skipDuplicates: false,
            priorityRange: 10,
            secondRequest: false,
            callback: function (error, res, callbackDone) {
                try {
                    if (error) {
                        if (error.code)
                            done({ error: error.code })
                        else
                            done({ error: error })
                        return;
                    }
                    let contentType = res.headers["content-type"]
                    console.log(contentType)
                    if (contentType.substring(contentType.indexOf("/") + 1, contentType.length).indexOf("html") != -1) {
                        var $ = res.$
                        let images = []
                        const currentUrl = url.parse(res.options.uri)
                        let text = SummaryService.siteSummaryText({ $: $, url: currentUrl.hostname })

                        let principalImage = (text.images) ? text.images[0] : (images) ? images[0] : undefined

                        if (principalImage && principalImage.indexOf("http") == -1) {
                            principalImage = url.resolve(res.options.uri, principalImage)
                        }

                        FullSourceService.getFullSource({ url: options.url, res: res }, (result) => {
                            let summaryResponse = {
                                datePublished: text.time,//fix that
                                lead_image_url: principalImage,
                                url: res.options.uri,//currentUrl.href,
                                source: currentUrl.hostname,
                                next_page_url: null,
                                rendered_pages: 1,
                                rendered_pages: 1,
                                total_pages: 1,
                                title: text.title,
                                author: text.author,
                                snippet: text.resume,
                                content: result,
                                keywords: text.keywords,
                                word_count: text.all.length//TODO:fix that shit
                            }
                            if (!SPAAnalysisService.isResumenSpaPage(summaryResponse) || res.options.secondRequest) {
                                done(summaryResponse)
                            } else {
                                let lastBaseUrl = (options.url.indexOf("?") != -1) ? (options.url + "&_escaped_fragment_=") : (options.url + "?_escaped_fragment_=")
                                crawler.queue({
                                    uri: lastBaseUrl,
                                    priority: 5,
                                    jar: true,
                                    secondRequest: true
                                })
                            }
                        })
                    } else {
                        //file
                        done({ error: "We are working in file Summary..." })
                    }


                } catch (ex) {
                    sails.log(ex)
                    done({ error: "Time out response" })
                }
                callbackDone()
            }
        })
        //adding prerender ?_escaped_fragment_=
        let baseUrl = options.url//(options.url.indexOf("?") != -1) ? (options.url + "&_escaped_fragment_=") : (options.url + "?_escaped_fragment_=")
        crawler.queue({
            uri: baseUrl,
            priority: 5,
            jar: true
        })
    },
    siteSummaryText: function (options, done) {
        let $ = options.$
        let textSection = {}
        let textSummary = {}
        //title
        textSection.metaTitle = SummaryService.sectionMeta({ $: $, section: "title" })
        textSection.title = SummaryService.sectionSummaryText({ $: $, section: "title" })
        textSection.h1 = SummaryService.sectionSummaryText({ $: $, section: "h1" })
        textSection.h2 = SummaryService.sectionSummaryText({ $: $, section: "h2" })
        textSection.h3 = SummaryService.sectionSummaryText({ $: $, section: "h3" })
        textSection.h4 = SummaryService.sectionSummaryText({ $: $, section: "h4" })
        //image               
        textSection.metaImage = SummaryService.sectionMeta({ $: $, section: "image" })
        textSection.contentImage = SummaryService.sectionImage({ $: $, section: "[id*='content'] img , [id*='main'] img", uri: options.url })
        textSection.contentClassImage = SummaryService.sectionImage({ $: $, section: "[class*='content'] img , [class*='main'] img", uri: options.url })
        textSection.allImage = SummaryService.sectionImage({ $: $, section: "img", uri: options.url })

        //date
        textSection.time = SummaryService.sectionTime({ $: $, section: "time" })
        textSection.date = SummaryService.sectionSummaryText({ $: $, section: "date" })
        textSection.allDate = SummaryService.sectionSummaryText({ $: $, section: '[class*="date"]' })

        //author
        textSection.metaAuthor = SummaryService.sectionMeta({ $: $, section: "author" })
        textSection.author = SummaryService.sectionSummaryText({ $: $, section: '[class*="author"]' })
        // description
        textSection.metaDescription = SummaryService.sectionMeta({ $: $, section: "description" })
        textSection.summary = SummaryService.sectionSummaryText({ $: $, section: "summary" })
        textSection.blockquote = SummaryService.sectionSummaryText({ $: $, section: "blockquote" })
        textSection.article = SummaryService.sectionSummaryText({ $: $, section: "article" })
        textSection.content = SummaryService.sectionSummaryText({ $: $, section: '[class*="content"]' })
        textSection.p = SummaryService.sectionSummaryText({ $: $, section: "p" })
        textSection.all = SummaryService.sectionSummaryText({ $: $, section: "*" })

        textSummary.time = SummaryService.format((textSection.time.length > 0) ? textSection.time[0] :
            (textSection.date.length > 0) ? textSection.date[0] :
                (textSection.allDate.length > 0) ? textSection.allDate[0] : "")

        textSummary.author = (textSection.metaAuthor.length > 0) ? textSection.metaAuthor[0] :
            (textSection.author[0]) ? textSection.author[0].substring(0, 50) :
                options.url

        textSummary.title = (textSection.metaTitle.length > 0) ? textSection.metaTitle[0] :
            (textSection.title.length > 0) ? textSection.title[0] :
                (textSection.h1.length > 0) ? textSection.h1[0] :
                    (textSection.h2.length > 0) ? textSection.h2[0] :
                        (textSection.h3.length > 0) ? textSection.h3[0] :
                            (textSection.h4.length > 0) ? textSection.h4[0] : ""

        textSummary.resume = (textSection.metaDescription.length > 0) ? textSection.metaDescription[0] :
            SummaryService.biggerText(
                textSection.article.concat(
                    textSection.p/*.concat(
                    textSection.summary.concat(
                        textSection.blockquote.concat(
                            textSection.content
                        )
                    )
                )*/
                )
            )

        textSummary.all = textSection.all

        textSummary.keywords = SummaryService.sectionMeta({ $: $, section: "keywords" })

        textSummary.images = (textSection.metaImage.length != 0) ? textSection.metaImage :
            (textSection.contentImage.length != 0) ? textSection.contentImage :
                (textSection.contentClassImage.length != 0) ? textSection.contentClassImage :
                    (textSection.allImage.length != 0) ? textSection.allImage : undefined

        setTimeout(() => {
            console.log("=======================================")
            console.log(textSection.metaImage, "====", textSection.contentImage, "=====", textSection.contentClassImage, "=====", textSection.allImage)
            console.log("=======================================")
        }, 1000)

        return textSummary
    },
    sectionSummaryText: function (options, done) {
        let $ = options.$
        let textSumary = []
        /*if (options.section == '[class*="author"]')
            sails.log(options.section, " ", $(options.section)[0].remove("script").html())*/

        if ($(options.section).text() != "") {
            $(options.section).each((index, e) => {
                $(e).find('script').empty()
                let text = $(e).remove("script").text().trim()
                    .replace(new RegExp("\n", "g"), "")
                    .replace(new RegExp("\t", "g"), "")
                    .replace(new RegExp("  ", "g"), " ")
                if (text != "")
                    textSumary.push(text)
            })
        }
        return textSumary
    },
    sectionImage: function (options, done) {
        let $ = options.$
        let textSumary = []
        let ImageSize = 140
        $(options.section).each((index, e) => {

            if (options.uri && e.attribs.src) {
                console.log("IMG: ", url.resolve(options.uri, e.attribs.src))
                console.log("result: ", e.attribs.src.indexOf("favicon"))
                if (e.attribs.src.indexOf("favicon") == -1) {
                    console.log("IMG: ", url.resolve(options.uri, e.attribs.src))
                    if (e.attribs.width && e.attribs.height) {
                        setTimeout(() => {
                            console.log("=======================================")
                            console.log(e.attribs.width, "====", e.attribs.height)
                            console.log("=======================================")
                        }, 1000)
                        if ((+e.attribs.width) > ImageSize && (+e.attribs.height) > ImageSize) {
                            textSumary.push(url.resolve(options.uri, e.attribs.src))
                        }
                    } else if (e.attribs.width) {
                        if ((+e.attribs.width) > ImageSize) {
                            textSumary.push(url.resolve(options.uri, e.attribs.src))
                        }
                    } else if (e.attribs.height) {
                        if ((+e.attribs.height) > ImageSize) {
                            textSumary.push(url.resolve(options.uri, e.attribs.src))
                        }
                    } else {
                        textSumary.push(url.resolve(options.uri, e.attribs.src))
                    }
                }

            }
        })
        return textSumary
    },
    sectionTime: function (options, done) {
        let $ = options.$
        let textSumary = []
        let time = $("time").text()
        if (time != "") {
            $("time").each((index, e) => {
                if (e.attribs.datetime) {
                    textSumary.push(e.attribs.datetime)
                    sails.log("time: ", e.attribs.datetime)
                } else {
                    let text = $(e).text().trim()
                        .replace(new RegExp("\n", "g"), "")
                        .replace(new RegExp("\t", "g"), "")
                        .replace(new RegExp("  ", "g"), " ")
                    if (text != "") {
                        textSumary.push(text)
                        sails.log("time: ", text)
                    }
                }
            })
        }
        return textSumary
    },
    sectionMeta: function (options, done) {
        let $ = options.$
        let textSumary = []
        $("meta").each((index, e) => {
            if (e.attribs.content != "") {
                if (e.attribs.name && options.section.toLowerCase() == e.attribs.name.toLowerCase()) {
                    textSumary.push(e.attribs.content)
                } else if (e.attribs.name && e.attribs.name.toLowerCase().indexOf(options.section.toLowerCase()) != -1) {
                    textSumary.push(e.attribs.content)
                } else if (e.attribs.property && e.attribs.property.toLowerCase().indexOf(options.section.toLowerCase()) != -1) {
                    textSumary.push(e.attribs.content)
                } else if (e.attribs.itemprop && e.attribs.itemprop.toLowerCase().indexOf(options.section.toLowerCase()) != -1) {
                    textSumary.push(e.attribs.content)
                }
            }
        })
        return textSumary
    },
    biggerText: function (array = []) {
        if (array.length > 0)
            return array.sort((e1, e2) => {
                return e2.length - e1.length
            })[0].substring(0, 150) + " ..."
        else
            return ""
    },
    format: function (time = null) {
        try {
            if (moment(time).isValid()) {
                return moment(time).format("MM-DD-YYYY")
            } else {
                return undefined
            }
        } catch (error) {
            //sails.log(error)
        }

    }
}