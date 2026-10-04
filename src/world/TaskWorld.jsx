import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createWorld } from './world.js';
const TaskWorld = forwardRef(function TaskWorld(props, ref) {
  const host = useRef(null), controller = useRef(null), latest = useRef(props);
  latest.current = props;
  useImperativeHandle(ref, () => ({
    capturePointer: () => controller.current?.capturePointer(),
    releasePointer: () => controller.current?.releasePointer(),
    resetView: () => controller.current?.resetView(),
  }), []);
  useEffect(() => {
    try { controller.current = createWorld(host.current, latest.current); }
    catch { latest.current.onReady?.(false); }
    return () => { controller.current?.dispose(); controller.current = null; };
  }, []);
  useEffect(() => { controller.current?.update(props); });
  return <div ref={host} style={{position:'absolute',inset:0,touchAction:'none'}} aria-label="Begehbarer Neon-Hof" />;
});
export default TaskWorld;
