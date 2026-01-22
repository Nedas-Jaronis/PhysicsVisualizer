import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { b } from '../baml_client/index.js';
import { loadAllSchemas } from './schemaLoader.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n[INCOMING REQUEST]`);
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Path: ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log(`   JSON Data:`, req.body);
  }
  console.log('-'.repeat(30));
  next();
});

// Clean and parse JSON that might be wrapped in markdown code blocks
function cleanAndParseJson(rawData: unknown): Record<string, unknown> | null {
  if (typeof rawData === 'object' && rawData !== null) {
    return rawData as Record<string, unknown>;
  }

  if (typeof rawData !== 'string') {
    return rawData as Record<string, unknown> | null;
  }

  let cleanedData = rawData.trim();

  // Check if it starts with ```json and ends with ```
  if (cleanedData.startsWith('```json') && cleanedData.endsWith('```')) {
    const jsonContent = cleanedData.slice(7, -3).trim();
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      console.log(`[ERROR] Failed to parse JSON content: ${e}`);
      return null;
    }
  }

  // Check if it starts with ``` and ends with ```
  if (cleanedData.startsWith('```') && cleanedData.endsWith('```')) {
    const jsonContent = cleanedData.slice(3, -3).trim();
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      console.log(`[ERROR] Failed to parse JSON content: ${e}`);
      return null;
    }
  }

  // Try to parse as regular JSON
  try {
    return JSON.parse(cleanedData);
  } catch (e) {
    console.log(`[ERROR] Failed to parse as regular JSON: ${e}`);
    return null;
  }
}

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  console.log('[ROOT] ENDPOINT HIT!');
  res.json({
    message: 'Express server is running!',
    available_endpoints: ['/api/health', '/api/test', '/api/solve'],
    baml_available: true
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  console.log('[HEALTH CHECK] ENDPOINT HIT!');
  res.json({
    status: 'healthy',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    server_info: {
      runtime: 'Node.js',
      port: PORT,
      baml_available: true
    }
  });
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  console.log('[TEST] ENDPOINT HIT!');
  res.json({
    message: 'Test successful!',
    time: new Date().toISOString(),
    baml_available: true
  });
});

// Solve problem endpoint
app.post('/api/solve', async (req: Request, res: Response) => {
  console.log('[SOLVE] ENDPOINT HIT!');

  try {
    const { problem } = req.body;
    if (!problem) {
      res.status(400).json({ error: 'No problem provided in request' });
      return;
    }

    console.log(`[PROCESSING] Problem: ${problem}`);

    // Run animation extraction and problem solving in PARALLEL
    // These are independent and can run simultaneously
    console.log('[PARALLEL] Starting animation extraction and problem solving simultaneously...');

    const animationPromise = (async () => {
      // Step 1: Extract animation data from problem
      console.log('[STEP 1] Extracting animation data...');
      const animationData = await b.Extract_animation_data(problem);
      const animationDict = animationData as unknown as Record<string, unknown>;
      console.log('[OK] Animation data extracted');

      // Step 2: Load and process schemas
      console.log('[STEP 2] Loading schemas...');
      const allSchemas = loadAllSchemas(animationDict);
      console.log('[OK] Schemas loaded successfully');

      // Step 3: Update animation data with problem-specific values
      console.log('[STEP 3] Updating animation data with problem values...');
      const jsonString = JSON.stringify(allSchemas);
      const updatedAnimationDataRaw = await b.Update_Animation_Data(jsonString, problem);

      let updatedAnimationData = cleanAndParseJson(updatedAnimationDataRaw);

      if (updatedAnimationData === null) {
        console.log('[WARN] Failed to parse updated animation data, using fallback');
        updatedAnimationData = allSchemas;
      } else {
        console.log('[OK] Successfully parsed updated animation data');
      }

      return updatedAnimationData;
    })();

    const problemPromise = (async () => {
      // Step 4: Extract problem data (solution steps, formulas, etc.)
      console.log('[STEP 4] Extracting problem solution data...');
      try {
        const problemData = await b.Extract_ProblemData(problem);
        console.log('[OK] Problem solution data extracted');
        return problemData as unknown as Record<string, unknown>;
      } catch (e) {
        console.log(`[WARN] Problem data extraction failed: ${e}`);
        console.log('[FALLBACK] Using default problem data structure');
        return {
          problem: problem,
          formulas: "See the physics formulas relevant to this problem type.",
          stepByStep: "- Step 1: Identify the known quantities from the problem\n- Step 2: Determine what needs to be found\n- Step 3: Select appropriate physics equations\n- Step 4: Solve for the unknown values\n- Step 5: Check units and verify the answer makes physical sense",
          solution: "Please review the step-by-step solution above. The simulation on the next page will visualize this problem."
        };
      }
    })();

    // Wait for both to complete
    let updatedAnimationData: Record<string, unknown>;
    let problemDict: Record<string, unknown>;

    try {
      [updatedAnimationData, problemDict] = await Promise.all([animationPromise, problemPromise]);
    } catch (e) {
      console.log(`[ERROR] Parallel execution failed: ${e}`);
      res.status(500).json({
        error: 'Problem processing failed',
        message: String(e)
      });
      return;
    }

    console.log('[OK] All parallel tasks completed');

    // Ensure we have a proper object for animation_data
    const finalAnimationData = typeof updatedAnimationData === 'object' && updatedAnimationData !== null
      ? updatedAnimationData
      : allSchemas;

    const responseData = {
      status: 'success',
      animation_data: finalAnimationData,
      problem_solution: problemDict,
      message: 'Problem processed successfully'
    };

    console.log(`[DONE] Final response animation_data keys: ${Object.keys(finalAnimationData)}`);

    res.json(responseData);
  } catch (e) {
    console.log(`[ERROR] Unexpected error in solve_problem: ${e}`);
    res.status(500).json({
      error: String(e)
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(`[ERROR] Unhandled exception: ${err.message}`);
  console.log(`[TRACEBACK] ${err.stack}`);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('[STARTUP] Starting Express server...');
  console.log('[INFO] BAML client integration enabled');
  console.log(`[INFO] Server running on http://localhost:${PORT}`);
});
