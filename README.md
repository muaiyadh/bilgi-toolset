# Bilgi Toolset

Tools to enhance the experience for Bilgi University's website

## How to install the scripts?
Most of the scripts here are _userscripts_. They require the Chrome/Firefox extension Tampermonkey or something similar to work. They can be made into a separate extensions, but doing it this way reduces the amount of extensions you need to add.

After installing Tampermonkey, click on the extension's icon and hit 'Create a new script...', then copy and paste the entire code from one of the scripts.

***

### 1. Bilgi Learn: display as List

Displays courses as a List instead of the weird default Cards format.

If this doesn't work, try modifying the delay at the bottom of the script (default: 750ms)

### 2. Zoom recordings info scraper

Adds a button on the Zoom Recordings page to directly download info of all recordings of this course as a csv file.
The info include: Recording link, recording password, meeting topic, total duration, recording start time, recording size.

NOTE: this tool should work fine, but due to the way it works, try avoid abusing it _too_ much.

### 3. Exam schedule search

A Python script that takes the Excel file for exams dates and the courses names as input, and gives each course's exam date and time as output.

Usage: open command prompt in the same folder as the script, then type:
```
python3 3_exam_schedule_extractor.py -c "COURSES" -i "PATH TO EXCEL FILE"
```
Replace COURSES with the names of courses want to search for. And replace PATH TO EXCEL FILE with the full path to the exams excel file.

Example usage:
```
python3 3_exam_schedule_extractor.py -c "MATH 292, EEEN 202, MECA 202" -i "C:/Users/USERNAME/Downloads/examschedulebycampusdatehourcourse4.xls"

EEEN 202 @ 25.04.2022 Pazartesi/Monday. Time: ['19:00:00']
MATH 292 @ 27.04.2022 Çarşamba/Wednesday. Time: ['19:00:00']
MECA 202 @ 29.04.2022 Cuma/Friday. Time: ['11:00:00']
```

NOTE: Don't forget the space between the course code and the number. "MATH 292" is fine, "MATH292" is not.

### 4. Zoom recordings chat sync fix and autoscroll

Lets you manually fix the sync between the Zoom recording and the chat messages.
Also, automatically scrolls to the current chat message.

***
Found a bug? Report it in the issues tab.

## Important Note

You assume full responsibility when using any of the provided tools.

These tools are for educational purposes only.
