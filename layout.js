/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

export var themes = {
    time: {
        background: `hsl(${Math.floor((360 / 60) * new Date().getMinutes())}, 85%, 80%)`
    },
    blue: {
        background: "hsl(220, 85%, 80%)"
    },
    yellow: {
        background: "hsl(60, 85%, 80%)"
    },
    red: {
        background: "hsl(0, 85%, 80%)"
    },
    green: {
        background: "hsl(120, 85%, 80%)"
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
        Link() (
            Image("https://liveg.tech/logo.png") ()
        ),
        Link({attributes: {"aui-selected": true}}) (_("search"))
    );
});