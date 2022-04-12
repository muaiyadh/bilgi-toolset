// ==UserScript==
// @name         Zoom LTI Recordings Scraper
// @version      0.1
// @description  Get all links and passwords for the recordings in an LTI Zoom frame.
// @author       MuaiyadH
// @match        *://*.zoom.us/*
// @grant        none
// ==/UserScript==

// Used to convert seconds to HH:MM:SS format
function secondsToTime(seconds){
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}


// Base function to send requests
function fetchData(url, xsrf, referrer){
    return fetch(url, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en;q=0.9,ar-SY;q=0.8,ar;q=0.7,en-US;q=0.6,ru;q=0.5,tr;q=0.4",
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"97\", \"Chromium\";v=\"97\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-xsrf-token": xsrf
        },
        "referrer": referrer,
        "referrerPolicy": "same-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
}


// Returns a promise containing the list of recordings
function getRecordingsList(page, scid, xsrf){
    const today = new Date();
    let end_date_string = today.getFullYear() + "-" + (today.getMonth()+1).toString().padStart(2,'0') + "-" + today.getDate().toString().padStart(2,'0');
    let recordings_url = "https://applications.zoom.us/api/v1/lti/rich/recording/COURSE?startTime=&endTime=" + end_date_string + "&keyWord=&searchType=1&status=&page=" + page.toString() + "&total=0&lti_scid=" + scid;
    return fetchData(recordings_url, xsrf, "https://applications.zoom.us/lti/rich")
        .then(response => response.json())
        .then(data => {
        if (data.status) {
            return data.result.list;
        } else {
            return null;
        }
    });
}


// Returns a promise containing a certain recording's info
function getFileInfo(meeting, scid, xsrf){
    let meetingId = encodeURIComponent(meeting.meetingId);
    let file_url = "https://applications.zoom.us/api/v1/lti/rich/recording/file?meetingId=" + meetingId + "&lti_scid=" + scid;
    return fetchData(file_url, xsrf, "https://applications.zoom.us/lti/rich/home/recording/detail").then(response => response.json())
        .then(data => {
        if (data.status) {
            let recording_files = data.result.recordingFiles;
            for(let file of recording_files){
                if (file.fileType != "M4A" || file.fileType == "MP4") { // If it's not a sound-only recording, or if it's an MP4 file type (a bit redundant, but eh)
                    let password_promise = getPassword(meetingId, scid, xsrf);
                    let start = file.recordingStart;
                    let end = file.recordingEnd;
                    let duration = secondsToTime(Math.floor((new Date(end) - new Date(start))/1000));
                    //return password_promise.then(password => { return ({"password":password,"recording_url":file.playUrl, "topic":meeting.topic, "duration":duration, "recordingStart": file.recordingStart, "file_size":file.fileSizeTransform}) });
                    return password_promise.then(password => { return [password,file.playUrl,meeting.topic,duration,file.recordingStart,file.fileSizeTransform] });
                }
            }
        }else{
            console.log("RECORDING COULD NOT BE FOUND", data, meeting);
        }
    });
}

// Returns a promise containing the password for a recording
function getPassword(meetingId, scid, xsrf){
    let password_url = "https://applications.zoom.us/api/v1/lti/rich/recording/pwd?meetingId=" + meetingId + "&lti_scid=" + scid;
    let password_promise = fetchData(password_url, xsrf, "https://applications.zoom.us/lti/rich/home/recording/detail")
    .then(response => response.json())
    .then(data => {
        if (data.status)
            return data.result.password;
        else
            return null;
    });
    return password_promise;
}


// Functions to download as CSV file
// Source: https://stackoverflow.com/a/68146412/18429369

/** Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
function downloadBlob(button_elem, content, filename, contentType) {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);

  button_elem.href = url;
  button_elem.setAttribute('download', filename);
}

/** Convert a 2D array into a CSV string
 */
function arrayToCsv(data){
  return data.map(row =>
    row
    .map(String)  // convert every value to String
    .map(v => v.replaceAll('"', '""'))  // escape double colons
    .map(v => `"${v}"`)  // quote it
    .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}


// Used to add a Download button when finished gathering all the recordings data
function addDownloadButton(rows){
    let header_elem = document.getElementsByClassName('zm-comp-header')[0];
    let download_btn_elem = document.createElement('a');
    download_btn_elem.textContent = "Download Recordings Info";
    download_btn_elem.classList = ['ant-btn ant-btn-primary'];
    download_btn_elem.style['margin-top'] = '10px'
    header_elem.appendChild(download_btn_elem);

    let data = arrayToCsv(rows);
    downloadBlob(download_btn_elem, data, 'recordings_info.csv', 'text/csv;charset=utf-8;');
}

// Check if it's loaded as an iframe, and includes the correct URL
if (!(window.top === window.self) && window.self.location.href.includes("applications.zoom.us/lti/rich")) {
    let xsrf_token = window.appConf.ajaxHeaders.find(function(e) {return "X-XSRF-TOKEN" == e.key}).value;
    let scid = window.appConf.page.scid;

    let rows = [["Password","Recording URL","Topic","Duration","Start datetime","Size"]];


    // Getting all recordings from a page in a separate function to recursively get all recordings until no recordings are left
    function getPage(page){
        let meetings_promise = getRecordingsList(page, scid, xsrf_token);

        meetings_promise.then(function(meetings_list) {
            //console.log(meetings_list);
            if (meetings_list.length == 0) {
                addDownloadButton(rows);
                return -1;
            }
            for(let meeting of meetings_list){
                let file_info_promise = getFileInfo(meeting, scid, xsrf_token);
                file_info_promise.then(data => {
                    if (data) {
                        rows.push(data);
                        console.log(data);
                    }
                });
            }
            return page + 1;
        }).then(nextPage => {if(nextPage >= 0) getPage(nextPage);});
    }

    // Start the gathering process
    getPage(1);
}
