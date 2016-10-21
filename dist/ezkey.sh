
# customized
sep=KEYCODE_TAB

echo account=$1 password=$2

adb shell input text "$1"
adb shell input keyevent $sep
adb shell input text "$2"
