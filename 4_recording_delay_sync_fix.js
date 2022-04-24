// ==UserScript==
// @name         Zoom Replay Chat Recording + Sync delay fix
// @version      0.1
// @description  Moves the chat history in real time against the recording's current time.
// @author       MuaiyadH and based on code by AlienDrew
// @license      GPL-3.0-or-later
// @match        https://*.zoom.us/rec/play/*
// @require      https://code.jquery.com/jquery-latest.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

if (document.querySelector('#passcodeLabel')){
    return;
}
// converts seconds to HH:MM:SS formatted string
function secondsToTime(seconds){
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}

// This function handels "HH:MM:SS" as well as "MM:SS" or "SS".
// Source: https://stackoverflow.com/a/9640417/18429369
function timeToSeconds(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

let waitForTimeRangeCurrent = setInterval(function() {
    // contains current time
    let timeRangeCurrent = document.querySelector('.vjs-time-range-current');
    if (timeRangeCurrent && timeRangeCurrent.innerText != "") {
        clearInterval(waitForTimeRangeCurrent);
        if (document.getElementsByClassName("chat-container").length == 0){
            return;
        }

        // add an input box for the delay next to the "Chat Messages" header
        let chatMessagesHeader = document.getElementsByClassName('chat-container')[0].parentNode.parentNode.getElementsByTagName('h2')[0];
        let delayInputBox = document.createElement("input");
        delayInputBox.type = "text";
        delayInputBox.id = "delayInputBox";
        delayInputBox.value = "00:00:00";

        let delayInputBoxText = document.createElement("p");
        delayInputBoxText.textContent = "Chat messages sync delay (HH:MM:SS):";

        chatMessagesHeader.appendChild(delayInputBoxText);
        chatMessagesHeader.appendChild(delayInputBox);


        // where the scroll box is controlled
        let zmScrollbarWrap = document.querySelector('.zm-scrollbar__wrap');

        // array of all chats
        let chatListItems = document.querySelectorAll('.chat-list-item');
        let chatListItemCount = chatListItems.length;

        // need an array of the chat times in seconds
        let chatListItemTimes = new Array(chatListItemCount);
        function updateChatTimes(){
            let delayBox = document.getElementById("delayInputBox");
            let delay = 0;
            if (delayBox && delayBox.value.length > 0) {
                delay = timeToSeconds(delayBox.value);
            }
            for (let i = 0; i < chatListItemCount; i++) {
                let chatTime = chatListItems[i].querySelector('.chat-time');
                let timeInSeconds = timeToSeconds(chatTime.innerText) - delay;
                if (initialValues) {
                    timeInSeconds = initialValues[i] - delay;
                }
                chatTime.textContent = secondsToTime(timeInSeconds);
                chatListItemTimes[i] = timeInSeconds;
            }
        }
        // get initial chat values and save them into a variable
        let initialValues = null;
        updateChatTimes();
        initialValues = chatListItemTimes.slice();

        // need mutation observer to watch for timeRangeCurrent
        let observer = new MutationObserver(mutations => {
            // watch the current time and scroll to chat
            for(let mutation of mutations) {
                let currentTime = timeToSeconds(mutation.target.textContent);

                let foundIndex = -1;
                for (let i = chatListItemTimes.length-1; i > 0; i--){
                    let chatTime = chatListItemTimes[i];
                    if (chatTime <= currentTime) {
                        foundIndex = i;
                        break;
                    }
                }

                // go to last chat matching the current time (shows up at bottom just like a live chat)
                if (foundIndex >= 0) chatListItems[foundIndex].scrollIntoViewIfNeeded(false);
            }
        });

        // configuration of the observer:
        let config = { childList: true, characterData: true, subtree: true };

        // pass in the target node, as well as the observer options
        observer.observe(timeRangeCurrent, config);
        $("#delayInputBox").on("change keyup paste", function(){
            updateChatTimes();
        })
    }
}, 100);
