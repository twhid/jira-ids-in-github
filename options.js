
document.addEventListener("DOMContentLoaded", () => {
    const ids = ['jiraUrl', 'save', 'status'];
    const [input, save, status] = ids.map(s => document.getElementById(s));

    if (localStorage["jira"]) {
        input.value = localStorage["jira"];
    }

    save.addEventListener('click', () => {
        localStorage["jira"] = input.value;
        status.style.visibility = "visible";
        setTimeout(() => {
            status.style.visibility = "hidden";
        }, 3000);
    });
});