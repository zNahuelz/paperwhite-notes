// noinspection SqlNoDataSourceInspection

import { getDatabase } from '../index';
import { Book } from '../types/book';

function mapRowToBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description ?? undefined,
    cover: row.cover ?? undefined,
    highlightsAmount: row.highlightsAmount ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at),
    isDeleted: Boolean(row.is_deleted),
  };
}

export class BookRepository {
  static create(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Book {
    const now = new Date().toISOString();
    const result = getDatabase()
      .prepare(
        `INSERT INTO BOOKS (title, author, description, cover, created_at, is_deleted) VALUES (?,?,?,?,?,0)`
      )
      .run(data.title, data.author, data.description ?? null, data.cover ?? null, now);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  static findById(id: number): Book | null {
    const row = getDatabase()
      .prepare(`SELECT * FROM books WHERE id = ? AND is_deleted = 0`)
      .get(id);

    return row ? mapRowToBook(row) : null;
  }

  static findByTitle(title: string): Book | null {
    const row = getDatabase()
      .prepare(`SELECT * FROM books WHERE title = ? AND is_deleted = 0`)
      .get(title);
    return row ? mapRowToBook(row) : null;
  }

  static findAll(showDeleted: boolean = false): Book[] {
    const deletedBit = showDeleted ? 1 : 0;
    return getDatabase()
      .prepare(
        `SELECT b.*, COUNT(h.id) AS highlightsAmount FROM books b 
        LEFT JOIN highlights h ON h.book_id = b.id 
        AND h.is_deleted = 0 
        WHERE (b.is_deleted = 0 OR ? = 1)
        GROUP BY b.id ORDER BY b.created_at DESC`
      )
      .all(deletedBit)
      .map(mapRowToBook);
  }

  static update(
    id: number,
    data: Partial<Omit<Book, 'id' | 'createdAt' | 'isDeleted'>>
  ): Book | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.author !== undefined) {
      fields.push('author = ?');
      values.push(data.author);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.cover !== undefined) {
      fields.push('cover = ?');
      values.push(data.cover);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    getDatabase()
      .prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`)
      .run(...values);

    return this.findById(id);
  }

  static softDelete(id: number): boolean {
    const result = getDatabase()
      .prepare(`UPDATE books SET is_deleted = 1, updated_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), id);

    return result.changes > 0;
  }

  static restore(id: number): boolean {
    const result = getDatabase()
      .prepare(`UPDATE books SET is_deleted = 0, updated_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), id);
    return result.changes > 0;
  }

  static hardDelete(id: number): boolean {
    const result = getDatabase().prepare(`DELETE FROM books WHERE id = ?`).run(id);
    return result.changes > 0;
  }
}
