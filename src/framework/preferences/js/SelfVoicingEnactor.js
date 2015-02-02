/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * speak
     *
     * An enactor that is capable of speaking text.
     * Typically this will be used as a base grade to an enactor that supplies
     * the text to be spoken.
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.speakEnactor", {
        gradeNames: ["fluid.textToSpeech", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.enabled": "default"
            }
        },
        invokers: {
            queueSpeech: {
                funcName: "fluid.prefs.enactor.speakEnactor.queueSpeech"
            }
        }
    });


    fluid.prefs.enactor.speakEnactor.queueSpeech = function (that, text, interrupt, options) {
        // force a string value
        var str = text.toString();

        // remove extra whitespace
        str = str.trim();
        str.replace(/\s{2,}/gi, " ");

        if (that.model.enabled && str) {
            fluid.textToSpeech.queueSpeech(that, str, interrupt, options);
        }
    };

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing of an entire page
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.selfVoicingEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor.speakEnactor", "autoInit"],
        modelListeners: {
            "enabled": "{that}.handleSelfVoicing"
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "fluid.prefs.enactor.selfVoicingEnactor.handleSelfVoicing",
                args: "{that}"
            },
            readFromDOM: {
                funcName: "fluid.prefs.enactor.selfVoicingEnactor.readFromDOM",
                args: ["{that}", "{that}.container"]
            }
        },
        strings: {
            welcomeMsg: "text to speech enabled"
        }
    });

    fluid.prefs.enactor.selfVoicingEnactor.handleSelfVoicing = function (that) {
        if (that.model.enabled) {
            that.queueSpeech(that.options.strings.welcomeMsg, true);
            that.readFromDOM();
        } else {
            that.cancel();
        }
    };

    // Constants representing DOM node types.
    fluid.prefs.enactor.selfVoicingEnactor.nodeType = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    // TODO: Currently only reads text nodes and alt text.
    // This should be expanded to read other text descriptors as well.
    fluid.prefs.enactor.selfVoicingEnactor.readFromDOM = function (that, elm) {
        elm = $(elm);
        var nodes = elm.contents();
        fluid.each(nodes, function (node) {
            if (node.nodeType === fluid.prefs.enactor.selfVoicingEnactor.nodeType.TEXT_NODE && node.nodeValue) {
                that.queueSpeech(node.nodeValue);
            }

            if (node.nodeType === fluid.prefs.enactor.selfVoicingEnactor.nodeType.ELEMENT_NODE && window.getComputedStyle(node).display !== "none") {
                if (node.nodeName === "IMG") {
                    var altText = node.getAttribute("alt");
                    if (altText) {
                        that.queueSpeech(altText);
                    }
                } else {
                    fluid.prefs.enactor.selfVoicingEnactor.readFromDOM(that, node);
                }
            }
        });
    };

})(jQuery, fluid_2_0);
