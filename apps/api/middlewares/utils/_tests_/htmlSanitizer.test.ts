import { describe, it, expect, vi, beforeEach } from 'vitest';

import status from 'http-status';
import type { Request, Response } from 'express';

import htmlSanitizer from '../htmlSanitizer.js';
import sanitizeHtml from 'sanitize-html';
import createHttpError from 'http-errors';

describe('Html sanitizer middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const next = vi.fn();

  req = { body: {} };
  res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  };

  vi.mock('sanitize-html', () => ({
    default: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should not modify non-string fields', () => {
    req.body = {
      name: 'John <script>alert("xss")</script>',
      comment: '<b>Hello</b>',
    };

    htmlSanitizer(req as Request, res as Response, next);

    expect(req.body.name).toBe(
      sanitizeHtml('John <script>alert("xss")</script>'),
    );
    expect(req.body.comment).toBe(sanitizeHtml('<b>Hello</b>'));
    expect(next).toHaveBeenCalled();
  });

  it('Should handle empty body', () => {
    req.body = {};

    htmlSanitizer(req as Request, res as Response, next);

    expect(req.body).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('Should call next with error if sanitizeHtml throws', () => {
    req.body = {
      name: '<script>alert("xss")</script>',
    };

    const mockError = createHttpError(
      status.BAD_REQUEST,
      'Sanitization failed',
    );
    vi.mocked(sanitizeHtml).mockImplementation(() => {
      throw mockError;
    });

    htmlSanitizer(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Sanitization failed',
        status: status.BAD_REQUEST,
      }),
    );
  });
});
