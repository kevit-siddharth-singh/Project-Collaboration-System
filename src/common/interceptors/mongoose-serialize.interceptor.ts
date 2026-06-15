import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function serialize(value: unknown): unknown {
  if (value instanceof Document) {
    return serialize(value.toObject());
  }
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(serialize);
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === '__v') continue;
      result[key] = serialize(val);
    }
    return result;
  }
  return value;
}

@Injectable()
export class MongooseSerializeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map(serialize));
  }
}
