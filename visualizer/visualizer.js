function renderVizTab() {
    populateVizToolbar();
    populateVizTopicToolbar();
}

function clearVizTab() {
    subchunkAnalyticsTable = undefined;
    setVizSubchunkAndTopicIndeces(0, 0);
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
    console.log(`drawing graph at subchunk index ${subchunkIndex} topic index ${topicIndex}`);
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

    let subchunkAnalyticsTableKeys = Object.keys(subchunkAnalyticsTable);
    if (!subchunkAnalyticsTableKeys) {
        return;
    }
    let subchunkName = subchunkAnalyticsTableKeys[subchunkIndex];

    if (!subchunkAnalyticsTable[subchunkName]) {
        return;
    }

    let topicName = Object.keys(subchunkAnalyticsTable[subchunkName])[topicIndex];

    let topic = subchunkAnalyticsTable[subchunkName][topicName];
    cy.add([
        { group: 'nodes', data: { id: topicName, name: topic.eventName } },
    ]);

    let prevNodeId = topicName;
    Object.keys(topic).forEach(sequenceIndex => {
        if (sequenceIndex == "numLines" || sequenceIndex == "numTags" || sequenceIndex == "eventName") {
            return;
        }
        let sequence = topic[sequenceIndex];

        cy.add([
            { group: 'nodes', data: { id: topicName + sequenceIndex, name: "" } },
            { group: 'edges', data: { id: topicName + sequenceIndex + "edge", source: prevNodeId, target: topicName + sequenceIndex } }
        ]);
        prevNodeId = topicName + sequenceIndex;

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
                        specialNode = true;
                        break;
                    case "branch":
                        branch = tokens[1];
                        specialNode = true;
                        break;
                    case "addspeakertag":
                        addSpeakerTags = tokens[1];
                        specialNode = true;
                        break;
                    case "addtargettag":
                        addTargetTags = tokens[1];
                        specialNode = true;
                        break;
                    case "removespeakertag":
                        removeSpeakerTags = tokens[1];
                        specialNode = true;
                        break;
                    case "removetargettag":
                        removeTargetTags = tokens[1];
                        specialNode = true;
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
            cy.add([
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
                        source: topicName + sequenceIndex,
                        target: nodeId
                    }
                }
            ]);

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

                cy.add([
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
                ]);
            }

        });
    });

    cy
        .elements()
        .layout({
            name: "dagre",
            fit: false
        });

    cy.on('tap', 'node', function () {
        if (this.data('subchunkIndex') && this.data('topicIndex')) {
            console.log(`redrawing graph at subchunkIndex ${this.data('subchunkIndex')} topicIndex ${this.data('topicIndex')}`);
            drawGraphHelper(this.data('subchunkIndex'), this.data('topicIndex'));
        }
    });
}