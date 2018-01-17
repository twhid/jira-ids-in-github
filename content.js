const request = { method: "getLocalStorage", key: "jira" };
const jiraTicketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

function reverse(str) {
    return str.split('').reverse().join('');
}

// wtf is this? See:
// Improved JIRA ID Regex (JavaScript):
// https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier
function getMatches(str) {
    if (str) {
        str = reverse(str);
        let matches = str.match(jiraTicketRegex);
        if (matches) {
            return matches.map(v => reverse(v)).reverse();
        }
    }
    return null;
}

function getLinks(str, mapFn) {
    const matches = getMatches(str);
    if (matches) {
        return matches.map(mapFn);
    } else {
        return [];
    }
};

// map IDs=>linked IDs
function mapIdsToLinks({ jiraUrl, cssText }) {
    return function (id) {
        const link = document.createElement("a");
        link.style.cssText = cssText;
        link.innerText = id;
        link.href = jiraUrl + id;
        link.setAttribute('target', '_blank');
        return [id, link];
    }
}

function renderTitle({ title, mapFn }) {
    const matchesLinks = getLinks(title.innerText, mapFn);
    if (matchesLinks.length) {
        title.innerHTML = matchesLinks.reduce((html, arr) => {
            // replace occurrences of jira IDs with links to Jira
            return html.replace(arr[0], arr[1].outerHTML);
        }, title.innerText);
    }
}

function renderCommitMsg({ commit, mapFn }) {
    const matchesLinks = getLinks(commit.innerText, mapFn);
    if (matchesLinks.length) {
        matchesLinks.forEach(arr => {
            let anchor = [...commit.children].filter(child => child.nodeName === "A");
            if (anchor.length) {
                anchor = anchor[0];
                anchor.innerText = anchor.innerText.replace(arr[0], '');
                commit.insertBefore(arr[1], anchor);
            }
        });
    }
}

chrome.extension.sendRequest(request, function (res) {
    const jiraUrl = `${res.data}/browse/`;
    const cssText = "color:#00f; text-decoration: underline;"; // perhaps configurable one day
    const mapFn = mapIdsToLinks({ jiraUrl, cssText });

    const runFn = (function run() {
        // PR titles
        const title = document.getElementsByClassName("js-issue-title").item(0);
        if (title) {
            renderTitle({ title, mapFn });
        }

        // commit messages
        const commits = [...document.getElementsByClassName("commit-title")];
        if (commits) {
            commits.forEach(commit => {
                renderCommitMsg({ commit, mapFn });
            });
        }
        return run;
    })(); // immediately invoke to run on page load

    // re-run when the DOM changes
    const observer = new MutationObserver(runFn);
    observer.observe(
        document.getElementById("js-repo-pjax-container"),
        { childList: true }
    );
});
