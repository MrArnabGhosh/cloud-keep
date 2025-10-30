import "dotenv/config";
import express from "express"
import { Request, Response } from "express";
import { Env } from "./config/env.config";
import { CorsOptions } from "cors";
import { UnauthorizedException } from "./utils/app-error";
import cors from "cors";
import helmet from "helmet";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { log } from "console";
import { logger } from "./utils/logger";
import { connectDatabase, disConnectDatabase } from "./config/database.config";

const app=express();
const BASE_PATH=Env.BASE_PATH;

const allowedOrigins =Env.ALLOWED_ORIGINS?.split(',');

const corsOptions:CorsOptions={
    origin(origin,callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);
        }
        else{
            const errMsg= `CORS Error: Origin ${origin} is not allowedd`
            callback(new UnauthorizedException(errMsg),false)
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(helmet())

//home route
app.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Welcome to CloudKeep Backend API",
    });
  }),
);

app.use(errorHandler);

async function startServer(){
    try {
        await connectDatabase()
        const server=app.listen(Env.PORT,()=>{
            logger.info(`server is listening on port ${Env.PORT} in ${Env.NODE_ENV} mode`,)           
        })
        const shutdownSingnals:NodeJS.Signals[]=['SIGTERM','SIGINT'];

        shutdownSingnals.forEach((signal)=>{
            process.on(signal,async()=>{
                logger.info(`${signal} recieved: shutting down server gracefully`);

                try {
                server.close(()=>{
                    logger.info(`HTTP server closed successfully`)
                })

                //disconnect db
                await disConnectDatabase()
                process.exit(0);
            } catch (error) {
                logger.error(`Error occured during server shutdown`,error);
                process.exit(1);
            }
            });
            
        })
    } catch (error) {
        logger.error(`Failed to start server`,error)
        process.exit(1);
    }
}

startServer()