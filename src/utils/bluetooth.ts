// Web Bluetooth Driver for WhizToys Mat (WTS2)

export interface MatCoordinates {
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  zone: number; // 1 to 9 maps to the 3x3 grid
  pressure: number; // sum of s0 + s1 + s2 + s3 (0 to 12) or average
  s0: number; // raw pressure sensors within the zone (0-3)
  s1: number;
  s2: number;
  s3: number;
}

export type BluetoothState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type BluetoothDataCallback = (data: MatCoordinates[]) => void;

class WhizToysBluetoothManager {
  private device: any = null;
  private characteristic: any = null;
  private ledCharacteristic: any = null;
  private state: BluetoothState = 'disconnected';
  private callbacks: Set<BluetoothDataCallback> = new Set();
  private lastError: string | null = null;

  // UUID registers requested by WhizToys
  private readonly SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
  private readonly SENSOR_CHARACTERISTIC_UUID = '0000fee2-0000-1000-8000-00805f9b34fb';
  private readonly LED_CHARACTERISTIC_UUID = '0000fee3-0000-1000-8000-00805f9b34fb';

  private onStateChangeCallback: ((state: BluetoothState) => void) | null = null;

  subscribe(callback: BluetoothDataCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  registerStateListener(callback: (state: BluetoothState) => void) {
    this.onStateChangeCallback = callback;
    callback(this.state);
  }

  getState() {
    return this.state;
  }

  getLastError() {
    return this.lastError;
  }

  private updateState(newState: BluetoothState, errorMsg?: string) {
    this.state = newState;
    if (errorMsg) this.lastError = errorMsg;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  async connect() {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      this.updateState('error', '此瀏覽器不支援 Web Bluetooth，請開啟 Google Chrome、Microsoft Edge 或使用 Android 平板電腦。');
      throw new Error('Web Bluetooth not supported');
    }

    try {
      this.updateState('connecting');

      // 1. requestDevice filtering for "WTS2" name with all required optionalServices
      console.log('Searching for WhizToys device "WTS2"...');
      const device = await nav.bluetooth.requestDevice({
        filters: [{ name: 'WTS2' }],
        optionalServices: [
          '0000fee0-0000-1000-8000-00805f9b34fb',
          '00001800-0000-1000-8000-00805f9b34fb',
          '00001801-0000-1000-8000-00805f9b34fb'
        ]
      });

      this.device = device;
      device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      // 2. Connect GATT Server
      console.log('Connecting to GATT Server...');
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('GATT connection failed');
      }

      // 3. Request primary custom service
      console.log('Fetching service fee0...');
      const service = await server.getPrimaryService(this.SERVICE_UUID);

      // 4. Request characteristics fee2 (sensor data) and fee3 (LED feedback)
      console.log('Fetching characteristics fee2 and fee3...');
      const sensorCharacteristic = await service.getCharacteristic(this.SENSOR_CHARACTERISTIC_UUID);
      this.characteristic = sensorCharacteristic;

      try {
        const ledCharacteristic = await service.getCharacteristic(this.LED_CHARACTERISTIC_UUID);
        this.ledCharacteristic = ledCharacteristic;
        console.log('LED feedback characteristic (fee3) initialized.');
      } catch (ledErr) {
        console.warn('Optional LED characteristic (fee3) could not be fetched:', ledErr);
      }

      // 5. Start notifications and register event listener
      await sensorCharacteristic.startNotifications();
      sensorCharacteristic.addEventListener('characteristicvaluechanged', this.handleDataNotification.bind(this));

      console.log('WhizToys Mat successfully paired!');
      this.updateState('connected');
    } catch (err: any) {
      console.error('Bluetooth connection failed:', err);
      this.updateState('error', err.message || '連線中斷或使用者取消配對');
      throw err;
    }
  }

  private handleDisconnect() {
    console.warn('WhizToys Mat disconnected');
    this.device = null;
    this.characteristic = null;
    this.ledCharacteristic = null;
    this.updateState('disconnected');
  }

  async disconnect() {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.handleDisconnect();
  }

  // Byte Stream Notification Parser
  private handleDataNotification(event: Event) {
    const target = event.target as any;
    const value = target.value;
    if (!value) return;

    const data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const parsedCoordinates: MatCoordinates[] = [];

    // The document details data is loaded in 2-byte pairs:
    // Every 2 Bytes represents [Position Byte, Pressure Byte]
    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 >= data.length) break;

      const positionByte = data[i];
      const pressureByte = data[i + 1];

      // 1st Byte (Position info): Bitwise split 
      // Higher 4 bits: Row
      // Lower 4 bits: Col 
      const row = (positionByte >> 4) & 0x0F;
      const col = positionByte & 0x0F;

      // Validate coordinates are within 3x3 layout (0,1,2 range)
      if (row >= 0 && row <= 2 && col >= 0 && col <= 2) {
        // Map row and col directly to 1-9 UI numbering representation (left-to-right top-to-bottom layout):
        // (0,0)->1, (0,1)->2, (0,2)->3
        // (1,0)->4, (1,1)->5, (1,2)->6
        // (2,0)->7, (2,1)->8, (2,2)->9
        const zone = (row * 3) + col + 1;

        // 2nd Byte (Pressure info): 
        // 4 separate sensor nodes mapped inside this zone (2-bit values s0, s1, s2, s3)
        const s0 = pressureByte & 0x03;          // bits 0-1
        const s1 = (pressureByte >> 2) & 0x03;   // bits 2-3
        const s2 = (pressureByte >> 4) & 0x03;   // bits 4-5
        const s3 = (pressureByte >> 6) & 0x03;   // bits 6-7

        const totalPressure = s0 + s1 + s2 + s3;

        parsedCoordinates.push({
          row,
          col,
          zone,
          pressure: totalPressure,
          s0,
          s1,
          s2,
          s3
        });
      }
    }

    if (parsedCoordinates.length > 0) {
      // Broadcast parsed real foot pressure signals to all subscribers
      this.callbacks.forEach(cb => cb(parsedCoordinates));
    }
  }

  /**
   * Sends LED status synchronization to the physical mat (WTS2) using characteristic fee3.
   * Map input zones [1-9] to bytes to toggle LED hardware lights instantly.
   */
  async sendLedFeedback(zones: number[]) {
    if (!this.ledCharacteristic) return;
    try {
      // Simple bitwise LED mapping (9 bits for 9 zones)
      let bitmask = 0;
      zones.forEach(z => {
        if (z >= 1 && z <= 9) {
          bitmask |= (1 << (z - 1));
        }
      });
      
      const payload = new Uint8Array([bitmask & 0xFF, (bitmask >> 8) & 0xFF]);
      await this.ledCharacteristic.writeValueWithoutResponse(payload);
    } catch (err) {
      console.warn('Unable to write LED signal to WTS2:', err);
    }
  }
}

export const bluetoothManager = new WhizToysBluetoothManager();
