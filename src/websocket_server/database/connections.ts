import { WebSocket as WsWebSocket } from 'ws';

class ConnectionDB {
  private connections = new Map<string, WsWebSocket>();

  addConnection(userId: string, ws: WsWebSocket) {
    this.connections.set(userId, ws);
    console.log('active connections count: ', this.connections.size);
  }

  removeConnectionByUserId(userId: string) {
    this.connections.delete(userId);
  }

  findSocketByUserId(userId: string): WsWebSocket | null {
    return this.connections.get(userId) || null;
  }

  findUserIdBySocket(ws: WsWebSocket): string | null {
    for (const [userId, connectionWs] of this.connections.entries()) {
      if (connectionWs === ws) {
        return userId;
      }
    }
    return null;
  }

  getAllConnections() {
    return Array.from(this.connections.values());
  }
}

const connectionDB = new ConnectionDB();

export { connectionDB };