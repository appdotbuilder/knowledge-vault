import { serial, text, pgTable, timestamp, numeric, integer, pgEnum, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const dataTypeEnum = pgEnum('data_type', ['file', 'text', 'document']);
export const processingStatusEnum = pgEnum('processing_status', ['pending', 'processing', 'completed', 'failed']);

// File uploads table
export const fileUploadsTable = pgTable('file_uploads', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  file_size: integer('file_size').notNull(), // Size in bytes
  mime_type: text('mime_type').notNull(),
  upload_path: text('upload_path').notNull(),
  data_type: dataTypeEnum('data_type').notNull().default('file'),
  processing_status: processingStatusEnum('processing_status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Text content table
export const textContentsTable = pgTable('text_contents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  content_hash: text('content_hash').notNull(), // Hash for deduplication
  data_type: dataTypeEnum('data_type').notNull().default('text'),
  processing_status: processingStatusEnum('processing_status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Vector embeddings table - stores the processed embeddings
export const vectorEmbeddingsTable = pgTable('vector_embeddings', {
  id: serial('id').primaryKey(),
  content_id: integer('content_id').notNull(), // References either file_uploads or text_contents
  content_type: dataTypeEnum('content_type').notNull(),
  embedding_vector: json('embedding_vector').notNull(), // JSON array of numbers
  chunk_index: integer('chunk_index').notNull().default(0), // For content split into chunks
  chunk_text: text('chunk_text').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Usage statistics table - tracks daily usage metrics
export const usageStatsTable = pgTable('usage_stats', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  total_files_uploaded: integer('total_files_uploaded').notNull().default(0),
  total_text_entries: integer('total_text_entries').notNull().default(0),
  total_data_processed_mb: numeric('total_data_processed_mb', { precision: 10, scale: 2 }).notNull().default('0'),
  total_embeddings_created: integer('total_embeddings_created').notNull().default(0),
  storage_used_mb: numeric('storage_used_mb', { precision: 10, scale: 2 }).notNull().default('0'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const fileUploadsRelations = relations(fileUploadsTable, ({ many }) => ({
  embeddings: many(vectorEmbeddingsTable),
}));

export const textContentsRelations = relations(textContentsTable, ({ many }) => ({
  embeddings: many(vectorEmbeddingsTable),
}));

export const vectorEmbeddingsRelations = relations(vectorEmbeddingsTable, ({ one }) => ({
  fileUpload: one(fileUploadsTable, {
    fields: [vectorEmbeddingsTable.content_id],
    references: [fileUploadsTable.id],
  }),
  textContent: one(textContentsTable, {
    fields: [vectorEmbeddingsTable.content_id],
    references: [textContentsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type FileUpload = typeof fileUploadsTable.$inferSelect;
export type NewFileUpload = typeof fileUploadsTable.$inferInsert;

export type TextContent = typeof textContentsTable.$inferSelect;
export type NewTextContent = typeof textContentsTable.$inferInsert;

export type VectorEmbedding = typeof vectorEmbeddingsTable.$inferSelect;
export type NewVectorEmbedding = typeof vectorEmbeddingsTable.$inferInsert;

export type UsageStat = typeof usageStatsTable.$inferSelect;
export type NewUsageStat = typeof usageStatsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  fileUploads: fileUploadsTable,
  textContents: textContentsTable,
  vectorEmbeddings: vectorEmbeddingsTable,
  usageStats: usageStatsTable,
};