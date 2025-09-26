const admin = require("firebase-admin");
const serviceAccount = require("./vitadoc-d7115-firebase-adminsdk-fbsvc-8794f7033f.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});