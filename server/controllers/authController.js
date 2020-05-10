import {Register, Login, Validate, VerificationCode} from '../services/authService';

export const register = (req, res) => {
  let register = Register(req.body, (err, result) => {
    if(err) res.send(err);
    res.send(result);
  })
};

export const login = (req, res) => {
  let login = Login(req.body, (err, result) => {
    if(err) res.send(err);
    res.send(result);
  })
};

export const validate_token = (req, res) => {
  const {token} = req.body;
  let validate = Validate(token,function(err, result){
    if(err) res.send(err.message);
    res.send(result);
  })
};

export const verify_code = (req, res) => {
  let verifyCode = VerificationCode(req.body, (err, result) => {
    if(err) res.send(err);
    res.json(result);
  })
};