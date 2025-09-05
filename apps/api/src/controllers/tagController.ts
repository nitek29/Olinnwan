import status from 'http-status';
import { NextFunction, Request, Response } from 'express';

import { Tag } from '../../types/tag.js';
import { TagRepository } from '../../middlewares/repository/tagRepository.js';

export class TagController {
  private repository: TagRepository;

  public constructor(repository: TagRepository) {
    this.repository = repository;
  }

  public async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags: Tag[] = await this.repository.getAll();

      if (!tags.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any tag found' });
        return;
      }

      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id: string = req.params.tagId;

      const tag: Tag | null = await this.repository.getOne(id);

      if (!tag) {
        res.status(status.NOT_FOUND).json({ error: 'Tag not found' });
        return;
      }

      res.json(tag);
    } catch (error) {
      next(error);
    }
  }
}
