function renderVizTab() {
    populateVizToolbar();
    populateVizTopicToolbar();
}

function clearVizTab() {
    subchunkAnalyticsTable = undefined;
    setVizSubchunkAndTopicIndeces(0, 0);
    clearGraph();
    renderVizTab();
}

function setVizSubchunkAndTopicIndeces(subchunkIndex, topicIndex) {
    console.log(`setting viz subchunk index ${subchunkIndex}, topic index ${topicIndex}`);
    localStorage.setItem(localStorageVizSubchunkIndexKey, subchunkIndex);
    localStorage.setItem(localStorageVizTopicIndexKey, topicIndex);
}

function populateVizToolbar() {
    let vizSubchunkSelector = document.getElementById('viz-subchunk-selector');
    vizSubchunkSelector.innerHTML = "";
    if (!jsonObj?.SubChunks) {
        return;
    }

    let subchunkNames = Object.keys(subchunkAnalyticsTable);
    for (let i = 0; i < subchunkNames.length; i++) {
        let subchunkName = subchunkNames[i];
        let option = document.createElement("option");
        option.innerHTML = subchunkName;
        option.setAttribute("subchunkIndex", i);
        vizSubchunkSelector.appendChild(option);
    };

    let cachedVizSubchunkIndex = localStorage.getItem(localStorageVizSubchunkIndexKey);
    if (cachedVizSubchunkIndex) {
        let selected = subchunkNames[cachedVizSubchunkIndex];
        vizSubchunkSelector.value = selected;
    }
}

function populateVizTopicToolbar() {
    let vizSubchunkSelector = document.getElementById('viz-subchunk-selector');
    let vizTopicNavigator = document.getElementById('viz-topic-navigator');
    vizTopicNavigator.innerHTML = "";
    if (!jsonObj?.SubChunks) {
        return;
    }
    // TODO: Use the subchunkIndex attribute
    let subchunkIndex = vizSubchunkSelector.selectedIndex == -1 ? 0 : vizSubchunkSelector.selectedIndex;
    let subchunkName = Object.keys(subchunkAnalyticsTable)[subchunkIndex];
    let subchunk = subchunkAnalyticsTable[subchunkName];

    let topicNames = Object.keys(subchunk);
    for (let i = 0; i < topicNames.length; i++) {
        let topicName = topicNames[i];
        if (topicName == "numLines" || topicName == "numTopics" || topicName == "eventName") {
            break;
        }
        let topic = subchunk[topicName];
        let link = document.createElement("a");
        link.setAttribute("class", "mdl-navigation__link");
        link.setAttribute("onclick", `vizTopicListener(${subchunkIndex}, ${i})`);
        link.innerHTML = topic.eventName;
        vizTopicNavigator.appendChild(link);
    };

    let cachedVizTopicIndex = localStorage.getItem(localStorageVizTopicIndexKey);
    let topicIndex = cachedVizTopicIndex ? cachedVizTopicIndex : 0;

    vizTopicListener(subchunkIndex, topicIndex);
}

function vizTopicListener(subchunkIndex, topicIndex) {
    setVizSubchunkAndTopicIndeces(subchunkIndex, topicIndex);
    drawGraph();
}

function drawGraph() {
    let vizSubchunkIndex = localStorage.getItem(localStorageVizSubchunkIndexKey);
    let vizTopicIndex = localStorage.getItem(localStorageVizTopicIndexKey);
    if (vizSubchunkIndex && vizTopicIndex) {
        drawGraphHelper(vizSubchunkIndex, vizTopicIndex);
    }
}

function clearGraph() {
    let cy = document.getElementById('cy');
    cy.innerHTML = "";
}

