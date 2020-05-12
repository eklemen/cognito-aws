import axios from 'axios';
global.fetch = require('node-fetch');
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
// Pool Id us-east-1_nyXFzxC6U
// arn:aws:cognito-idp:us-east-1:466107528484:userpool/us-east-1_nyXFzxC6U
// app client-id mjn55m9f4uaupmpa98cnmdkki


const poolData = {
  UserPoolId: "us-east-1_nyXFzxC6U",
  ClientId: "19ors40ekq6mfnd0mpsi95uj68"
};
const pool_region = "us-east-1";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
export const Register = (body, callback) => {
  const {name, email, password} = body;
  const attributeList = [];

  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
  userPool.signUp(name, password, attributeList, null, function (err, result) {
    if (err)
      callback(err);
    var cognitoUser = result.user;
    callback(null, cognitoUser);
  })
};

export const VerificationCode = (body, callback) => {
  const {username, code} = body
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(code, true, function(err, result) {
    if (err) {
      callback(err);
    }
    callback(null, result);
  });
};


export const Login = (body, callback) => {
  const {name, password} = body
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: name,
    Password: password
  });
  const userData = {
    Username: name,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      var accesstoken = result.getAccessToken().getJwtToken();
      callback(null, accesstoken);
    },
    onFailure: (function (err) {
      callback(err);
    })
  })
};

export const Validate = (token, callback) => {
  axios({
    url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`
  }).then(({data}) => {
      var pems = {};
      var keys = data['keys'];
      for(var i = 0; i < keys.length; i++) {
        var key_id = keys[i].kid;
        var modulus = keys[i].n;
        var exponent = keys[i].e;
        var key_type = keys[i].kty;
        var jwk = { kty: key_type, n: modulus, e: exponent};
        var pem = jwkToPem(jwk);
        pems[key_id] = pem;
      }
      var decodedJwt = jwt.decode(token, {complete: true});
      if (!decodedJwt) {
        console.log("Not a valid JWT token");
        callback(new Error('Not a valid JWT token'));
      }
      var kid = decodedJwt.header.kid;
      var pem = pems[kid];
      if (!pem) {
        console.log('Invalid token');
        callback(new Error('Invalid token'));
      }
      jwt.verify(token, pem, function(err, payload) {
        if(err) {
          console.log("Invalid Token.");
          callback(new Error('Invalid token'));
        } else {
          console.log("Valid Token.");
          callback(null, "Valid token");
        }
      });
  }).catch(err => callback(err))
};
