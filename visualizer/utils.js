const defaultFilename = "text.json";

// Local storage keys //

// Header
const localStorageJsonObjKey = "jsonObj";
const localStorageFilenameKey = "filename";
const localStorageActiveTabKey = "activeTab";

// Editor tab
const localStorageTableSubchunkIndexKey = "subchunkIndex";

// Viz tab
const localStorageVizSubchunkIndexKey = "vizSubchunkIndex";
const localStorageVizTopicIndexKey = "vizTopicIndex";

// HTML ids //

// Header
const htmlIdTabImport = "tab-import";
const htmlIdPanelImport = "import-panel";
const htmlIdTabAnalytics = "tab-analytics";
const htmlIdPanelAnalytics = "analytics-panel";
const htmlIdTabViz = "tab-viz";
const htmlIdPanelViz = "viz-panel";
const htmlIdFilename = "title-filename";

// Editor tab
const htmlIdTextAreaInput = "textarea";
const htmlIdTextAreaWrapperInput = "textareawrapper";
const htmlIdSubchunkSelector = "subchunkSelector";
const htmlIdTableName = "jsonName";
const htmlIdTableLocInfo = "locInfo";
const htmlIdTableHeader = "headerrow";
const htmlIdTableBody = "datatablebody";

// Analytics tab
const htmlIdAnalyticsNumSubchunks = "analytics-num-subchunks";
const htmlIdAnalyticsNumLines = "analytics-num-lines";
const htmlIdAnalyticsNumTags = "analytics-num-tags";
const htmlIdAnalyticsNumEvents = "analytics-num-events";
const htmlIdAnalyticsSubchunkTable = "analytics-subchunk-body";
const htmlIdAnalyticsTopicTable = "analytics-topic-body";


function renderAllTabs() {
    renderTableEditorTab();
    renderAnalyticsTab();
    renderVizTab();
}

function clearAllTabs() {
    clearTableEditorTab();
    clearAnalytics();
    clearVizTab();
}

// Gets the tag names from a comma separates list
function getTagsFromCsv(csvStr, preserveOperator = false) {
    if (!csvStr) {
        return [];
    }
    return csvStr.split(',').map(e => {
        e = e.trim();
        if (!preserveOperator && e.startsWith("-")) {
            e = e.substr(1);
        }
        return e;
    });
}

// In-place case-insensitive sort, shamelessly copied from stackoverflow
function arrCaseInsensitiveSort(arr) {
    if (arr.length <= 1) {
        return;
    }
    arr.sort(function (a, b) {
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
    });
}

// Gets event name from a colon-separated string
function getEventName(eventStr) {
    if (eventStr.includes(":")) {
        let index = eventStr.indexOf(":");
        return eventStr.substr(0, index);
    }
    return eventStr;
}