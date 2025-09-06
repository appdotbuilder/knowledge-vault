import { z } from 'zod';

// Data type enum for different content types
export const dataTypeSchema = z.enum(['file', 'text', 'document']);
export type DataType = z.infer<typeof dataTypeSchema>;

// Processing status enum
export const processingStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type ProcessingStatus = z.infer<typeof processingStatusSchema>;

// File upload schema
export const fileUploadSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  upload_path: z.string(),
  data_type: dataTypeSchema,
  processing_status: processingStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

// Text content schema
export const textContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  content_hash: z.string(),
  data_type: dataTypeSchema,
  processing_status: processingStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type TextContent = z.infer<typeof textContentSchema>;

// Vector embeddings schema
export const vectorEmbeddingSchema = z.object({
  id: z.number(),
  content_id: z.number(), // References either file_upload or text_content
  content_type: dataTypeSchema,
  embedding_vector: z.array(z.number()), // Vector representation
  chunk_index: z.number().int(), // For large content split into chunks
  chunk_text: z.string(),
  created_at: z.coerce.date()
});

export type VectorEmbedding = z.infer<typeof vectorEmbeddingSchema>;

// Usage statistics schema
export const usageStatSchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  total_files_uploaded: z.number().int(),
  total_text_entries: z.number().int(),
  total_data_processed_mb: z.number(),
  total_embeddings_created: z.number().int(),
  storage_used_mb: z.number(),
  created_at: z.coerce.date()
});

export type UsageStat = z.infer<typeof usageStatSchema>;

// Input schemas for creating content

export const createFileUploadInputSchema = z.object({
  filename: z.string(),
  original_name: z.string(),
  file_size: z.number().positive(),
  mime_type: z.string(),
  upload_path: z.string(),
  data_type: dataTypeSchema.default('file')
});

export type CreateFileUploadInput = z.infer<typeof createFileUploadInputSchema>;

export const createTextContentInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  data_type: dataTypeSchema.default('text')
});

export type CreateTextContentInput = z.infer<typeof createTextContentInputSchema>;

export const createVectorEmbeddingInputSchema = z.object({
  content_id: z.number(),
  content_type: dataTypeSchema,
  embedding_vector: z.array(z.number()),
  chunk_index: z.number().int().nonnegative(),
  chunk_text: z.string()
});

export type CreateVectorEmbeddingInput = z.infer<typeof createVectorEmbeddingInputSchema>;

// Update schemas

export const updateProcessingStatusInputSchema = z.object({
  id: z.number(),
  status: processingStatusSchema,
  content_type: dataTypeSchema
});

export type UpdateProcessingStatusInput = z.infer<typeof updateProcessingStatusInputSchema>;

// Search and query schemas

export const searchQuerySchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().default(10),
  similarity_threshold: z.number().min(0).max(1).default(0.7)
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Dashboard statistics response schema
export const dashboardStatsSchema = z.object({
  total_files: z.number().int(),
  total_text_entries: z.number().int(),
  total_embeddings: z.number().int(),
  total_storage_mb: z.number(),
  processing_queue_size: z.number().int(),
  recent_uploads: z.number().int(),
  daily_usage: z.array(z.object({
    date: z.string(),
    uploads: z.number().int(),
    storage_mb: z.number()
  }))
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;