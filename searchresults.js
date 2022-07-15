/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

export var webIndex = null;
export var sources = null;

export class Source {
    constructor() {}

    getWebResults(query) {
        return Promise.resolve([]);
    }
}

export class PageResult {
    constructor(url, title, description = "", weighting = 1) {
        this.url = url;
        this.title = title;
        this.description = description;
        this.weighting = weighting;
    }
}

export class InfoCard {
    constructor(url, title, contents, image = null) {
        this.url = url;
        this.title = title;
        this.contents = contents;
        this.image = image; // TODO: Add support
    }
}

export class SecondaryCard {
    constructor(url, title, contents, attribution, classification = null, image = null) {
        this.url = url;
        this.title = title;
        this.contents = contents;
        this.attribution = attribution;
        this.classification = classification;
        this.image = image; // TODO: Add support
    }
}

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

function loadSources() {
    return (sources == null ? fetch("sources/sources.json").then(function(response) {
        return response.json();
    }).then(function(data) {
        var promises = [];

        sources = data.sources;

        sources.forEach(function(source) {
            promises.push(import(source.script).then(function(importedModule) {
                source.module = importedModule;

                source.instance = new source.module.source();
            }));
        });

        return Promise.all(promises);
    }) : Promise.resolve());
}

export function getWebResults(query) {
    var results;

    return (webIndex == null ? fetch("indexing/index.json").then(function(response) {
        return response.json();
    }).then(function(data) {
        webIndex = data;
    }) : Promise.resolve()).then(function() {
        return loadSources();
    }).then(function() {
        results = [
            ...webIndexOn(webIndex.titles, query),
            ...alterWeightings(webIndexOn(webIndex.descriptions, query), 0.8),
            ...alterWeightings(webIndexOn(webIndex.phrases, query), 0.5)
        ];

        results = results.map((result) => new PageResult(
                result.url,
                result.title,
                (result.description || "").length == 200 ? result.description.trim() + "…" : result.description,
                result.weighting
            ))
            .sort((a, b) => b.weighting - a.weighting)
        ;

        return Promise.all(sources.map(function(source) {
            return source.instance.getWebResults(query).catch(function(error) {
                console.warn(error);

                return Promise.resolve([]);
            });
        }));
    }).then(function(sourceResults) {
        results = [...sourceResults.flat(), ...results];

        results = results.filter(function(value, index, self) {
            if (!value.url) {
                return true;
            }

            return index == self.findIndex((item) => item.url == value.url);
        });

        return results;
    });
}