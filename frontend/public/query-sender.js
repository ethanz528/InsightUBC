/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        // TODO: implement!
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://[::]:4321", true);

        xhttp.setRequestHeader("query", "/query");


        xhttp.open("POST", "/query", true);
        xhttp.setRequestHeader("query", "http://[::]:4321");

        xhttp.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                // Request finished. Do processing here.
            }
        }
        xhttp.send(query);
        console.log("CampusExplorer.sendQuery not implemented yet.");
        return query;

    });
};
