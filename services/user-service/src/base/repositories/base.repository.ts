import {
  DataSource,
  DeepPartial,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

/**
 * A base repository class extending TypeORM's Repository with additional utility methods.
 * Provides common operations like create, find, update, and delete.
 * @template T - The entity type managed by this repository.
 */
export class BaseRepository<T> extends Repository<T> {
  /**
   * Initializes a new instance of BaseRepository.
   * @param target - The target entity to manage.
   * @param dataSource - The TypeORM DataSource instance.
   */
  constructor(target: EntityTarget<T>, dataSource: DataSource) {
    super(target, dataSource.createEntityManager());
  }

  /**
   * Creates and saves a new entity in the database.
   * @param entity - The partial entity to create.
   * @returns The saved entity.
   */
  async createEntity(entity: DeepPartial<T>): Promise<T> {
    const item = this.create(entity);
    return this.save(item);
  }

  /**
   * Retrieves all entities of the target type.
   * @returns An array of all entities.
   */
  async findAll(): Promise<T[]> {
    return this.find();
  }

  /**
   * Finds a single entity by its ID.
   * @param id - The ID of the entity to find.
   * @returns The entity with the specified ID, or undefined if not found.
   */
  async findById(id: string): Promise<T> {
    return this.findOne({ where: { id } } as FindOneOptions);
  }

  /**
   * Updates an entity that matches the given criteria.
   * If no matching entity is found, the operation is skipped.
   * @param criteria - The criteria to match the entity to update.
   * @param dataToUpdate - The data to update the entity with.
   */
  async updateEntity(
    criteria: FindOptionsWhere<T>,
    dataToUpdate: Partial<T>,
  ): Promise<void> {
    const entityToUpdate = await this.findOne({
      where: { ...criteria },
    });
    if (!entityToUpdate) {
      // Handle error if entity not found
      return;
    }
    Object.assign(entityToUpdate, dataToUpdate);
    await this.save(entityToUpdate);
  }

  /**
   * Deletes an entity by its ID.
   * @param id - The ID of the entity to delete.
   */
  async deleteEntity(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Finds entities matching the given query.
   * @param query - The partial entity query to match.
   * @returns An array of entities matching the query.
   */
  async findByQuery(query: Partial<T>): Promise<T[]> {
    return this.find({ where: query as FindOptionsWhere<T> });
  }

  /**
   * Finds a single entity matching the given query and optional relations.
   * @param query - The partial entity query to match.
   * @param relations - Optional array of relation names to include.
   * @returns The entity matching the query, or undefined if not found.
   */
  async findOneByQuery(query: Partial<T>, relations?: string[]): Promise<T> {
    return this.findOne({ where: query as FindOptionsWhere<T>, relations });
  }
}
