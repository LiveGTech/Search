/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as searchResults from "../../searchresults.js";

export class WikimediaSource extends searchResults.Source {
    getWebResults(query) {
        // TODO: Make this work with the Wikidata/Wikipedia APIs

        if (query == "computer") {
            return Promise.resolve([
                new searchResults.InfoCard(
                    "https://en.wikipedia.org/wiki/Computer",
                    "Computer - Wikipedia",
                    `A computer is a digital electronic machine that can be programmed to carry out sequences of arithmetic or logical operations (computation) automatically. Modern computers can perform generic sets of operations known as programs. These programs enable computers to perform a wide range of tasks.`
                )
            ]);
        }

        return Promise.resolve([]);
    }
}

export var source = WikimediaSource;