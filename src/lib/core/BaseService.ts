export abstract class BaseService<TRepo extends object = object> {
  protected readonly repo: TRepo;

  constructor(repo: TRepo) {
    this.repo = repo;
  }
}
