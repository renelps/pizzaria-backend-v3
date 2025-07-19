import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendOrderStatusUpdate(orderId: number, status: string) {
    this.server.to(`order_${orderId}`).emit('orderStatusUpdate', { orderId, status });
  }

  @SubscribeMessage('subscribeOrder')
  handleSubscribeOrder(client: Socket, @MessageBody() orderId: number) {
    client.join(`order_${orderId}`);
    client.emit('subscribed', `Subscribed to order ${orderId}`);
  }
}
