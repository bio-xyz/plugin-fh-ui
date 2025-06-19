import { useEffect } from 'react';
import SocketIOManager from '@/lib/socketio-manager';
import { useAppDispatch } from '@/store/hooks';
import { setConnected } from '@/store/connectionSlice';
import { randomUUID } from '@/lib/utils';

const SocketInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const manager = SocketIOManager.getInstance();
    const id = randomUUID();
    manager.initialize(id);

    const handleConnect = () => dispatch(setConnected(true));
    const handleDisconnect = () => dispatch(setConnected(false));

    manager.on('connect', handleConnect);
    manager.on('disconnect', handleDisconnect);

    return () => {
      manager.off('connect', handleConnect);
      manager.off('disconnect', handleDisconnect);
      manager.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default SocketInitializer;
