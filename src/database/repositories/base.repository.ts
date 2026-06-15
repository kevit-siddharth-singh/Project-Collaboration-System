import {
  HydratedDocument,
  Model,
  PopulateOptions,
  QueryFilter,
  UpdateQuery,
} from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<HydratedDocument<T>>) {}

  async create(document: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(document as unknown as HydratedDocument<T>);
  }

  async findOne(filter: QueryFilter<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  async find(filter: QueryFilter<T>): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter).exec();
  }

  findWithOptions(
    filter: QueryFilter<T>,
    options: {
      sort?: Record<string, 1 | -1>;
      skip?: number;
      limit?: number;
      populate?: PopulateOptions | PopulateOptions[];
    } = {},
  ): Promise<HydratedDocument<T>[]> {
    const { sort, skip, limit, populate } = options;
    let query = this.model.find(filter);
    if (sort) query = query.sort(sort);
    if (skip != null) query = query.skip(skip);
    if (limit != null) query = query.limit(limit);
    return (populate ? query.populate(populate) : query).exec() as Promise<
      HydratedDocument<T>[]
    >;
  }

  async findOneWithPopulate(
    filter: QueryFilter<T>,
    populate: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOne(filter)
      .populate(populate)
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async count(filter: QueryFilter<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async findOneAndUpdate(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOneAndUpdate(filter, update as UpdateQuery<HydratedDocument<T>>, {
        new: true,
      })
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  async delete(filter: QueryFilter<T>): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOneAndDelete(filter)
      .exec() as Promise<HydratedDocument<T> | null>;
  }
}
