var request = {method: "getLocalStorage", key: "jira"};

chrome.extension.sendRequest(request, function(response) {
    //
    // selectors
    // ---------------------------------------------------------------------
    var PR_TITLE = '.js-issue-title';
    var COMMIT_MESSAGE = '.commit-message code .message';
    // ---------------------------------------------------------------------
    //

    var title = $(PR_TITLE);
    var commits = $(COMMIT_MESSAGE);
    var jiraUrl = response.data + '/browse/';
    var styles = 'color:#00f; text-decoration: underline;';
    var pattern = new RegExp("([a-zA-Z][a-zA-Z0-9_]+-[1-9][0-9]*)([^.]|\.[^0-9]|\.$|$)", 'ig');
    var insert = ' <a style="' + styles + '" target="_blank" href="' + jiraUrl + '%s">%s</a> ';
    var titleMatch = pattern.exec(title.text());

    if (titleMatch && titleMatch[1]) {
        title.html(title.text().replace(pattern, insert.replace(/%s/g, titleMatch[1])));
    }

    commits.each( function() {
        var match = pattern.exec($(this).attr('title'));

        if (match && match[1]) {
            // remove ticket #
            $(this).html($(this).text().replace(match[1], ''));
            // replace it w a link
            $(insert.replace(/%s/g, match[1]) + '&nbsp;').insertBefore(this);
        }

    });
});
