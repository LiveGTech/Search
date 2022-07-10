/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

export class SearchResult {
    constructor(url, title, description = "") {
        this.url = url;
        this.title = title;
        this.description = description;
    }
};

export function getWebResults(query) {
    return new Promise(function(resolve, reject) {
        // TODO: This is for testing only at the moment; add proper results fetching

        setTimeout(function() {
            resolve([
                new SearchResult("https://liveg.tech", "LiveG Technologies", "We're LiveG Technologies, a group dedicated to developing software and hardware that's made for everyone."),
                new SearchResult("https://search.liveg.tech", "LiveG Search", "Search the internet for information including articles, websites, imagery and more."),
                new SearchResult("https://docs.liveg.tech", "LiveG Docs", "The hub for all of LiveG's help guides, technical references and more.")
            ]);
        }, 1_000);
    });
}