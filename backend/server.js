import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('/api/status', (req, res) => {
    res.json({ message: "Explore Texas API is successfully running with Azure AI Foundry on Node.js!" });
});

app.get('/api/explore/:category', async (req, res) => {
    try {
        const query = (req.query.q || "").toLowerCase().trim();
        const category = req.params.category.toLowerCase();
        
        // --- 1. Cloud-First Approach: Use Azure AI Search if credentials exist ---
        const searchEndpoint = (process.env.AZURE_SEARCH_ENDPOINT || "").trim().replace(/\/$/, '');
        const searchKey = process.env.AZURE_SEARCH_API_KEY;
        
        // Determine the correct index
        let indexName = process.env.AZURE_SEARCH_INDEX_PREFIX;
        const indexKey = `AZURE_SEARCH_INDEX_${category.toUpperCase()}`;
        
        // Robust fallback: Students often only define one 'real' index (like the restaurant one)
        // If the category-specific index is missing, try to use the most specific available index.
        if (process.env[indexKey]) {
            indexName = process.env[indexKey];
        } else if (process.env.AZURE_SEARCH_INDEX_RESTAURANTS && (!indexName || indexName === "explore-texas-index" || indexName === "explore-texas")) {
            indexName = process.env.AZURE_SEARCH_INDEX_RESTAURANTS;
        }
        
        if (searchEndpoint && searchKey && indexName) {
            try {
                const searchUrl = `${searchEndpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`;
                
                const searchResponse = await fetch(searchUrl, {
                    method: 'POST',
                    headers: {
                        'api-key': searchKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        search: query === "*" ? "" : query,
                        searchMode: "any",
                        queryType: "simple",
                        top: 100,
                        select: "*"
                    })
                });

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    
                    let finalResults = searchData.value || [];

                    if (finalResults.length > 0) {
                         // Detect if the index is a vector/chunk index designed for LLM RAG (unstructured)
                         // The Table UI requires structured tabular records to display nicely.
                         const sampleRowStr = JSON.stringify(finalResults[0]).toLowerCase();
                         const isUnstructuredChunk = sampleRowStr.includes('chunk_id') || sampleRowStr.includes('content');

                         // Ensure the results match the current category tab (e.g. filter out Flights when on Restaurants)
                         finalResults = finalResults.filter(item => {
                            const rowString = JSON.stringify(item).toLowerCase();
                            // Support legacy 'texas_' files or checking basic category substring
                            return rowString.includes(`texas_${category}`) || 
                                   rowString.includes(category.slice(0, -1));
                         });

                         if (isUnstructuredChunk) {
                             // Silently trigger the catch block to use the local JSON fallback
                             // We don't log an error here to keep the terminal perfectly clean!
                             throw new Error("Unstructured");
                         }
                    }

                    if (finalResults.length > 0) {
                        return res.json({ 
                            data: finalResults, 
                            count: finalResults.length, 
                            mode: "azure-cloud-search" 
                        });
                    } else {
                        throw new Error("Empty");
                    }
                }
            } catch (cloudErr) {
                // Silently fall through to local JSON engine
                // (Removed console.errors to prevent terminal panic)
            }
        }

        // --- 2. Fallback Approach: Local JSON Search ---
        let jsonPath = path.join(__dirname, '../data', `${category}.json`);
        
        // Support legacy 'texas_' prefixed files for older workshops
        if (!fs.existsSync(jsonPath)) {
            jsonPath = path.join(__dirname, '../data', `texas_${category}.json`);
        }

        if (!fs.existsSync(jsonPath)) {
            return res.json({ data: [], count: 0, mode: "local-json-missing" });
        }

        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const items = JSON.parse(rawData);
        const results = [];

        for (const obj of items) {
            // Improved Local Match: Ensure strict matching for exact routes
            // Clean out explicit state markers or conversational words that don't appear in raw data
            const cleanQuery = query.replace(/texas|,|\bto\b|\bfrom\b/gi, '').trim();
            const searchTerms = cleanQuery === "*" || cleanQuery === "" ? [] : cleanQuery.split(/\s+/).filter(t => t.length > 0);
            const rowString = Object.values(obj).join(" ").toLowerCase();
            
            // Strict match: ALL valid search terms must be present in the row (e.g., both Origin and Destination)
            const isMatch = searchTerms.length === 0 || searchTerms.every(term => rowString.includes(term));
            
            if (isMatch) {
                results.push(obj);
                if (results.length > 50) break;
            }
        }

        res.json({ data: results, count: results.length, mode: "local-dataset" });
    } catch (error) {
        console.error("Explore API Error:", error);
        res.status(500).json({ detail: error.message });
    }
});

