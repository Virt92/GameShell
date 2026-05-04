import express from 'express';
import { io, Socket } from 'socket.io-client';
import mqtt from 'mqtt';

/**
 * GameShell Local Hub
 *
 * Runs inside the club's local network on a dedicated mini-PC or server.
 * Responsibilities:
 * - Bridges cloud backend <-> local devices
 * - Controls PS5 via playactor (wake/standby over network)
 * - Controls power relays via MQTT/Tasmota
 * - Manages HDMI-CEC via Raspberry Pi
 * - Caches session data for offline mode
 * - Serves game files to PCs (LAN game cache)
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const PORT = parseInt(process.env.PORT || '9200');

const app = express();
app.use(express.json());

// Connect to cloud backend via WebSocket
const socket: Socket = io(`${BACKEND_URL}/ws`, {
  reconnection: true,
  reconnectionDelay: 5000,
});

socket.on('connect', () => {
  console.log('Connected to GameShell Backend');
});

socket.on('host:status', async (data: any) => {
  console.log('Received host command:', data);

  const { command, hostId } = data;

  if (command?.startsWith('playactor:')) {
    const action = command.split(':')[1];
    await handlePlayactor(data.ipAddress, action);
  }

  if (command?.startsWith('tasmota:')) {
    const action = command.split(':')[1];
    handleTasmota(data.topic, action);
  }

  if (command?.startsWith('cec:')) {
    const action = command.split(':')[1];
    handleCec(data.cecDeviceId, action, data.payload);
  }
});

// MQTT client for Tasmota relays
const mqttClient = mqtt.connect(MQTT_URL);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('tele/#'); // Tasmota telemetry
});

mqttClient.on('message', (topic: string, message: Buffer) => {
  console.log(`MQTT [${topic}]: ${message.toString()}`);
});

// Playactor (PS5 control)
async function handlePlayactor(ip: string, action: string) {
  try {
    // Dynamic import since playactor is ESM-only
    const { Device } = await import('playactor');
    const device = new Device(ip);

    if (action === 'wake') {
      await device.wake();
      console.log(`PS5 ${ip}: woke up`);
    } else if (action === 'standby') {
      await device.standby();
      console.log(`PS5 ${ip}: sent to standby`);
    }
  } catch (err) {
    console.error(`Playactor error for ${ip}:`, err);
  }
}

// Tasmota relay control
function handleTasmota(topic: string, action: string) {
  const command = action === 'on' ? 'ON' : 'OFF';
  mqttClient.publish(`cmnd/${topic}/Power`, command);
  console.log(`Tasmota ${topic}: ${command}`);
}

// HDMI-CEC control (via cec-controller or cec-client CLI)
function handleCec(deviceId: string, action: string, payload?: any) {
  // In production, this would use cec-controller or spawn cec-client
  console.log(`CEC device ${deviceId}: ${action}`, payload);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    backend: socket.connected ? 'connected' : 'disconnected',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected',
  });
});

// Start
app.listen(PORT, () => {
  console.log(`GameShell Local Hub running on port ${PORT}`);
});
