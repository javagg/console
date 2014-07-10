#!/bin/bash
# To continuously check for changes and compile as needed run this script with --daemon

if ! type "lessc" > /dev/null; then
    echo "Please install the less compiler (npm install -g less)"
    exit
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

compile() {
    echo $(date +"%H:%M:%S")" - Compiling bootstrap.less"
    lessc -x $DIR"/bootstrap.less" $DIR"/../css/compiled/bootstrap.min.css"

    echo $(date +"%H:%M:%S")" - Compiling theme.less"
    lessc -x $DIR"/theme.less" $DIR"/../css/compiled/bootstrap-theme.min.css"
}

daemon() {
    chsum1=""

    while [[ true ]]
    do
        chsum2=`find $DIR -type f -exec md5 {} \;`
        if [[ $chsum1 != $chsum2 ]] ; then
            compile
            chsum1=`find $DIR -type f -exec md5 {} \;`

            echo ""
        fi
        sleep 1
    done
}

if [[ "$*" == *--daemon* ]]
then
    daemon
else
    compile
fi
