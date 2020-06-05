import axios from 'axios';
global.fetch = require('node-fetch');
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';

const poolData = {
  UserPoolId: process.env.AWS_USER_POOL_ID,
  ClientId: process.env.AWS_CLIENT_ID
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


export const Login = (body, cb) => {
  const {name, password} = body;
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: name,
    Password: password
  });
  const userData = {
    Username: name,
    Pool: userPool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const user = {
        token: result.getIdToken().getJwtToken(),
        ...result.getIdToken().payload
      };
      cb(null, user);
    },
    onFailure: (function (err) {
      cb(err);
    })
  })
};
