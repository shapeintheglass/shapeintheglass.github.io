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
                    width: 30,
                    height: 30,
                    'font-family': 'monospace',
                    'text-wrap': 'wrap',
                    'text-max-width': '500px',
                    'text-justification': 'right',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'text-background-opacity': 1,
                    'text-background-color': '#ffffff',
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
        pan: { x: 200, y: 100 },
    });

    let nodesToAdd = getCytoscapeGraphForTopic(subchunkIndex, topicIndex);
    cy.add(nodesToAdd);

    cy.elements()
        .layout({
            name: "dagre",
            fit: false
        });

    cy.on('tap', 'node', function () {
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
    });
}

function getCytoscapeGraphForTopic(subchunkIndex, topicIndex, rootId) {
    let toReturn = [];
    let subchunkAnalyticsTableKeys = Object.keys(subchunkAnalyticsTable);
    if (!subchunkAnalyticsTableKeys) {
        return;
    }
    let subchunkName = subchunkAnalyticsTableKeys[subchunkIndex];

    if (!subchunkAnalyticsTable[subchunkName]) {
        return;
    }

    let topicKeys = Object.keys(subchunkAnalyticsTable[subchunkName]);
    topicIndex = topicIndex >= topicKeys.length ? 0 : topicIndex;
    let topicName = topicKeys[topicIndex];

    console.log(`drawing graph at subchunk index ${subchunkIndex} topic index ${topicIndex}`);
    let topic = subchunkAnalyticsTable[subchunkName][topicName];
    let topicNodeId = crypto.randomUUID();
    toReturn.push(
        { group: 'nodes', data: { id: topicNodeId, name: topic.eventName } },
    );

    if (rootId) {
        let edgeId = crypto.randomUUID();
        toReturn.push({ group: 'edges', data: { id: edgeId, source: rootId, target: topicNodeId } });
    }

    let prevNodeId = topicNodeId;
    Object.keys(topic).forEach(sequenceIndex => {
        if (sequenceIndex == "numLines" || sequenceIndex == "numTags" || sequenceIndex == "eventName") {
            return;
        }
        let sequence = topic[sequenceIndex];
        let sequenceNodeId = crypto.randomUUID();
        let sequenceEdgeId = crypto.randomUUID();
        toReturn.push(
            { group: 'nodes', data: { id: sequenceNodeId, name: "" } },
            { group: 'edges', data: { id: sequenceEdgeId, source: prevNodeId, target: sequenceNodeId } }
        );
        prevNodeId = sequenceNodeId;

        sequence.forEach(line => {
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

            let edgeName = ``;
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
                        id: topicName + nodeId + "edge",
                        name: edgeName,
                        source: sequenceNodeId,
                        target: nodeId
                    }
                }
            );

            let topicIndex = -1;
            if (specialNode) {
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
            }

        });
    });
    return toReturn;
}

function onSaveAsPngClick() {
    let pngContents = cy.png();
    let pngTitle = `${localStorage.getItem(localStorageVizSubchunkIndexKey)}_${localStorage.getItem(localStorageVizTopicIndexKey)}.png`;
    if (pngContents && pngTitle) {
        snackbar("Saving to png");
        var download = document.createElement('a');
        download.href = pngContents;
        download.download = pngTitle;
        download.click();
    }
}