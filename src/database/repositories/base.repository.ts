/**
 * Base repository Contains the basic CRUD operations for all the repositories :
 * create()
 * findOne()
 * findById()
 * find()
 * update()
 * delete()
 */
import { FilterQuery, HydratedDocument, Model } from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<HydratedDocument<T>>) {}

  async create(document: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(document);
  }

  async findOne(filter: FilterQuery<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  async find(filter: FilterQuery<T>): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter).exec();
  }

  async delete(filter: FilterQuery<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndDelete(filter).exec();
  }
}
