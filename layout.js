/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as $g from "https://opensource.liveg.tech/Adapt-UI/src/adaptui.js";
import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

$g.theme.setProperty("timeHue", String(Math.floor((360 / 60) * new Date().getMinutes())));

export var themes = {
    time: {
        background: `var(--time)`
    },
    blue: {
        background: "var(--blue)"
    },
    yellow: {
        background: "var(--yellow)"
    },
    red: {
        background: "var(--red)"
    },
    green: {
        background: "var(--green)"
    }
};

var storedTheme = localStorage.getItem("liveg_search_theme") || "";

export var currentTheme = Object.keys(themes).includes(storedTheme) ? storedTheme : "time";

export function getThemeData() {
    return themes[currentTheme];
}

export var GeneralNavigationBar = astronaut.component("GeneralNavigationBar", function(props, children) {
    return NavigationBar({
        styles: {
            "position": "static",
            "background-color": getThemeData().background
        }
    }) (
        Link("https://liveg.tech") (
            Image("https://liveg.tech/logo.png") ()
        ),
        Link({source: "/", attributes: {"aui-selected": true}}) (_("search"))
    );
});