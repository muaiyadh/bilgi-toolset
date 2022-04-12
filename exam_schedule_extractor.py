"""
Accepts an Excel file + List of courses and gives the dates and times for exams.
"""

import sys
import getopt

import pandas
import re

from datetime import datetime

def main(argv):
    courses = []
    inputfile = ""
    try:
        opts, args = getopt.getopt(argv, "hc:i:", ["courses=", "file="])
    except getopt.GetoptError:
        print('Usage: -c <courses> -i <inputfile>')
        sys.exit(2)
    if len(opts) == 0:
        sys.exit()
    for opt, arg in opts:
        if opt == '-h':
            print('Usage: -c <courses> -i <inputfile>')
            sys.exit()
        elif opt in ("-c", "--courses"):
            courses = [i.strip() for i in arg.split(',')]
        elif opt in ("-i", "--file"):
            inputfile = arg

    schedule = pandas.read_excel(io=inputfile)
    days = [schedule[i] for i in schedule.columns]
    
    courses_with_dates = {}
    for i, course in enumerate(courses):
        for day in days:
            if course in day.values:
                time = []
                to_append = None
                for cell in day.values:
                    match = re.search(r"[0-9]{2}:[0-9]{2}:[0-9]{2}", str(cell))
                    if match:
                        to_append = match[0]
                    elif course in str(cell):
                        time.append(to_append)
                        to_append = None
                day[0] = day[0].replace(chr(10), ' ')
                date = datetime.strptime(day[0][:day[0].index(' ')], "%d.%m.%Y").date()
                courses_with_dates[course] = [day[0], time, date]
    
    courses_with_dates = sorted(courses_with_dates.items(), key=lambda a:str(a[1][2]) + ' '.join(a[1][1]))
    for k, v in courses_with_dates: print(f"{k} @ {v[0]}. Time: {v[1]}")


if __name__ == '__main__':
    main(sys.argv[1:])
