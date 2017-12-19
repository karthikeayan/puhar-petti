$( document ).ready(function() {
  console.log( "Page loaded" );
  //regitser events
  generateKeysEvent()
  submitFeedbackEvent()
  // uploadKeyEvent()
});

function generateKeysStatus (data) {
  $( "#generate-keys-status" ).html(data);
}

function submitFeedbackStatus(data){
  $("#submit-feedback-status").html(data);
}

function generateKeysEvent () {
  $( "#generate-keys" ).click(function() {
    generateKeysStatus("Generating keys...")
    setTimeout(function(){
      generateKeys();
    }, 2000);
  });
}

function submitFeedbackEvent(){
  $("#submit-feedback").click(function(){
    submitFeedbackStatus("Submitting your feedback...");

    var user = $("#user-id").val();
    var feedback = '||' + $("#feedback-input").val();
    var newEncrypted = "";
    var oldEncrypted = "";

    $.ajax({
      type: "GET",
      url: "keys/" + user,
      success: function(res){
        var keyObj = forge.pki.publicKeyFromPem(res.key);
        oldEncrypted = res.encrypted;
        newEncrypted = keyObj.encrypt(feedback);
        newEncrypted = oldEncrypted + newEncrypted
        console.log(newEncrypted);
        submitFeedback(user, newEncrypted);
      },
      error: function(err){
        console.log("Public key fetch for the user failed!");
      }
    })
  });
}

function uploadKeyEvent(keyContents){
    console.log(keyContents);

    var ownUser = $("#own-user").val();
    var keyObj = forge.pki.privateKeyFromPem(keyContents);
    var decrypted = "";
    
    $.ajax({
      type: "GET",
      url: "keys/" + ownUser,
      success: function(res){
        decrypted = keyObj.decrypt(res.encrypted);
        console.log(decrypted);
      },
      error: function(err){
        console.log("Couldn't fetch user " + ownUser + " feedbacks!");
      }
    })
}

function sendToDatabase(publicKey, user) {
  console.log('started sending key to database for user ' + user);

  var data = {
    user: user,
    publicKey: publicKey
  }

  $.ajax({
    type: "POST",
    url: "keys",
    data: data,
    dataType: "json",
    success: function(res){
      console.log(res);
    },
    error: function(err){
      console.log("Post to database failed!");

      if (err.status === 409){
        generateKeysStatus("Found your existing user id, lost your key? Go to /forget of this app");
      }
    }
  });
}

function submitFeedback(user, encryptedFeedback){
  console.log('started sending feedback for user ' + user);

  var data = {
    user: user,
    encrypted: encryptedFeedback
  }

  $.ajax({
    type: "POST",
    url: "keys/" + user,
    data: data,
    dataType: "json",
    success: function(res){
      console.log(res);
      submitFeedbackStatus("Feedback submitted");
    },
    error: function(err){
      console.log("Post to database failed!");
    }
  });
}

function generateKeys() {
  var rsa = forge.pki.rsa;
  rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
    if (err) {
      generateKeysStatus("Failed to generate keys")
      console.log("unable to generate keys. " + err)
      return
    }
    generateKeysStatus("Keys Generated")
    console.log(JSON.stringify(keypair.privateKey));
    var publicPem = forge.pki.publicKeyToPem(keypair.publicKey);
    console.log('This is your public key');
    console.log(publicPem);
    console.log('This is your private key');
    var privatePem = forge.pki.privateKeyToPem(keypair.privateKey);
    console.log(privatePem);
    var user = $("#new-user-id").val()
    sendToDatabase(publicPem, user);
    saveFile("key.pem", "application/x-pem-file", privatePem);
  });

  //below function is from 
  //https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
  function saveFile (name, type, data) {
    if (data != null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type: type }), name);
    var a = $("<a style='display: none;'/>");
    var url = window.URL.createObjectURL(new Blob([data], {type: type}));
    a.attr("href", url);
    a.attr("download", name);
    $("body").append(a);
    a[0].click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}

function readSingleFile(evt) {
  //Retrieve the first (and only!) File from the FileList object
  var f = evt.target.files[0]; 

  if (f) {
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      uploadKeyEvent(contents);
    }
    r.readAsText(f);
  } else { 
    alert("Failed to load file");
  }
}

document.getElementById('private-key-upload').addEventListener('change', readSingleFile, false);