// Map of event to the subchunk it belongs to
var eventToSubchunkMap = {};

// Sorted list of events in current file
var sortedEvents;

function renderAnalyticsTab() {
    analytics();
}

function clearAnalytics() {
    analytics();
}

function getEventIdInSubchunk(eventStr, subchunkName) {
    return "(" + subchunkName + ") " + getEventName(eventStr);
}

function analytics() {
    let analyticsSubchunk = document.getElementById(htmlIdAnalyticsNumSubchunks);
    let analyticsLine = document.getElementById(htmlIdAnalyticsNumLines);
    let analyticsTags = document.getElementById(htmlIdAnalyticsNumTags);
    let analyticsEvents = document.getElementById(htmlIdAnalyticsNumEvents);

    analyticsSubchunk.innerHTML = "";
    analyticsLine.innerHTML = "";
    analyticsTags.innerHTML = "";
    analyticsEvents.innerHTML = "";

    eventToSubchunkMap = {};

    subchunkAnalyticsTable = {};

    if (!jsonObj?.SubChunks) {
        updateAnalyticsTables();
        return;
    }
    let numSubChunks = jsonObj.SubChunks.length;

    let numLines = 0;
    let tags = new Set();
    let allEventsSet = new Set();

    // Populate cached analytics
    jsonObj.SubChunks.forEach(subchunk => {
        numLines += subchunk.Lines.length;
        let subchunkName = subchunk.Name;
        subchunkAnalyticsTable[subchunkName] = {};
        let eventsInSubchunkSet = new Set();
        let linesInSubchunk = 0;
        subchunk.Lines.forEach(line => {
            linesInSubchunk++;
            let eventName = line['Evt'];

            // Split out event index and add to event lines map
            let tokens = eventName.split(":");
            let shortEventName = tokens[0].toLowerCase(); // Topic name
            let eventSubTag = tokens.length > 0 ? tokens[1] : ""; // Sequence index, if any
            let longEventName = combineEventAndSubchunkName(shortEventName, subchunkName);
            eventsInSubchunkSet.add(longEventName);

            if (!subchunkAnalyticsTable[subchunkName][longEventName]) {
                subchunkAnalyticsTable[subchunkName][longEventName] = {};
                subchunkAnalyticsTable[subchunkName][longEventName]["numLines"] = 0;
            }

            if (!subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag]) {
                subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag] = new Array();
                subchunkAnalyticsTable[subchunkName][longEventName]["eventName"] = shortEventName;
            }

            subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag].push(line);
            subchunkAnalyticsTable[subchunkName][longEventName]["numLines"]++;


            allEventsSet.add(longEventName);
            eventToSubchunkMap[longEventName] = subchunkName;

            // Get all tags invoked in the speaker/target columns
            let spkrTags = getTagsFromCsv(line['Spkr']);
            let trgtTags = getTagsFromCsv(line['Trgt']);

            spkrTags.forEach(tag => {
                let sanitized = tag.toLowerCase();
                tags.add(sanitized);
            });
            trgtTags.forEach(tag => {
                let sanitized = tag.toLowerCase();
                tags.add(sanitized)
            });

            subchunkAnalyticsTable[subchunkName][longEventName]["numTags"] = tags.size;
        });
        subchunkAnalyticsTable[subchunkName].numTopics = eventsInSubchunkSet.size;
        subchunkAnalyticsTable[subchunkName].numLines = linesInSubchunk;
    });

    analyticsSubchunk.innerHTML = numSubChunks;
    analyticsLine.innerHTML = numLines;
    analyticsTags.innerHTML = tags.size;
    analyticsEvents.innerHTML = allEventsSet.size;

    sortedEvents = new Array();

    sortedEvents = Array.from(allEventsSet);

    updateAnalyticsTables();
}

function combineEventAndSubchunkName(event, subchunk) {
    return `${subchunk} - ${event}`;
}

function updateAnalyticsTables() {
    let subchunkTable = document.getElementById(htmlIdAnalyticsSubchunkTable);
    let topicTable = document.getElementById(htmlIdAnalyticsTopicTable);
    subchunkTable.innerHTML = "";
    topicTable.innerHTML = "";

    if (!jsonObj?.SubChunks) {
        return;
    }

    for (let i = 0; i < jsonObj.SubChunks.length; i++) {
        let subchunk = jsonObj.SubChunks[i];
        let row = document.createElement("tr");

        let indexCell = document.createElement("td");
        let subchunkNameCell = document.createElement("td");
        subchunkNameCell.setAttribute("class", "mdl-data-table__cell--non-numeric");
        let numTopicsCell = document.createElement("td");
        let numLinesCell = document.createElement("td");

        indexCell.innerHTML = i;
        subchunkNameCell.innerHTML = subchunk.Name;
        numTopicsCell.innerHTML = subchunkAnalyticsTable[subchunk.Name].numTopics;
        numLinesCell.innerHTML = subchunkAnalyticsTable[subchunk.Name].numLines;

        row.appendChild(indexCell);
        row.appendChild(subchunkNameCell);
        row.appendChild(numTopicsCell);
        row.appendChild(numLinesCell);

        subchunkTable.appendChild(row);
    };

    for (let i = 0; i < sortedEvents.length; i++) {
        let event = sortedEvents[i];
        let subchunk = eventToSubchunkMap[event];
        let row = document.createElement("tr");

        let indexCell = document.createElement("td");
        let topicNameCell = document.createElement("td");
        topicNameCell.setAttribute("class", "mdl-data-table__cell--non-numeric");
        let subchunkNameCell = document.createElement("td");
        subchunkNameCell.setAttribute("class", "mdl-data-table__cell--non-numeric");
        let numSeqCell = document.createElement("td");
        let numLinesCell = document.createElement("td");
        let numTagsCell = document.createElement("td");

        indexCell.innerHTML = i;
        topicNameCell.innerHTML = subchunkAnalyticsTable[subchunk][event].eventName;
        subchunkNameCell.innerHTML = eventToSubchunkMap[event];
        // Subtract two keys because we store the number of lines and number of tags as keys
        numSeqCell.innerHTML = Object.keys(subchunkAnalyticsTable[subchunk][event]).length - 3;
        numLinesCell.innerHTML = subchunkAnalyticsTable[subchunk][event].numLines;
        numTagsCell.innerHTML = subchunkAnalyticsTable[subchunk][event].numTags;

        row.appendChild(indexCell);
        row.appendChild(subchunkNameCell);
        row.appendChild(topicNameCell);
        row.appendChild(numSeqCell);
        row.appendChild(numLinesCell);
        row.appendChild(numTagsCell);
        topicTable.appendChild(row);
    }
}

