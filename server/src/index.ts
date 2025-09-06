import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createFileUploadInputSchema,
  createTextContentInputSchema,
  createVectorEmbeddingInputSchema,
  updateProcessingStatusInputSchema,
  searchQuerySchema
} from './schema';

// Import handlers
import { createFileUpload } from './handlers/create_file_upload';
import { createTextContent } from './handlers/create_text_content';
import { createVectorEmbedding } from './handlers/create_vector_embedding';
import { updateProcessingStatus } from './handlers/update_processing_status';
import { getDashboardStats } from './handlers/get_dashboard_stats';
import { searchContent } from './handlers/search_content';
import { getAllFiles } from './handlers/get_all_files';
import { getAllTextContent } from './handlers/get_all_text_content';
import { getProcessingQueue } from './handlers/get_processing_queue';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Content creation endpoints
  createFileUpload: publicProcedure
    .input(createFileUploadInputSchema)
    .mutation(({ input }) => createFileUpload(input)),

  createTextContent: publicProcedure
    .input(createTextContentInputSchema)
    .mutation(({ input }) => createTextContent(input)),

  createVectorEmbedding: publicProcedure
    .input(createVectorEmbeddingInputSchema)
    .mutation(({ input }) => createVectorEmbedding(input)),

  // Status update endpoints
  updateProcessingStatus: publicProcedure
    .input(updateProcessingStatusInputSchema)
    .mutation(({ input }) => updateProcessingStatus(input)),

  // Data retrieval endpoints
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),

  getAllFiles: publicProcedure
    .query(() => getAllFiles()),

  getAllTextContent: publicProcedure
    .query(() => getAllTextContent()),

  getProcessingQueue: publicProcedure
    .query(() => getProcessingQueue()),

  // Search functionality
  searchContent: publicProcedure
    .input(searchQuerySchema)
    .query(({ input }) => searchContent(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`Knowledge Management TRPC server listening at port: ${port}`);
  console.log(`Available endpoints:`);
  console.log(`- POST /createFileUpload - Upload file metadata`);
  console.log(`- POST /createTextContent - Add text content`);
  console.log(`- POST /createVectorEmbedding - Store embeddings`);
  console.log(`- POST /updateProcessingStatus - Update processing status`);
  console.log(`- GET /getDashboardStats - Get dashboard statistics`);
  console.log(`- GET /getAllFiles - List all uploaded files`);
  console.log(`- GET /getAllTextContent - List all text content`);
  console.log(`- GET /getProcessingQueue - View processing queue`);
  console.log(`- GET /searchContent - Search vector database`);
}

start();