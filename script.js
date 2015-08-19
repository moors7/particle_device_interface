
//Get you accesstoken from LocalStorage if you've logged in before.
var access_token = localStorage.getItem("access_token");

//Delete accesstoken from LocalStorage, and reload page.
function logOut() {
    localStorage.removeItem("access_token");
    window.location.reload();
}

//replace Log-in button with Log-out button.
function showLogout(){
  document.getElementById('log-out').style.display = 'flex';
  document.getElementById('spark-login').style.display = 'none';
}

//execute function with possible arguments, and empty argument field.
function execute(deviceId, func) {
  console.log(deviceId);
  argument = document.getElementById(func + 'input'); 
  spark.callFunction(deviceId,func,argument.value,null);
  argument.value = "";
};

//Get variable
function update(deviceId, variable) {
  spark.getVariable(deviceId,variable,function(err, data){
    console.log(data);
    variableValue = document.getElementById(variable + deviceId);
    variableValue.value = data.result;
  });
};

//The login button logic from the library. Saves accestoken to LocalStorage.
sparkLogin(function(data){	
  document.getElementById('spark-login-button').style.backgroundColor="#00E31A";
  document.getElementById('spark-login-button').innerHTML = 'Logging in, please wait.';
  console.log(data);		
  access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
      LoggedIn(data);
});

document.getElementById('spark-login-button').innerHTML = 'Login to Particle';

//If an accesstoken is still present from a login, then log in automatically.
if (access_token){
  //console.log(access_token);
  //console.log(document.getElementById('spark-login-button'));
  document.getElementById('spark-login-button').style.backgroundColor="#00E31A";
  document.getElementById('spark-login-button').innerHTML = 'Logging in, please wait.';
  spark.login({accessToken: access_token }, LoggedIn);
}



/* This gets the nessecary files from your server. This should obviously be combined to one function */
/*======================================================================================*/
var blob;
var blob1;
var blob2;
var blob3;

var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://url/path/to/system-part1-v0.4.4-rc.3-photon.bin', true);
xhr.responseType = 'blob';

xhr.onload = function(e) {
  if (this.status == 200) {
    // Note: .response instead of .responseText
    blob1 = new Blob([this.response], {type: 'binary'});
    console.log('Got the first .bin. splendid.');
  }
};
xhr.send();
/*======================================================================================*/
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://url/path/to/system-part2-v0.4.4-rc.3-photon.bin', true);
xhr.responseType = 'blob';

xhr.onload = function(e) {
  if (this.status == 200) {
    // Note: .response instead of .responseText
    blob2 = new Blob([this.response], {type: 'binary'});
    console.log('Got the second .bin. splendid.');
  }
};
xhr.send();
/*======================================================================================*/
var xhr = new XMLHttpRequest();
xhr.open('GET', 'url/path/to/tinker-v0.4.4-rc.2-photon.bin', true);
xhr.responseType = 'blob';

xhr.onload = function(e) {
  if (this.status == 200) {
    // Note: .response instead of .responseText
    blob3 = new Blob([this.response], {type: 'binary'});
    console.log('Got the Tinker .bin. splendid.');
  }
};
xhr.send();
/*======================================================================================*/


function PhotonUpdate(deviceId, part){
  console.log(deviceId);
  
  if (part == 1){
    blob = blob1;
  }
  if (part == 2){
    blob = blob2;
  }
  if (part == 3){
    blob = blob3;
    if (confirm("Make sure you have updated your Photon to 0.4.3rc2 before flashing Tinker or it may not work! \n \n Do you wish to continue?") !== true) {
      return;
    }
  }
  
  var data = new FormData();
  data.append("file", blob);
  data.append("file_type", "binary");

  var xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
    }
  });

  xhr.open("PUT", "https://api.spark.io/v1/devices/" + deviceId + '?access_token=' + access_token);

  xhr.send(data);    
  
  alert("Your Photon will now be updated. Do NOT press the next update button until your Photon has returned to breathing cyan. This process can take a couple of minutes, during which the LED will blink various colours.");
  
  /* Tried to make the signal work. Didn't really work out. Ignore the stuff below... */
  /*
  var signalCb = function(err, data) {
    if (err) {
      console.log('An error occurred while flashing the core:', err);
    } else {
      console.log('Core flashing started successfully:', data);
    }
  };
  
  var file;
  
  switch (part){
    case 1:
      file = 'system-part1-0.4.3-photon';
      break;
    case 2:
      file = 'system-part2-0.4.3-photon';
      break;
  }
  
  //spark.signalCore(deviceId, 1, signalCb);
  //spark.renameCore(deviceId, 'test-name', signalCb);
  spark.flashCore('deviceId', ['firmware.bin'], signalCb);
  //spark.flashTinker(deviceId, signalCb);
  
  */
}

