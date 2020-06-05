import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import logger from 'morgan';
import mongoose from 'mongoose';

// Middlewares
import {validateJwt} from './middlewares/cognitojwt';

// Routes
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
const app = express();

// database setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/mydb';
const mongooseConfigs = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(mongoUri, mongooseConfigs);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(validateJwt({whitelist: ['/auth']}));

app.use('/auth', authRouter);
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

module.exports = app;
