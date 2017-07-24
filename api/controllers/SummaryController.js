/**
 * SummaryController
 *
 * @description :: Server-side logic for managing crawlprocesses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    siteSummary: function (req, res) {
        let params = req.allParams()
        if (params.url) {
            sails.log(params.url)
            SummaryService.siteSummary({ url: params.url }, (result) => {
                return res.json(result)
            })
        } else {
            res.json({ error: "Please give me some url" })
        }
    },
    full: function (req, res) {
        let params = req.allParams()
        if (params.url) {
            sails.log(params.url)
            FullSourceService.getFullSource({ url: params.url }, (result) => {
                return res.ok(result)
            })
        } else {
            res.json({ error: "Please give me some url" })
        }
    }
}