//everything that happens after logging in.
//This fills the fields with the relevant data, like function/variable/core names.
function LoggedIn(data){
  var devicesAt = spark.getAttributesForAll();
  console.log(access_token);
  //display events
  $('#events').append(
    '<a class="btn btn-primary btn-lg btn-block" href="https://api.spark.io/v1/devices/events/?access_token=' + access_token + '" target="_blank">Click here to see your events (opens in a new window)</a>'
  );
  
  devicesAt.then(
    function(data){
      console.log('Core attrs retrieved successfully:', data);
      for (var i = 0; i < data.length; i++) {
        console.log('Device name: ' + data[i].name);
        console.log('- connected?: ' + data[i].connected);

        //display status
        if (data[i].connected == true){ 
            status = "online";
            alerttype = "alert alert-success";				
        }
        else{
            status = "offline";
            alerttype = "alert alert-danger";
        }							
        
        
        if ((data[i].productId == 6 || data[i].product_id == 6) && data[i].connected == true){          
          console.log('THERE\'S A PHOTON IN DA HAUSEEEEEEEE. So yeah, now we can offer an update...');
          console.log(data[i].id);
          
          $('#status tbody').append(
            '<tr class="' + alerttype + '">' +
              '<td><strong>' + data[i].name + '</strong></td>' +
              '<td>' + data[i].id + '</td>' +
              '<td>' + status + '&nbsp;&nbsp;' + 
              '<div class="btn-group" role="group">' +
                '<button type="button" class="btn btn-warning btn-xs" onclick="PhotonUpdate(\'' + data[i].id + '\', \'1\'); this.disabled=true; this.nextElementSibling.disabled=false;">Update 1</button>' +
                '<button type="button" class="btn btn-warning btn-xs" disabled onclick="PhotonUpdate(\'' + data[i].id + '\', \'2\'); this.disabled=true; this.nextElementSibling.disabled=false;">Update 2</button>' +
                '<button type="button" class="btn btn-info btn-xs" onclick="PhotonUpdate(\'' + data[i].id + '\', \'3\'); this.disabled=true;">Tinker</button>' +
              '</td>' + 
            '</div>' +
            '</tr>'              
          );
        }
        else {
          $('#status tbody').append(
            '<tr class="' + alerttype + '"><td><strong>' + data[i].name + '</strong></td>' +
            '<td>' + data[i].id + '</td>' +
            '<td>' + status + '</td></tr>'
          );
        }           

        
        //display functions	
        console.log('- functions: ' + data[i].functions);
        if (data[i].functions != null) {	
          for (func in data[i].functions) {
            functionName = data[i].functions[func]
            $('#functions tbody').append(
              '<tr><td><strong>' + data[i].name + '</strong></td>' +
              '<td>' + functionName + '</td>' +
              //'<td><input class="form-control" type="text" id="' + functionName + '" value=""></td>' +
              //'<td><button class="btn btn-default form-control"  onclick="execute(\'' + data[i].id + '\', \'' + functionName + '\')">Execute</button></td>' + 

              '<td><div class="input-group input-group-sm">' + 
                    '<input type="text" class="form-control" placeholder="Arguments?" id="' + functionName + 'input">'+
                    '<span class="input-group-btn">' +
                      '<button class="btn btn-default" type="button" onclick="execute(\'' + data[i].id + '\', \'' + functionName + '\')">go!</button>'+
                    '</span>'+
                '</div></td>' +
              '</tr>'
            );						
          }
        }
          
        //display variables
        console.log('- variables: ');			
        if (data[i].variables != null) {	
            for (variable in data[i].variables) {
              var type = data[i].variables[variable];
              console.log("variable: " + variable + " type: " + type);

              $('#variables tbody').append(
                '<tr><td><strong>' + data[i].name + '</strong></td>' +
                '<td>' + variable + '</td>' +
                //'<td id="' + variable + '">?</td>' +
                //'<td><button class="btn btn-default form-control" onclick="update(\'' + data[i].id + '\', \'' + variable + '\')">Update</button></td></tr>'

                '<td><div class="input-group input-group-sm">' + 
                      '<input type="text" class="form-control" placeholder="Click Get!" readonly id="' + variable + data[i].id + '">' +
                      '<span class="input-group-btn">' +
                        '<button class="btn btn-default" type="button" onclick="update(\'' + data[i].id + '\', \'' + variable + '\')">Get!</button>' +
                      '</span>' +
                  '</div></td>' +
                '</tr>'
              );						
            }
        }
        
        
        

        console.log("\n");
      }
      $('#status tbody').append(
        '<tr class="warning">'+
          '<td colspan="3">Clicking the update buttons will allow you to upgrade your system firmware to 0.4.4-rc3. Click one first, wait untill that is finished, then, and only then, click two. <br/>' +
          'These updates can take several minutes each. Click them only ONCE! WAIT UNTIL YOUR DEVICE IS BACK TO BREATHING CYAN! Only after updating your Photon to the latest version will the Tinker firmware work. Do not attempt to flashing that beforehand, for it will not work.</td>' +
        '</tr>'
      );
      
      $('#functions').show();
      $('#variables').show();
      $('#status').show();
      $('#events').show();
      showLogout();
      
      
      
    },
    function(err) {
      console.log('API call failed: ', err);
    }
  );	
};