/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "https://opensource.liveg.tech/Adapt-UI/src/adaptui.js";
import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

window.$g = $g;

astronaut.unpack();

import * as home from "./home.js";
import * as searchView from "./searchview.js";

$g.waitForLoad().then(function() {
    return $g.l10n.selectLocaleFromResources({
        "en_GB": "locales/en_GB.json"
    });
}).then(function(locale) {
    window._ = function() {
        return locale.translate(...arguments);
    };

    $g.sel("body").setAttribute("aui-mode", "web");

    var homeScreen = home.HomeScreen() ();

    var screenContainer = Container() (
        homeScreen
    );

    function onSearch(event) {
        var searchScreen = searchView.WebSearchScreen({query: event.detail.query}) ();

        searchScreen.on("visitsearch", onSearch);

        screenContainer.add(searchScreen);

        searchScreen.screenFade();
    }

    homeScreen.on("visitsearch", onSearch);

    homeScreen.show();

    astronaut.render(screenContainer);
});