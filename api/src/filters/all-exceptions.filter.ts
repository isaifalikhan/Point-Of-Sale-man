import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private isDatabaseFailure(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    const name = exception.constructor.name;
    if (name.includes('Prisma')) return true;
    const m = exception.message;
    return /Server selection timeout|MongoNetworkError|TopologyDescription|ECONNREFUSED|ENOTFOUND|querySrv|Kind:.*Server selection/i.test(
      m,
    );
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message: string | string[] }).message;
        message = Array.isArray(m) ? m.join('; ') : m;
      }
    } else if (this.isDatabaseFailure(exception)) {
      const err = exception as Error;
      this.logger.error(err.stack ?? err.message);
      status = HttpStatus.SERVICE_UNAVAILABLE;
      const detail = err.message ?? '';
      if (/empty database name not allowed/i.test(detail)) {
        message =
          'DATABASE_URL is missing the database path after the hostname. Use …mongodb.net/your_db_name?retryWrites=true — not …mongodb.net/?retryWrites=. Pick any name (e.g. resto_saas); Prisma will use that MongoDB database.';
      } else {
        message =
          'Cannot reach the database. Check DATABASE_URL in apps/api/.env, that MongoDB Atlas is running (not paused), and Network Access allows your IP.';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.stack ?? exception.message);
    } else {
      this.logger.error(String(exception));
    }

    if (status >= 500 && status !== HttpStatus.SERVICE_UNAVAILABLE) {
      message = 'Something went wrong on the server. Please try again.';
    } else if (typeof message === 'string' && message.length > 380) {
      message = `${message.slice(0, 377)}…`;
    }

    res.status(status).json({
      statusCode: status,
      message: typeof message === 'string' ? message : String(message),
    });
  }
}
