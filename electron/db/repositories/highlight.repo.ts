// noinspection SqlNoDataSourceInspection

import { getDatabase } from '..';
import { Highlight } from '../types/highlight';

function mapRowToHighlight(row: any): Highlight {
  return {
    id: row.id,
    bookId: row.book_id,
    date: new Date(row.date),
    location: row.location ?? undefined,
    content: row.content,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at),
    isDeleted: Boolean(row.is_deleted),
  };
}

export class HighlightRepository {
  static create(data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Highlight {
    const now = new Date().toISOString();

    const result = getDatabase()
      .prepare(
        `INSERT INTO highlights (book_id, date, location, content, created_at, is_deleted) VALUES (?, ?, ?, ?, ?, 0)`
      )
      .run(data.bookId, data.date.toISOString(), data.location ?? null, data.content, now);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  static findById(id: number): Highlight | null {
    const row = getDatabase()
      .prepare(`SELECT * FROM highlights WHERE id = ? AND is_deleted = 0`)
      .get(id);
    return row ? mapRowToHighlight(row) : null;
  }

  static findByContent(content: string): Highlight | null {
    const row = getDatabase()
      .prepare(`SELECT * FROM highlights WHERE content = ? AND is_deleted = 0`)
      .get(content);
    return row ? mapRowToHighlight(row) : null;
  }

  static findByBook(bookId: number, showDeleted: boolean = false): Highlight[] {
    const deletedBit = showDeleted ? 1 : 0;
    return getDatabase()
      .prepare(`SELECT * FROM highlights WHERE book_id = ? AND is_deleted <= ? ORDER BY date DESC`)
      .all(bookId, deletedBit)
      .map(mapRowToHighlight);
  }

  static update(
    id: number,
    data: Partial<Omit<Highlight, 'id' | 'createdAt' | 'isDeleted'>>
  ): Highlight | null {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date.toISOString());
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    getDatabase()
      .prepare(`UPDATE highlights SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`)
      .run(...values);

    return this.findById(id);
  }

  static softDelete(id: number): boolean {
    const result = getDatabase()
      .prepare(`UPDATE highlights SET is_deleted = 1, updated_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), id);

    return result.changes > 0;
  }

  static restore(id: number): boolean {
    const result = getDatabase()
      .prepare(`UPDATE highlights SET is_deleted = 0, updated_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), id);
    return result.changes > 0;
  }

  static hardDelete(id: number): boolean {
    const result = getDatabase().prepare(`DELETE FROM highlights WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  static highlightExists(bookId: number, content: string): boolean {
    const stmt = getDatabase().prepare(
      `SELECT 1 FROM highlights WHERE book_id = ? AND content = ? LIMIT 1`
    );

    const row = stmt.get(bookId, content.trim());
    return !!row;
  }
}
