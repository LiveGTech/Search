/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as searchResults from "../../searchresults.js";

export class WikimediaSource extends searchResults.Source {
    getWebResults(query) {
        return fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&titles=${encodeURIComponent(query)}`).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (!data.query?.pages || data.query.pages.hasOwnProperty("-1")) {
                return Promise.resolve([]);
            }

            return Promise.resolve([
                new searchResults.InfoCard(
                    `https://en.wikipedia.org/wiki/${encodeURI(Object.values(data.query.pages)[0].title)}`,
                    `${Object.values(data.query.pages)[0].title} - Wikipedia`,
                    Object.values(data.query.pages)[0].extract.split(".").slice(0, 3).join(".") + "."
                )
            ]);
        });
    }
}

export var source = WikimediaSource;