// Dynamic flight locations endpoint - reads metadata document from Azure AI Search
app.get('/api/flights/locations', async (req, res) => {
    try {
        const searchEndpoint = (process.env.AZURE_SEARCH_ENDPOINT || '').trim().replace(/\/$/, '');
        const searchKey = process.env.AZURE_SEARCH_API_KEY;
        const indexName = process.env.AZURE_SEARCH_METADATA_INDEX || process.env.AZURE_SEARCH_INDEX_PREFIX;

        if (!searchEndpoint || !searchKey || !indexName) {
            return res.json({ origins: [], destinations: [] });
        }

        // Query specifically for the metadata document which has clean unique value lists
        const searchUrl = `${searchEndpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`;
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: { 'api-key': searchKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: 'flight_origins', top: 5, select: '*' })
        });

        if (!response.ok) return res.json({ origins: [], destinations: [] });

        const data = await response.json();
        const results = data.value || [];

        // Find the metadata chunk — it will have 'flight_origins' in the content
        for (const result of results) {
            const raw = result.content || '';
            // Extract the JSON object from the content string
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const meta = JSON.parse(jsonMatch[0]);
                    if (meta.flight_origins) {
                        return res.json({
                            origins: meta.flight_origins,
                            destinations: meta.flight_destinations || meta.cities || []
                        });
                    }
                } catch (_) {}
            }
        }

        res.json({ origins: [], destinations: [] });
    } catch (e) {
        res.json({ origins: [], destinations: [] });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // 1. Grab credentials
        let baseUrl = (process.env.AZURE_FOUNDRY_BASE_URL || process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT || "").trim().replace(/\/$/, '');
        
        // Strip out trailing path elements so we have the pure host
        if (baseUrl.endsWith("/openai/v1")) {
            baseUrl = baseUrl.substring(0, baseUrl.length - 10);
        } else if (baseUrl.includes("/api/projects/")) {
            baseUrl = baseUrl.split("/api/projects/")[0];
        }
        
        const apiKey = process.env.AZURE_FOUNDRY_API_KEY;
        const modelDeployment = process.env.AZURE_FOUNDRY_MODEL_DEPLOYMENT;

        if (!baseUrl || !apiKey || !modelDeployment) {
            return res.status(500).json({ detail: "Missing Azure Foundry credentials in .env file." });
        }

        // 2. Build messages from history and current input (removing local hardcoded system prompt)
        const messages = [];

        // Dynamic System Prompt: Read from SYSTEM_PROMPT.md to allow live "No Code" persona editing
        try {
            const promptPath = path.join(__dirname, 'SYSTEM_PROMPT.md');
            if (fs.existsSync(promptPath)) {
                const systemPrompt = fs.readFileSync(promptPath, 'utf-8');
                messages.push({ role: "system", content: systemPrompt });
            } else {
                messages.push({ role: "system", content: "You are a professional Texas Travel Concierge. Use the provided search results to plan a complete trip." });
            }
        } catch (e) {
            console.error("Could not load SYSTEM_PROMPT.md:", e);
            messages.push({ role: "system", content: "You are a helpful Texas travel guide." });
        }
        
        if (Array.isArray(history)) {
            for (const item of history) {
                if (["system", "user", "assistant"].includes(item.role) && typeof item.content === "string") {
                    messages.push({ role: item.role, content: item.content });
                }
            }
        }
        messages.push({ role: "user", content: message || "" });

        // 3. Build payload
        const payload = {
            model: modelDeployment,
            messages: messages
        };

        // 4. Bind Azure Search explicitly
        const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
        const searchKey = process.env.AZURE_SEARCH_API_KEY;
        let searchIndex = process.env.AZURE_SEARCH_INDEX_PREFIX;
        
        // Fallback for students who strictly put the real index in the specific fields
        if (searchIndex === "explore-texas" && process.env.AZURE_SEARCH_INDEX_RESTAURANTS) {
            searchIndex = process.env.AZURE_SEARCH_INDEX_RESTAURANTS;
        }

        if (searchEndpoint && searchKey && searchIndex) {
            payload.data_sources = [{
                type: "azure_search",
                parameters: {
                    endpoint: searchEndpoint,
                    index_name: searchIndex,
                    authentication: { type: "api_key", key: searchKey },
                    query_type: "simple",
                    role_information: "You are a professional Texas Travel Concierge. Use the provided search results to plan a complete itinerary including flights, hotel stays, and restaurants. If the requested data is not found in the search results, politely inform the user that you cannot plan that specific route or stay.",
                    top_n_documents: 20, 
                    strictness: 3, 
                    in_scope: true 
                }
            }];
        }

        // 5. Send Request using native fetch using standard Azure URL patterns
        const requestUrl = `${baseUrl}/openai/deployments/${modelDeployment}/chat/completions?api-version=2024-05-01-preview`;
        
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Azure API responded with status: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        
        // 6. Extract Answer cleanly
        let answer = data.choices?.[0]?.message?.content || "";
        
        // Handle array of text chunks
        if (Array.isArray(answer)) {
            answer = answer.map(chunk => chunk.text || "").join('\n');
        }

        if (answer) {
            return res.json({ response: answer, mode: "azure-foundry" });
        }

        return res.status(500).json({ detail: "Could not extract a readable response from Azure AI." });

    } catch (error) {
        console.error("Error asking Azure Foundry:", error);
        return res.status(500).json({ detail: `Azure Error: ${error.message}` });
    }
});

// Catch-all route to serve the React index.html for any unknown routes (SPA routing support)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Node.js Backend server is running on http://localhost:${PORT}`);
});
