/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

export function getWebResults(query) {
    return new Promise(function(resolve, reject) {
        // TODO: This is for testing only at the moment; add proper results fetching

        setTimeout(function() {
            resolve([]);
        }, 3_000);
    });
}