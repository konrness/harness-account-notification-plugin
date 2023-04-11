#!/bin/sh

set -e

starttime=$(date +%s.%N)

echo "-- Starting..."

# check required parameters
if [ -z $PLUGIN_ACCOUNT_ID ]; then
    echo "-- Error: missing account_id"
    exit 1
fi

if [ -z $PLUGIN_ACCESS_KEY ]; then
    echo "-- Error: missing access_key"
    exit 1
fi

set +e

if [ "$PLUGIN_DEBUG" = "true" ]; then
    echo "-- DEBUG: running following command..."
    echo "-- DEBUG: node /app/run.js $PLUGIN_ACCOUNT_ID $PLUGIN_ACCESS_KEY"
fi

exitcode=`node /app/run.js $PLUGIN_ACCOUNT_ID $PLUGIN_ACCESS_KEY &> output.log; echo $?`

if [ "$PLUGIN_DEBUG" = "true" ]; then
    cat output.log
fi

endtime=$(date +%s.%N)
echo "duration: $(echo "$endtime $starttime" | awk '{printf "%f", $1 - $2}')s"

if [[ $exitcode -eq 0 ]]; then
    echo "-- Successfully finished harness-account-notification-plugin"
else
    echo "-- Error running harness-account-notification-plugin"
    exit $exitcode
fi