// ==UserScript==
// @name         Bilgi Learn display as "List"
// @version      0.1
// @description  Displays courses as List instead of default Cards format
// @author       MuaiyadH
// @match        https://learn.bilgi.edu.tr/my/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Used to get elements easily using XPath
    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // Not the best method to do this, but it works fine:

    // Wait until page finishes loading
    window.addEventListener('load', function () {
        // Aaand wait a bit more
        setTimeout(function(){
            let header_title_elem = getElementByXpath("//h4[@class='card-title d-inline' and text()='Course overview']");

            if (header_title_elem) {
                let list_button_elem = getElementByXpath("//a[@data-value='list']");
                if (list_button_elem) {
                    console.log("Found button. Will click.");
                    list_button_elem.click();
                }
            }
        }, 750); // If this doesnt work, try increasing this delay
    });
})();
