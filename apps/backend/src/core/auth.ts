import * as vscode from 'vscode';
import { Express, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { updateStatusBar } from '../ui/statusBar';

export interface AuthContext {
    jwtSecret: string;
    pairingToken: string;
    isPaired: boolean;
}

export function createAuthContext(): AuthContext {
    const config = vscode.workspace.getConfiguration('mobile-vscode-server');
    let jwtSecret = config.get<string>('jwtSecret');

    if (!jwtSecret) {
        jwtSecret = randomBytes(32).toString('hex');
        console.warn('No persistent JWT secret found in settings. Generating a temporary secret for this session.');
    }

    const newPairingToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tooltip = `Pairing Token: ${newPairingToken}`;
    
    updateStatusBar(true, tooltip);
    vscode.window.showInformationMessage(`MobileVSCode Pairing Token: ${newPairingToken}`);
    
    return {
        jwtSecret,
        pairingToken: newPairingToken,
        isPaired: false,
    };
}

// Extend the Express Request type to include the user payload
declare module 'express-serve-static-core' {
    interface Request {
        user?: string | jwt.JwtPayload
    }
}

export function pairingMiddleware(authContext: AuthContext) {
    return (req: Request, res: any, next: any) => {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        
        const { operationName, variables } = req.body;
        if (operationName !== 'pairWithServer') {
            return next();
        }

        if (authContext.isPaired) {
            return res.status(403).json({ error: 'Server already paired' });
        }

        if (variables?.pairingToken !== authContext.pairingToken) {
            return res.status(401).json({ error: 'Invalid pairing token' });
        }

        authContext.isPaired = true;
        const clientToken = jwt.sign({ paired: true }, authContext.jwtSecret, { expiresIn: '30d' });

        updateStatusBar(true, 'Client Paired');
        vscode.window.showInformationMessage('MobileVSCode Client Paired Successfully.');

        return res.json({ data: { pairWithServer: clientToken } });
    };
}

export function jwtAuthMiddleware(authContext: AuthContext) {
    return (req: Request, res: any, next: any) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Malformed or missing Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        try {
            const decoded = jwt.verify(token, authContext.jwtSecret);
            req.user = decoded;
            next();
        } catch {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    };
}

export function setupAuthMiddleware(app: Express, authContext: AuthContext) {
    app.use('/graphql', pairingMiddleware(authContext));
    app.use('/graphql', jwtAuthMiddleware(authContext));
}
