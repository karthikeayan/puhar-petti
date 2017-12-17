

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
    generateKeys()
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
    var pem = forge.pki.publicKeyToPem(keypair.publicKey);
    console.log(pem);
    var pem = forge.pki.privateKeyToPem(keypair.privateKey);
    console.log(pem);    
    console.log(keypair.publicKey);
    saveFile("key.pem", "application/x-pem-file", pem);
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