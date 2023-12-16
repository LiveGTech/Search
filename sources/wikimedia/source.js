/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "https://opensource.liveg.tech/Adapt-UI/src/adaptui.js";

import * as searchResults from "../../searchresults.js";

export const TYPES_AS_INFO_CARD = ["individual", "planet", "country"];
export const TYPES_AS_SECONDARY_CARD = ["organisation", "city", "town", "village", "region"];

export class WikimediaSource extends searchResults.Source {
    getWikidataEntityInfo(id) {
        return fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${id}`).then(function(response) {
            return response.json();
        }).then(function(data) {
            return Promise.resolve(Object.values(data.entities)?.[0] || null);
        });
    }

    getWikidataInfo(query) {
        var thisScope = this;

        return fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&origin=*&search=${encodeURIComponent(query)}`).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (data.search.length == 0) {
                return Promise.resolve({});
            }

            return thisScope.getWikidataEntityInfo(data.search[0].id);
        });
    }

    getWikidataPropertyValues(info, property) {
        return info?.claims?.[property]?.map((value) => value.mainsnak.datavalue) || [];
    }

    hasWikidataPropertyValues(values, matchValues) {
        return !!values.find((propertyValue) => matchValues.includes(propertyValue.value));
    }

    hasWikidataPropertyEntities(values, ids) {
        return !!values.find((propertyValue) => propertyValue.type == "wikibase-entityid" && ids.includes(propertyValue.value.id));
    }

    getWikidataLocalisedName(info, locale = $g.l10n.getSystemLocaleCode().split("_")[0]) {
        return info?.labels[locale]?.value || null;
    }

    getWikidataItemClassification(info) {
        var thisScope = this;
        var values = this.getWikidataPropertyValues(info, "P31"); // "instance of"

        console.log(values);

        function regionOfCountry(classification) {
            return thisScope.getWikidataEntityInfo(thisScope.getWikidataPropertyValues(info, "P17")[0]?.value.id).then(function(info) {
                return Promise.resolve({
                    ...classification,
                    country: thisScope.getWikidataLocalisedName(info)
                });
            });
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q43229", // "organization"
            "Q4830453", // "business"
            "Q783794", // "company"
            "Q6881511", // "enterprise"
            "Q7644624", // "supporting organization"
            "Q78443472" // "public-benefit corporation"
        ])) {
            return Promise.resolve({type: "organisation"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q5" // "human"
        ])) {
            return Promise.resolve({type: "individual"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q128207" // "terrestrial planet"
        ])) {
            return Promise.resolve({type: "planet"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q6256", // "country"
            "Q3624078" // "soverign state"
        ])) {
            return Promise.resolve({type: "country"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q515" // "city"
        ])) {
            return regionOfCountry({type: "city"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q3957" // "town"
        ])) {
            return regionOfCountry({type: "town"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q532" // "village"
        ])) {
            return regionOfCountry({type: "village"});
        }

        if (this.hasWikidataPropertyEntities(values, [
            "Q82794" // "geographic region"
        ])) {
            return Promise.resolve({type: "region"});
        }

        return Promise.resolve({type: null});
    }

    getWikipediaInfo(query) {
        return fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&origin=*&titles=${encodeURIComponent(query)}`).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (!data.query?.pages || data.query.pages.hasOwnProperty("-1")) {
                return Promise.resolve(null);
            }

            return Promise.resolve({
                url: `https://en.wikipedia.org/wiki/${encodeURI(Object.values(data.query.pages)[0].title)}`,
                title: `${Object.values(data.query.pages)[0].title} - Wikipedia`,
                contents: Object.values(data.query.pages)[0].extract.split(".").slice(0, 3).join(".") + "."
            });
        });
    }

    getWebResults(query) {
        var thisScope = this;
        var wikidataInfo;
        var classification;

        return this.getWikidataInfo(query).then(function(info) {
            wikidataInfo = info;

            return thisScope.getWikidataItemClassification(info);
        }).then(function(classificationData) {
            classification = classificationData;

            if ([...TYPES_AS_INFO_CARD, ...TYPES_AS_SECONDARY_CARD].includes(classification.type)) {
                return thisScope.getWikipediaInfo(query).then(function(info) {
                    if (TYPES_AS_INFO_CARD.includes(classification.type)) {
                        return Promise.resolve([
                            new searchResults.InfoCard(
                                info.url,
                                info.title,
                                info.contents
                            )
                        ]);
                    }

                    if (TYPES_AS_SECONDARY_CARD.includes(classification.type)) {
                        return Promise.resolve([
                            new searchResults.SecondaryCard(
                                info.url,
                                thisScope.getWikidataLocalisedName(wikidataInfo),
                                info.contents,
                                _("source_wikimedia_wikipedia"),
                                _("source_wikimedia_classification", classification)
                            )
                        ]);
                    }

                    return Promise.resolve([]);
                });
            }

            return Promise.resolve([]);
        });
    }
}

export var source = WikimediaSource;