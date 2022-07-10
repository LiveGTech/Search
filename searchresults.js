/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

export var webIndex = null;
export var webFuse = null;

export class SearchResult {
    constructor(url, title, description = "", weighting = 1) {
        this.url = url;
        this.title = title;
        this.description = description;
        this.weighting = weighting;
    }
};

function normaliseText(text) {
    return text.trim().toLocaleLowerCase().replace(/[\s'‘’"“”,.!?:;*|\\/\-–—()`]/g, "");
}

function webIndexOn(object, query) {
    return Object.keys(object)
        .filter((key) => key.includes(normaliseText(query)))
        .map((key) => object[key].map((position) => webIndex.index[position]))
        .flat()
    ;
}

function alterWeightings(results, factor) {
    return results.map((result) => ({
        ...result,
        weighting: result.weighting * factor
    }));
}

export function getWebResults(query) {
    return (webIndex == null ? fetch("indexing/index.json").then(function(response) {
        return response.json();
    }).then(function(data) {
        webIndex = data;
    }) : Promise.resolve()).then(function() {
        var results = [
            ...webIndexOn(webIndex.titles, query),
            ...alterWeightings(webIndexOn(webIndex.phrases, query), 0.8),
            ...alterWeightings(webIndexOn(webIndex.descriptions, query), 0.5)
        ];
            
        results = results.map((result) => new SearchResult(
                result.url,
                result.title,
                result.description,
                result.weighting
            ))
            .sort((a, b) => b.weighting - a.weighting)
        ;

        results = results.filter(function(value, index, self) {
            return index == self.findIndex((item) => item.url == value.url);
        })

        return Promise.resolve(results);
    });
}