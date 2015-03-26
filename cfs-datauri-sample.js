var stores = [
  new FS.Store.FileSystem("org"),
  new FS.Store.FileSystem("thumb", {
    transformWrite: function (fileObj, readStream, writeStream) {

      /*
      resize to 64x64 , print errors
       */
      gm(readStream, fileObj.name()).resize('64', '64').stream(function (err, stdout, stderr) {
        stdout.pipe(writeStream);
        stderr.pipe(process.stderr);
        if (err) {
          console.error("error", err)
        }
      });
    }
  })
];


//the collections
var Images = new FS.Collection("images", {
  stores: stores
});

//create a datauri from identicon
var createDataUri = function () {
  /** @type {Crypto} */
  var crypto = Npm.require('crypto');
  var myValueToHash = "test_" + new Date().getTime();
  /** @type {string} */
  var hash = crypto.createHash('md5').update(myValueToHash).digest('hex');

  /** @type {Identicon} */
  var identicon = new Identicon(hash, 256).toString();
  /** @type {string} */
  var dataUri = "data:image/png;base64," + identicon.toString();
  return dataUri;
};


var createHttpUrl = function () {
  var face = HTTP.get("http://uifaces.com/api/v1/random").data;
  var faceUrl = face.image_urls.epic;
  return faceUrl;
};
if (Meteor.isServer) {
  Meteor.startup(function () {


    console.log("INSERTING FROM HTTP URL");
    var faceUrl = createHttpUrl();
    var image = new FS.File(faceUrl);
    Images.insert(image)



    console.log("INSERTING WITH DATAURI");
    var dataUri = createDataUri();
    
    var image2 = new FS.File(dataUri);

    Images.insert(image2)

  });
}
if (Meteor.isClient) {
  Template.hello.helpers({
    "images": function () {
      return Images.find()
    }
  })
}
