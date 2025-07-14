import * as vscode from 'vscode';
import { Express, Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { updateStatusBar } from '../ui/statusBar';

export interface AuthContext {
    jwtSecret: string;
    pairingToken: string;
    isPaired: boolean;
}

/**
 * Ensures a persistent JWT secret exists and creates the authentication context.
 * If no secret is found, the user is prompted to generate one which is then
 * stored in the global settings. If the user cancels, `null` is returned and
 * server startup should be aborted.
 */
export async function ensureAuthContext(): Promise<AuthContext | null> {
    const config = vscode.workspace.getConfiguration('mobile-vscode-server');
    let jwtSecret = config.get<string>('jwtSecret');

    if (!jwtSecret) {
        const action = await vscode.window.showWarningMessage(
            'MobileVSCode requires a persistent secret key to secure sessions. Without it, you will need to re-pair your mobile device every time you restart VS Code.',
            'Create & Save Secret',
            'Cancel'
        );

        if (action !== 'Create & Save Secret') {
            vscode.window.showErrorMessage('MobileVSCode Server startup cancelled. A secret key is required.');
            return null;
        }

        jwtSecret = randomBytes(32).toString('hex');
        await config.update('jwtSecret', jwtSecret, vscode.ConfigurationTarget.Global);
        await vscode.window.showInformationMessage('A new persistent secret has been generated and saved to your global settings.');
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

export type RequestWithUser = Request & { user?: string | jwt.JwtPayload };

export function pairingMiddleware(authContext: AuthContext) {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
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
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
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
