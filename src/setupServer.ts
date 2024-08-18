import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import { config } from '@root/config';
import Logger from 'bunyan';
import applicationRoutes from '@root/routes';
import HTTP_STATUS from 'http-status-codes';
import { CustomError, IErrorResponse } from '@shared/helpers/error-handler';



const SERVER_PORT = 3000;
const log: Logger = config.createLogger('server');


export class DigitalMarketApiServer{
private app: Application;

constructor(app: Application){
    this.app = app;
}

public start():void{
  this.securityMiddleware(this.app);
  this.standardMiddleware(this.app);
  this.routesMiddleware(this.app);
  this.globalErrorHandler(this.app);
  this.startServer(this.app);
}

private securityMiddleware(app: Application): void {

  app.use(helmet());
  app.use(hpp());
  app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
      }
    ));//enable cors for all routes and origin
}

private standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({limit: '50mb'}));
  app.use(urlencoded({extended:true, limit: '50mb'}));
}

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {

    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try{
      const httpServer : http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch(error){
      log.error(error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

}
