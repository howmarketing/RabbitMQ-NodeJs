#!/bin/bash

# node src/send_to_ex.js "Message 1 ." && node src/send_to_ex.js "Message 2 ...." && node src/send_to_ex.js "Message 3 ." && node src/send_to_ex.js "Message 4 ...." && node src/send_to_ex.js "Message 5 ." && node src/send_to_ex.js "Message 6 ...." && node src/send_to_ex.js "Message 7 ." && node src/send_to_ex.js "Message 8 ...." && node src/send_to_ex.js "Message 9 ." && node src/send_to_ex.js "Message 10 ...." && node src/send_to_ex.js "Message 11 ." && node src/send_to_ex.js "Message 12 ...." && node src/send_to_ex.js "Message 13 ." && node src/send_to_ex.js "Message 14 ...." && node src/send_to_ex.js "Message 15 ." && node src/send_to_ex.js "Message 16 ...." && node src/send_to_ex.js "Message 17 ." && node src/send_to_ex.js "Message 18 ...." && node src/send_to_ex.js "Message 19 ." && node src/send_to_ex.js "Message 20 ...." && node src/send_to_ex.js "Message 21 ." && node src/send_to_ex.js "Message 22 ...." && node src/send_to_ex.js "Message 23 ." && node src/send_to_ex.js "Message 24 ...." && node src/send_to_ex.js "Message 25 ." && node src/send_to_ex.js "Message 26 ...." && node src/send_to_ex.js "Message 27 ." && node src/send_to_ex.js "Message 28 ...." && node src/send_to_ex.js "Message 29 ." && node src/send_to_ex.js "Message 30 ...." && node src/send_to_ex.js "Message 31 ." && node src/send_to_ex.js "Message 32 ...." && node src/send_to_ex.js "Message 33 ." && node src/send_to_ex.js "Message 34 ...." && node src/send_to_ex.js "Message 35 ." && node src/send_to_ex.js "Message 36 ...." && node src/send_to_ex.js "Message 37 ." && node src/send_to_ex.js "Message 38 ...." && node src/send_to_ex.js "Message 39 ." && node src/send_to_ex.js "Message 40 ...." && node src/send_to_ex.js "Message 41 ." && node src/send_to_ex.js "Message 42 ...." && node src/send_to_ex.js "Message 43 ." && node src/send_to_ex.js "Message 44 ...." && node src/send_to_ex.js "Message 45 ." && node src/send_to_ex.js "Message 46 ...." && node src/send_to_ex.js "Message 47 ." && node src/send_to_ex.js "Message 48 ...." && node src/send_to_ex.js "Message 49 ." && node src/send_to_ex.js "Message 50 ...."
COUNT=0
KEEP_SENDING=true
# do a loop to execute the script
while [ $KEEP_SENDING == true ]
do
    sleep 0.1
    echo "COUNT: ${COUNT}"
    COUNT=$((COUNT+1))
    node src/send_to_ex.js "Message ${COUNT} ."
    # exit if count is greater than 50
    if [ $COUNT -gt 50 ]
    then
        KEEP_SENDING=false
    fi
done