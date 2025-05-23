// pages/api/logModels.js
import prisma from '@/lib/prisma'; 

export async function GET()  {
  try {
    // Get all available models in Prisma
    const models = Object.keys(prisma);
    console.log('Available models:', models);  // Logs to the server console
    
    // Send the list of models in the response
    return Response.json({ models });
  } catch (error) {
    console.error('Error logging models:', error);
    return new Response(JSON.stringify({ error: "Invalid or missing date_from" }), { status: 400 })
  }
}
