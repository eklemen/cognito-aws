import {Register, Login, Validate, VerificationCode} from '../services/authService';

export const register = (req, res) => {
  Register(req.body, (err, result) => {
    if(err) res.json(err);
    res.send(result);
  })
};

export const login = (req, res) => {
  Login(req.body, (err, result) => {
    if(err) res.json(err);
    res.json(result);
  })
};

export const validate_token = (req, res) => {
  const {token} = req.body;
  let validate = Validate(token,(err, result) => {
    if(err) res.json(err.message);
    res.json(result);
  })
};

export const verify_code = (req, res) => {
  VerificationCode(req.body, (err, result) => {
    if(err) res.json(err);
    res.json(result);
  })
};