function drawGraphHelper(subchunkIndex, topicIndex) {
    clearGraph();
    if (!subchunkAnalyticsTable || !subchunkIndex || subchunkIndex < 0 || !topicIndex || topicIndex < 0) {
        return;
    }
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                css: {
                    content: 'data(name)',
                    width: 1,
                    height: 1,
                    'background-opacity': '0',
                    'font-family': 'monospace',
                    'text-wrap': 'wrap',
                    'text-max-width': '500px',
                    'text-justification': 'right',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'text-background-opacity': 1,
                    'text-background-color': 'white',
                    'text-background-shape': 'rectangle',
                    'text-border-style': 'solid',
                    'text-border-opacity': 1,
                    'text-border-width': '1px',
                    'text-border-color': 'darkgray',
                    'text-margin-x': '5px',
                    'text-margin-y': '5px',
                }
            },
            {
                selector: "edge",
                css: {
                    content: 'data(name)'
                },
                style: {
                    width: 1,
                    "target-arrow-shape": "triangle",
                    "line-color": "#9dbaea",
                    "target-arrow-color": "#9dbaea",
                    "curve-style": "bezier"
                },
                css: {
                    content: 'data(name)',
                }
            }
        ],
        // initial viewport state:
        zoom: 1,
        pan: { x: 500, y: 100 },
    });

    let visitedBranches = new Set();
    let nodesToAdd = getCytoscapeGraphForTopic(subchunkIndex, topicIndex, undefined, visitedBranches);
    cy.add(nodesToAdd);

    cy.elements()
        .layout({
            name: "dagre",
            fit: false
        });

    /*cy.on('tap', 'node', function () {
        if (this.data('subchunkIndex') >= 0 && this.data('topicIndex') >= 0) {
            console.log(`redrawing graph at subchunkIndex ${this.data('subchunkIndex')} topicIndex ${this.data('topicIndex')} for node ${this.data('id')}`);
            cy.add(getCytoscapeGraphForTopic(this.data('subchunkIndex'), this.data('topicIndex'), this.data('id')));
            this.data('subchunkIndex', -1);
            this.data('topicIndex', -1);
            cy.elements()
                .layout({
                    name: "dagre",
                    fit: false
                });
        }
    });*/
}

function getCytoscapeGraphForTopic(subchunkIndex, topicIndex, rootId, visitedBranches, toReturn) {
    if (!toReturn) {
        toReturn = [];
    }
    let subchunkAnalyticsTableKeys = Object.keys(subchunkAnalyticsTable);
    let subchunkName = subchunkAnalyticsTableKeys[subchunkIndex];

    if (!subchunkAnalyticsTableKeys || !subchunkAnalyticsTable[subchunkName] || subchunkIndex < 0 || topicIndex < 0) {
        return toReturn;
    }

    let topicKeys = Object.keys(subchunkAnalyticsTable[subchunkName]);
    topicIndex = topicIndex >= topicKeys.length ? 0 : topicIndex;
    let topicName = topicKeys[topicIndex];

    let topic = subchunkAnalyticsTable[subchunkName][topicName];
    let topicNodeId = crypto.randomUUID();

    // Do not redraw the same branch if already present in this graph
    if (visitedBranches) {
        if (topic?.eventName && visitedBranches.has(topic.eventName)) {
            return toReturn;
        }
        visitedBranches.add(topic.eventName);
    }

    console.log(`drawing graph at subchunk index ${subchunkIndex} topic index ${topicIndex}`);

    let prevNodeId = topicNodeId;

    // If a root node is defined, do not draw the branch node
    if (rootId) {
        prevNodeId = rootId;
    } else {
        toReturn.push(
            { group: 'nodes', data: { id: topicNodeId, name: topic.eventName } }
        );
    }

    let prevSequenceId = prevNodeId;
    Object.keys(topic).forEach(sequenceIndex => {
        if (sequenceIndex == "numLines" || sequenceIndex == "numTags" || sequenceIndex == "eventName") {
            return;
        }
        let sequence = topic[sequenceIndex];
        if ((sequenceIndex > 1 && topic[sequenceIndex - 1] && topic[sequenceIndex - 1].length > 1) || sequence.length > 1) {
            let sequenceNodeId = crypto.randomUUID();
            let sequenceEdgeId = crypto.randomUUID();
            toReturn.push(
                { group: 'nodes', data: { id: sequenceNodeId, name: "" } },
                { group: 'edges', data: { id: sequenceEdgeId, source: prevSequenceId, target: sequenceNodeId } }
            );
            // Attach each line at this sequence index to the given sequence
            sequence.forEach(line => {
                prevNodeId = getNodeForLine(sequenceNodeId, line, toReturn, subchunkIndex, topicName, visitedBranches);
            });
            prevSequenceId = sequenceNodeId;
        } else {
            // If sequence only contains one line, skip the sequence node
            prevNodeId = getNodeForLine(prevNodeId, sequence[0], toReturn, subchunkIndex, topicName, visitedBranches);
            prevSequenceId = prevNodeId;
        }


    });
    return toReturn;
}

