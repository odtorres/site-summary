/**
 * Full Source Service
 *
 * @description :: Service logic for managing crawlprocesses
 */

module.exports = {
    /**
     * @param options
     */
    isResumenSpaPage: function (options) {
        console.log(options)
        if (options.lead_image_url.indexOf("{{") != -1 &&
            options.lead_image_url.indexOf("}}") != -1) {
            return true
        }
        if (options.title.indexOf("{{") != -1 &&
            options.title.indexOf("}}") != -1) {
            return true
        }
        if (options.snippet.indexOf("{{") != -1 &&
            options.snippet.indexOf("}}") != -1) {
            return true
        }
        /*if (options.content.indexOf("{{") != -1 &&
            options.content.indexOf("}}") != -1) {
            return true
        }*/
        //options.content
        return false
    }
}