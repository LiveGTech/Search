/*
    LiveG Search

    Copyright (C) LiveG. All Rights Reserved.

    https://search.liveg.tech
    Licensed by the LiveG Open-Source Licence, which can be found at LICENCE.md.
*/

import * as astronaut from "https://opensource.liveg.tech/Adapt-UI/astronaut/astronaut.js";

import * as layout from "./layout.js";

export var HomeScreen = astronaut.component("HomeScreen", function(props, children) {
    var searchInput = Input({
        type: "search",
        placeholder: _("searchInput_placeholder"),
        styles: {
            "background-color": "var(--searchBackground)"
        }
    }) ();

    var screen = Screen({
        styles: {
            "background-color": layout.getThemeData().background
        }
    }) (
        layout.GeneralNavigationBar() (),
        Page({
            shown: true,
            styles: {
                "display": "flex",
                "flex-direction": "column",
                "justify-content": "center",
                "min-height": "calc(100% - 9rem)",
                "margin": "0",
                "background-color": "inherit"
            }
        }) (
            Section({
                styles: {
                    "min-height": "20rem"
                }
            }) (
                Container({
                    styles: {
                        "max-width": "40rem"
                    }
                }) (
                    searchInput
                )
            )
        ),
        Footer({
            styles: {
                "display": "flex",
                "min-height": "4rem",
                "padding-top": "1.3rem",
                "padding-bottom": "1.3rem",
                "background-color": "inherit"
            }
        }) (
            TextFragment({attributes: {"aui-mode": "grow"}}) (),
            Text(_("footer_legal"))
        )
    );

    setTimeout(function() {
        searchInput.focus();
    });

    $g.sel("body").on("keydown", function(event) {
        if (screen.hasAttribute("hidden") || document.activeElement == searchInput.get()) {
            return;
        }

        if (event.key == "/") {
            searchInput.focus();
        
            var domElement = searchInput.get();

            domElement.selectionStart = searchInput.getValue().length;
            domElement.selectionEnd = searchInput.getValue().length;

            event.preventDefault();
        }
    });

    searchInput.on("keydown", function(event) {
        if (event.key == "Enter") {
            screen.emit("visitsearch", {query: searchInput.getValue()});
        }
    });

    return screen;
});