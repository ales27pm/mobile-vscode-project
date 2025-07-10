import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = parseInt(process.env.PORT || '4000', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
export const ROOT_DIR = process.cwd();