function getNodeForLine(sequenceNodeId, line, toReturn, subchunkIndex, topicName, visitedBranches) {
    let nodeId = crypto.randomUUID();
    let specialNodeId = crypto.randomUUID();

    let speakerTags = line["Spkr"];
    let targetTags = line["Trgt"];

    let actions = getTagsFromCsv(line["Dscr"]);
    let branch = "";
    let addSpeakerTags = "";
    let addTargetTags = "";
    let removeSpeakerTags = "";
    let removeTargetTags = "";
    let chooseResponse = "";
    let specialNode = false;
    actions.forEach(action => {
        let tokens = action.split(":");
        switch (tokens[0].toLowerCase()) {
            case "chooseresponse":
                chooseResponse = "CHOOSE RESPONSE";
                break;
            case "branch":
                branch = tokens[1];
                specialNode = true;
                break;
            case "addspeakertag":
                addSpeakerTags = tokens[1];
                break;
            case "addtargettag":
                addTargetTags = tokens[1];
                break;
            case "removespeakertag":
                removeSpeakerTags = tokens[1];
                break;
            case "removetargettag":
                removeTargetTags = tokens[1];
                break;
        }
    });

    let nodeName = `${line["Txt"]}\n\tSPKR: ${speakerTags}\n\tTRGT: ${targetTags}\n`;

    if (addSpeakerTags) {
        nodeName += `\t+SPKR: ${addSpeakerTags}\n`;
    }
    if (addTargetTags) {
        nodeName += `\t+TRGT: ${addTargetTags}\n`;
    }
    if (removeSpeakerTags) {
        nodeName += `\t-SPKR: ${removeSpeakerTags}\n`;
    }
    if (removeTargetTags) {
        nodeName += `\t-TRGT: ${removeTargetTags}\n`;
    }
    if (chooseResponse) {
        nodeName += "\tCHOOSE RESPONSE\n";
    }

    let edgeId = crypto.randomUUID();
    toReturn.push(
        {
            group: 'nodes',
            data: {
                id: nodeId,
                name: nodeName
            },
            classes: 'multiline-auto'
        },
        {
            group: 'edges',
            data:
            {
                id: edgeId,
                source: sequenceNodeId,
                target: nodeId
            }
        }
    );

    let finalNodeId = nodeId;
    let topicIndex = -1;
    if (specialNode) {
        finalNodeId = specialNodeId;
        let specialNodeName = "";
        if (branch) {
            // Locate the index of the branch to link to
            let subchunkName = Object.keys(subchunkAnalyticsTable)[subchunkIndex];
            let branchLowerCase = branch.toLowerCase();
            let topicKeys = Object.keys(subchunkAnalyticsTable[subchunkName]);
            for (let i = 0; i < topicKeys.length; i++) {
                let topicName = topicKeys[i];
                let topic = subchunkAnalyticsTable[subchunkName][topicName];
                if (topic.eventName == branchLowerCase) {
                    topicIndex = i;
                    break;
                }
            }
            specialNodeName += `${branch}\n`;
        }

        toReturn.push(
            {
                group: 'nodes',
                data: {
                    id: specialNodeId,
                    name: specialNodeName,
                    subchunkIndex: subchunkIndex,
                    topicIndex: topicIndex,

                },
                css: {
                    color: 'blue'
                },
                classes: 'multiline-auto'
            },
            {
                group: 'edges',
                data:
                {
                    id: topicName + specialNodeId + "edge",
                    source: nodeId,
                    target: specialNodeId
                }
            }
        );
        // Draw additional branches if qualified
        if (visitedBranches) {
            let branchNodes = getCytoscapeGraphForTopic(subchunkIndex, topicIndex, specialNodeId, visitedBranches, toReturn);
            if (branchNodes.length > 0) {
                toReturn.push.apply(branchNodes);
            }
        }
    }
    return finalNodeId;
}

function onSaveAsPngClick() {
    let pngContents = cy.jpg({ full: "true" });
    let pngTitle = `${localStorage.getItem(localStorageVizSubchunkIndexKey)}_${localStorage.getItem(localStorageVizTopicIndexKey)}.jpg`;
    if (pngContents && pngTitle) {
        snackbar("Saving to jpg");
        var download = document.createElement('a');
        download.href = pngContents;
        download.download = pngTitle;
        download.click();
    }
}