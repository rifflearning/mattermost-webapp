#! /bin/bash
#
# Extract and and display the summary information from a check-style html formatted log
# If a threshold value is supplied, compare the number of problems reported in that log
# against the threshold, and set the exit status to 1 if it is exceeded, otherwise 0.
# syntax:
#   style-error-threshold.sh <check-style html format log file> <threshold error count>

CHECK_STYLE_LOG="${1-check-style.log.html}"
THRESHOLD=$2

# Extract the summary from the html report
LINT_SUMMARY="$(sed -n -e '/<h1>ESLint Report/{s/^.*<h1>\(.*\)<.*$/\1/;p;n;n;s/.*<span>/\t/;s#</span> - #\n\t#;p}' "$CHECK_STYLE_LOG")"

# Report the summary
echo "$LINT_SUMMARY"

# Extract the number of check-style problems from the summary
LIST_ERR_CNT=$(echo "$LINT_SUMMARY" | sed -nE '2{s/^\s*([[:digit:]]+) problems.*$/\1/;p}')

# If a threshold was given, test the # of problems against it and
# report and set the exit code appropriately
if [[ -n "$LIST_ERR_CNT" && -n "$THRESHOLD" ]]
then
    if [[ $LIST_ERR_CNT -gt $THRESHOLD ]]
    then
        echo FAIL: $LIST_ERR_CNT check-style errors exceeds the threshold of $THRESHOLD
        exit 1
    else
        echo PASS: $LIST_ERR_CNT check-style errors is within the threshold of $THRESHOLD
        exit 0
    fi
fi
