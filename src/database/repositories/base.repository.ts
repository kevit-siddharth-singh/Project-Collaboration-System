import { HydratedDocument, Model, UpdateQuery } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Filter = Record<string, any>;

export abstract class BaseRepository<T> {
  constructor(readonly model: Model<HydratedDocument<T>>) {}

  async create(document: Partial<T>): Promise<HydratedDocument<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.model.create(document as any);
  }

  async findOne(filter: Filter): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  async find(filter: Filter): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter).exec();
  }

  async update(
    filter: Filter,
    update: UpdateQuery<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOneAndUpdate(filter, update as UpdateQuery<HydratedDocument<T>>, {
        new: true,
      })
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async delete(filter: Filter): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOneAndDelete(filter)
      .exec() as Promise<HydratedDocument<T> | null>;
  }
}
