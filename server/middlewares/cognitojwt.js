import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';

let retryCount = 0;
let pems;
const getPems = () => {
  axios({
    url: `https://cognito-idp.${process.env.AWS_POOL_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`
  }).then(({data}) => {
    const pemsObj = {};
    const keys = data['keys'];
    for(let i = 0; i < keys.length; i++) {
      const key_id = keys[i].kid;
      const modulus = keys[i].n;
      const exponent = keys[i].e;
      const key_type = keys[i].kty;
      const jwk = { kty: key_type, n: modulus, e: exponent};
      pemsObj[key_id] = jwkToPem(jwk);
    }
    pems = pemsObj;
  }).catch(err => {
    if (retryCount<9) {
      console.warn(`Failed to retrieve jwks, retrying...${9-retryCount} attempts left.`);
      retryCount++;
      getPems()
    } else {
      console.error('Could not fetch jwks:  ' + err);
    }
  })
};
if (!pems) getPems();

export const validateJwt = (opts) => (req, res, next) => {
  if (opts.whitelist.some(u => req.url.includes(u))) {
    next();
  } else {
    const {token} = req.cookies;
    const decodedJwt = jwt.decode(token, {complete: true});
    if (!decodedJwt) return res.sendStatus(401);

    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
      return res.sendStatus(401);
    }
    jwt.verify(token, pem, (err, data) => {
      if(err) {
        return res.status(401).json('Invalid JWT');
      } else {
        req.user = {...data, username: data['cognito:username']};
        next();
      }
    });
  }
};