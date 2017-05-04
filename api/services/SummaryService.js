/**
 * Summary
 *
 * @description :: Service logic for managing crawlprocesses
 */
let Crawler = require("crawler")
let url = require('url')
var moment = require('moment');

module.exports = {

    siteSummary: function (options, done) {

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
                    let text = SummaryService.siteSummaryText({ $: $, url: currentUrl.hostname })

                    $("img").each((index, e) => {
                        if (res.options.uri && e.attribs.src) {
                            images.push(url.resolve(res.options.uri, e.attribs.src))
                        }
                    })

                    done({
                        date_published: text.time,//fix that
                        lead_image_url: images[0],
                        url: res.options.uri,//currentUrl.href,
                        next_page_url: null,
                        rendered_pages: 1,
                        rendered_pages: 1,
                        total_pages: 1,
                        title: text.title,
                        author: text.author,
                        content: text.resume,
                        word_count: text.all.length//TODO:fix that shit
                    })//images.slice(0, 4)
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
    },
    siteSummaryText: function (options, done) {
        let $ = options.$
        let textSection = {}
        let textSummary = {}
        //title
        textSection.h1 = SummaryService.sectionSummaryText({ $: $, section: "h1" })
        textSection.h2 = SummaryService.sectionSummaryText({ $: $, section: "h2" })
        textSection.h3 = SummaryService.sectionSummaryText({ $: $, section: "h3" })
        textSection.h4 = SummaryService.sectionSummaryText({ $: $, section: "h4" })

        //date
        textSection.time = SummaryService.sectionTime({ $: $, section: "time" })
        textSection.date = SummaryService.sectionSummaryText({ $: $, section: "date" })
        textSection.allDate = SummaryService.sectionSummaryText({ $: $, section: '[class*="date"]' })

        //author
        textSection.author = SummaryService.sectionSummaryText({ $: $, section: '[class*="author"]' })

        textSection.summary = SummaryService.sectionSummaryText({ $: $, section: "summary" })
        textSection.blockquote = SummaryService.sectionSummaryText({ $: $, section: "blockquote" })
        textSection.article = SummaryService.sectionSummaryText({ $: $, section: "article" })
        textSection.content = SummaryService.sectionSummaryText({ $: $, section: '[class*="content"]' })
        textSection.p = SummaryService.sectionSummaryText({ $: $, section: "p" })
        textSection.all = SummaryService.sectionSummaryText({ $: $, section: "*" })

        textSummary.time = SummaryService.format((textSection.time.length > 0) ? textSection.time[0] :
            (textSection.date.length > 0) ? textSection.date[0] :
                (textSection.allDate.length > 0) ? textSection.allDate[0] : "")

        textSummary.author = (textSection.author[0]) ? textSection.author[0].substring(0, 50) : options.url

        textSummary.title = (textSection.h1.length > 0) ? textSection.h1[0] :
            (textSection.h2.length > 0) ? textSection.h2[0] :
                (textSection.h3.length > 0) ? textSection.h3[0] :
                    (textSection.h4.length > 0) ? textSection.h4[0] : ""

        textSummary.resume = SummaryService.biggerText(
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
        /* textSummary.resume = (textSection.article.length > 0) ? textSection.article[0].substring(0, 150) :
             (textSection.content.length > 0) ? textSection.content[0].substring(0, 150) :
                 (textSection.p.length > 0) ? textSection.p[0].substring(0, 150) :
                     (textSection.summary.length > 0) ? textSection.summary[0].substring(0, 150) :
                         (textSection.blockquote.length > 0) ? textSection.blockquote[0].substring(0, 150) :
                             ""*/
        /*(textSection.div.length > 0) ? textSection.div[0].substring(0,150) : 
        (textSection.all.length > 0) ? textSection.all[0].substring(0,150) : ""*/
        //return textSection
        return textSummary
    },
    sectionSummaryText: function (options, done) {
        let $ = options.$
        let textSumary = []
        if ($(options.section).text() != "") {
            $(options.section).each((index, e) => {
                let text = $(e).text().trim()
                    .replace(new RegExp("\n", "g"), "")
                    .replace(new RegExp("\t", "g"), "")
                    .replace(new RegExp("  ", "g"), " ")
                if (text != "")
                    textSumary.push(text)
            })
        }
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
                    sails.log("time: ",e.attribs.datetime)
                } else {
                    let text = $(e).text().trim()
                        .replace(new RegExp("\n", "g"), "")
                        .replace(new RegExp("\t", "g"), "")
                        .replace(new RegExp("  ", "g"), " ")
                    if (text != ""){
                        textSumary.push(text)
                        sails.log("time: ",text)
                    }
                }
            })
        }
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
        if (moment(time).isValid()) {
            return moment(time).format("MM-DD-YYYY")
        } else {
            return undefined
        }
    }
}