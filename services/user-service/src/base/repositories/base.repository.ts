import {
  DataSource,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
  constructor(target: EntityTarget<T>, dataSource: DataSource) {
    super(target, dataSource.createEntityManager());
  }
  async createEntity(entity: T): Promise<T> {
    return this.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.find();
  }

  async findById(id: string): Promise<T> {
    return this.findOne({ where: { id } } as FindOneOptions);
  }

  async updateEntity(id: string, dataToUpdate: Partial<T>): Promise<void> {
    const entityToUpdate = await this.findById(id);
    if (!entityToUpdate) {
      // Handle error if entity not found
      return;
    }
    Object.assign(entityToUpdate, dataToUpdate);
    await this.save(entityToUpdate);
  }

  async deleteEntity(id: string): Promise<void> {
    await this.delete(id);
  }

  async findByQuery(query: Partial<T>): Promise<T[]> {
    return this.find({ where: query as FindOptionsWhere<T> });
  }
}
