$( document ).ready(function() {
  console.log( "Page loaded" );
  //regitser events
  generateKeysEvent()
});

function generateKeysStatus (data) {
    $( "#generate-keys-status" ).html(data);
}

function generateKeysEvent () {
  $( "#generate-keys" ).click(function() {
    generateKeysStatus("Generating keys...")
    setTimeout(function(){
      generateKeys();
    }, 2000);
  });
}

function sendToDatabase(publicKey, user) {
  console.log('started sending to database for user ' + user);

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
        generateKeysStatus("Found your existing user id, lost your key? Go to /forget of this app");;
      }
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