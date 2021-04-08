/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {
    let query = {};
    let activeTab = document.getElementsByClassName("tab-panel active")[0];
    let datasetKind = activeTab.getAttribute("data-type");
    let filters = [];
    let i;
    let j;
    for (let e of activeTab.getElementsByClassName("control-group condition")) {
        e = e.childNodes;
        i = {};
        j = {};
        j[datasetKind + "_" + e[3].childNodes[1].selectedOptions[0].value] = e[7].childNodes[1].value;
        i[e[5].childNodes[1].selectedOptions[0].value] = j;
        if (Object.keys(i)[0] !== "IS") {
            Object.values(i)[0][Object.keys(Object.values(i)[0])[0]] = parseInt(Object.values(Object.values(i)[0])[0]);
        }
        if (e[1].childNodes[1].checked) {
            filters.push({"NOT": i});
        } else {
            filters.push(i);
        }
    }
    if (filters.length === 0) {
        query["WHERE"] = {};
    } else if (filters.length === 1) {
        query["WHERE"] = filters[0];
    } else{
        if (document.getElementById(datasetKind + "-conditiontype-all")["checked"]) {
            query["WHERE"] = {"AND": filters};
        } else if (document.getElementById(datasetKind + "-conditiontype-any")["checked"]) {
            query["WHERE"] = {"OR": filters};
        } else {
            query["WHERE"] = {"NOT": {"AND": filters}};
        }
    }

    let columns = [];
    for (let e of activeTab.getElementsByClassName("form-group columns")[0].getElementsByClassName("control ")) {
        if (e.childNodes[1].checked) {
            if (e.className === "control field") {
                columns.push(datasetKind + "_" + e.childNodes[1].value)
            } else {
                columns.push(e.childNodes[1].value)
            }
        }
    }
    let order = [];
    for (let e of activeTab.getElementsByClassName("form-group order")[0].getElementsByClassName("control order fields")[0].childNodes[1].selectedOptions) {
        if (e.className === "") {
            order.push(datasetKind + "_" + e.value);
        } else {
            order.push(e.value);
        }
    }
    if (activeTab.getElementsByClassName("form-group order")[0].getElementsByClassName("control descending")[0].childNodes[1].checked) {
        query["OPTIONS"] = {"COLUMNS": columns, "ORDER": {"dir": "DOWN", "keys": order}};
    } else {
        query["OPTIONS"] = {"COLUMNS": columns, "ORDER": {"dir": "UP", "keys": order}};
    }

    let groups = [];
    for (let e of activeTab.getElementsByClassName("form-group groups")[0].getElementsByClassName("control field")) {
        if (e.childNodes[1].checked) {
            groups.push(datasetKind + "_" + e.childNodes[1].value);
        }
    }
    let applys = [];
    for (let e of activeTab.getElementsByClassName("control-group transformation")) {
        e = e.childNodes;
        i = {};
        j = {};
        j[e[3].childNodes[1].selectedOptions[0].value] = datasetKind + "_" + e[5].childNodes[1].selectedOptions[0].value;
        i[e[1].childNodes[1].value] = j;
        applys.push(i);
    }
    if (groups.length !== 0) {
        query["TRANSFORMATIONS"] = {"GROUP": groups, "APPLY": applys};
    }

    return query;
};
