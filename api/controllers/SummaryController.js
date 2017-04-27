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
            res.json("Please give me some url")
        }
    }
}
