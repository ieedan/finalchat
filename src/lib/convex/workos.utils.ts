import { v } from 'convex/values';
import { customQuery } from 'convex-helpers/server/customFunctions';
import { query } from './_generated/server';

export const authQuery = customQuery(query,{
    args: { sessionCookie: v.string() },
    input: async (ctx, args) => {
        
    }
})