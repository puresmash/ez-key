const ipc = require('electron').ipcRenderer;
const readline = require('readline');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let inputFile = path.resolve(__dirname, '../../../../input.txt');
if(isDev){
    inputFile = `${__dirname}/input.txt`;
}
const lineReader = readline.createInterface({
    input : fs.createReadStream(inputFile)
});

// Include jquery according https://github.com/electron/electron/issues/254
window.$ = window.jQuery = require('jquery');

$(function(){
    $('#toggle-switch').on('click', (event)=>{
        console.log(event.target);
        $(event.target).toggleClass('active');
        if($(event.target).is('[is-selected]')){
            $(event.target).removeAttr('is-selected');
            ipc.send('SwitchOS', false);
        }
        else{
            $(event.target).attr('is-selected', 'is-selected');
            ipc.send('SwitchOS', true);
        }

    });
});

let count = 0;
lineReader.on('line', function(line){
    console.log('line from file:', line);
    /*Load Group*/
    if(/^#+/.test(line)){
        count = 0;
        let groupName = line.replace(/^#+/, '').trim();
        if($('div#card span#title').attr('is-init') === 'true'){
            //create new card
            $(`<div id="card">
                    <div id="headerDiv">
                        <span id="title" is-init="true">${groupName}</span>
                    </div>
                    <div id="listDiv">
                        <!--Auto generated field-->
                    </div>
                </div>`).insertAfter($('div#card').last());
        }
        else{
            //first group
            $('div#card span#title').attr('is-init', 'true');
            $('div#card span#title').text(groupName);
        }
        return;
    }

    /*Load Content*/
    var ary = line.split(' ');
    if(ary.length<2){
        return;
    }
    if(!ary[2]){
        ary[2] = "Undefined Description";
    }

    /*DOM Insert*/
    let newButton = $(`<div id="auth-button" name='${ary[0]}' pwd='${ary[1]}'>
                            ${ary[0]} (${ary[2]})
                        </div>`);
    if(count == 0){
        newButton.appendTo($('div#listDiv').last())
    }
    else{
        newButton.insertAfter($('div#auth-button').last());
    }
    binding();
    count++;
});

ipc.on('traceBug', function (event, arg) {
    console.log(arg);
});

function binding(){
    let authBtn = $('div#auth-button').last();
    authBtn.on('click', ()=>{
        let name = authBtn.attr('name');
        let pwd = authBtn.attr('pwd');
        ipc.send('InvokeAction', [name, pwd]);
    });

}
